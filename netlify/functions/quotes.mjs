import {
  RequestError, adminErrorResponse, cleanFilename, cleanText, errorResponse,
  getAdminAccess, getSupabaseAdmin, json, logActivity, requirePermission
} from './_shared.mjs';

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const QUOTE_STATUSES = ['New', 'Reviewing', 'Quoted', 'Awaiting Customer', 'Accepted', 'Rejected', 'Expired'];
const INQUIRY_STATUSES = ['New', 'Contacted', 'Follow-up', 'Converted', 'Closed'];
const ARTWORK_BUCKET = 'quote-artwork';
const ALLOWED_FILE_EXTENSIONS = new Set(['pdf', 'ai', 'psd', 'png', 'jpg', 'jpeg']);

function mapQuote(row) {
  return {
    uuid: row.id, id: row.display_id, displayId: row.display_id,
    createdAt: row.created_at, updatedAt: row.updated_at, status: row.status,
    name: row.name, company: row.company || '', email: row.email || '', phone: row.phone,
    type: row.packaging_type, quantity: row.quantity, dimensions: row.dimensions,
    details: row.details, material: row.material, printing: row.printing,
    colors: row.colors, finish: row.finish, deliveryRequirement: row.delivery_requirement,
    file: row.file_path ? { path: row.file_path, name: row.file_name, type: row.file_type } : null,
    source: row.source, whatsappNotified: row.whatsapp_notified,
    whatsappNotificationNote: row.whatsapp_notification_note, adminNote: row.admin_note || ''
  };
}

async function findOrCreateCustomer(client, payload) {
  const email = cleanText(payload.email, 180).toLowerCase();
  const phone = cleanText(payload.phone || payload.whatsapp, 50);
  let existing = null;
  if (email) {
    const { data } = await client.from('customers').select('id').ilike('email', email).is('archived_at', null).maybeSingle();
    existing = data;
  }
  if (!existing && phone) {
    const { data } = await client.from('customers').select('id').eq('phone', phone).is('archived_at', null).maybeSingle();
    existing = data;
  }
  if (existing) return existing.id;

  const customer = {
    name: cleanText(payload.name, 120), company: cleanText(payload.company, 160), phone,
    whatsapp: cleanText(payload.whatsapp || payload.phone, 50), email
  };
  const { data, error } = await client.from('customers').insert(customer).select('id').single();
  if (!error) return data.id;
  if (error.code === '23505') {
    const query = email
      ? client.from('customers').select('id').ilike('email', email).is('archived_at', null)
      : client.from('customers').select('id').eq('phone', phone).is('archived_at', null);
    const { data: retry } = await query.limit(1).maybeSingle();
    if (retry) return retry.id;
  }
  throw new RequestError('The customer record could not be prepared.', 500);
}

async function storeAttachment(client, record, attachment, entityType = 'quote') {
  if (!attachment?.data || !attachment?.name) return record;
  const base64 = String(attachment.data).split(',').pop();
  const buffer = Buffer.from(base64 || '', 'base64');
  if (!buffer.length || buffer.length > MAX_FILE_BYTES) throw new RequestError('Attachment must be a valid file smaller than 4 MB.');
  const filename = cleanFilename(attachment.name);
  const extension = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
  if (!ALLOWED_FILE_EXTENSIONS.has(extension)) throw new RequestError('Attachment must be a PDF, AI, PSD, PNG, JPG, or JPEG file.');

  const filePath = `${entityType}/${record.id}/${crypto.randomUUID()}-${filename}`;
  const fileType = cleanText(attachment.type, 100) || 'application/octet-stream';
  const { error: uploadError } = await client.storage.from(ARTWORK_BUCKET).upload(filePath, buffer, { contentType: fileType, upsert: false });
  if (uploadError) throw new RequestError('The artwork file could not be stored. Please try again.', 500);
  const { error: attachmentError } = await client.from('attachments').insert({
    entity_type: entityType, entity_id: record.id, storage_path: filePath,
    file_name: filename, file_type: fileType, file_size: buffer.length, label: 'Customer artwork'
  });
  if (attachmentError) {
    await client.storage.from(ARTWORK_BUCKET).remove([filePath]);
    throw new RequestError('The artwork record could not be saved.', 500);
  }
  if (entityType === 'quote') {
    const { data } = await client.from('quotes').update({ file_path: filePath, file_name: filename, file_type: fileType }).eq('id', record.id).select().single();
    return data || record;
  }
  return record;
}

async function sendWhatsAppNotification(record) {
  const token = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const recipient = process.env.WHATSAPP_RECIPIENT_NUMBER;
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME;
  if (!token || !phoneNumberId || !recipient || !templateName) return { sent: false, reason: 'WhatsApp credentials or template are not configured.' };
  try {
    const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp', to: recipient.replace(/\D/g, ''), type: 'template',
        template: { name: templateName, language: { code: process.env.META_WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' }, components: [{ type: 'body', parameters: [
          { type: 'text', text: record.display_id }, { type: 'text', text: record.name || 'Customer' },
          { type: 'text', text: record.packaging_type || 'Packaging request' }, { type: 'text', text: record.quantity || 'Not specified' }
        ] }] }
      })
    });
    if (!response.ok) return { sent: false, reason: 'WhatsApp API rejected the notification.' };
    return { sent: true, reason: '' };
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return { sent: false, reason: 'WhatsApp notification could not be delivered.' };
  }
}

async function createIntake(client, payload) {
  if (cleanText(payload.website, 120)) throw new RequestError('This request could not be accepted.');
  const isInquiry = cleanText(payload.formType, 30) === 'inquiry';
  const name = cleanText(payload.name, 120);
  const company = cleanText(payload.company, 160);
  const email = cleanText(payload.email, 180).toLowerCase();
  const phone = cleanText(payload.phone, 50);
  const packagingType = cleanText(payload.type, 120);
  if (!name || !packagingType || (isInquiry ? !phone : (!company || !email || !cleanText(payload.quantity, 80)))) {
    throw new RequestError(isInquiry ? 'Please provide your name, phone number, and packaging requirement.' : 'Please complete all required quote fields.');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new RequestError('Please enter a valid email address.');

  const customerId = await findOrCreateCustomer(client, payload);
  const base = {
    customer_id: customerId, name, company, email, phone, packaging_type: packagingType,
    quantity: cleanText(payload.quantity, 80), source: isInquiry ? 'Website Inquiry' : 'Website Quote'
  };
  if (isInquiry) {
    const { data, error } = await client.from('inquiries').insert({ ...base, requirement: cleanText(payload.details, 3000) }).select().single();
    if (error) throw new RequestError('Your inquiry could not be saved. Please try again.', 500);
    await logActivity(client, null, 'inquiry', data.id, 'created', `${data.display_id} received from the website`);
    const notification = await sendWhatsAppNotification(data);
    return { id: data.display_id, uuid: data.id, type: 'inquiry', whatsappNotified: notification.sent };
  }

  const quotePayload = {
    ...base, dimensions: cleanText(payload.dimensions, 120), details: cleanText(payload.details, 3000),
    length: Number(payload.length) || null, width: Number(payload.width) || null, height: Number(payload.height) || null,
    dimension_unit: ['mm', 'cm', 'in'].includes(payload.dimensionUnit) ? payload.dimensionUnit : 'in',
    material: cleanText(payload.material, 120), printing: cleanText(payload.printing, 160),
    colors: cleanText(payload.colors, 80), finish: cleanText(payload.finish, 120),
    delivery_requirement: cleanText(payload.deliveryRequirement, 300),
    delivery_date: cleanText(payload.deliveryDate, 10) || null,
    delivery_address: cleanText(payload.deliveryAddress, 500)
  };
  let saved;
  const { data, error } = await client.from('quotes').insert(quotePayload).select().single();
  if (error) throw new RequestError('Your quote request could not be saved. Please try again.', 500);
  saved = data;
  try {
    saved = await storeAttachment(client, saved, payload.file, 'quote');
  } catch (error) {
    await client.from('quotes').delete().eq('id', saved.id);
    throw error;
  }
  await logActivity(client, null, 'quote', saved.id, 'created', `${saved.display_id} received from the website`);
  const notification = await sendWhatsAppNotification(saved);
  const { data: notified } = await client.from('quotes').update({ whatsapp_notified: notification.sent, whatsapp_notification_note: notification.reason }).eq('id', saved.id).select().single();
  const mapped = mapQuote(notified || saved);
  return { id: mapped.id, uuid: mapped.uuid, type: 'quote', whatsappNotified: mapped.whatsappNotified };
}

async function serveFile(request, client, identifier) {
  const access = await getAdminAccess(request, client);
  if (access.status !== 200) return adminErrorResponse(access);
  let query = client.from('quotes').select('id,file_path,file_name,file_type');
  query = /^[0-9a-f-]{36}$/i.test(identifier || '') ? query.eq('id', identifier) : query.eq('display_id', cleanText(identifier, 80));
  const { data: quote, error } = await query.maybeSingle();
  if (error || !quote?.file_path) return json({ error: 'File not found.' }, 404);
  const { data: file, error: downloadError } = await client.storage.from(ARTWORK_BUCKET).download(quote.file_path);
  if (downloadError || !file) return json({ error: 'File not found.' }, 404);
  return new Response(await file.arrayBuffer(), { headers: {
    'Content-Type': quote.file_type || 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${cleanFilename(quote.file_name)}"`, 'Cache-Control': 'private, no-store'
  } });
}

export default async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  try {
    const client = getSupabaseAdmin();
    const url = new URL(request.url);
    if (request.method === 'GET') {
      if (url.searchParams.get('action') === 'file') return serveFile(request, client, url.searchParams.get('id'));
      const access = await getAdminAccess(request, client);
      if (access.status !== 200) return adminErrorResponse(access);
      if (url.searchParams.get('action') === 'access') return json({ authorized: true, user: access.user, admin: access.admin });
      const { data, error } = await client.from('quotes').select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw new RequestError('Quote requests could not be loaded.', 500);
      return json({ quotes: (data || []).map(mapQuote) });
    }

    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
    const payload = await request.json();
    if (payload.action === 'submit') {
      const result = await createIntake(client, payload);
      return json({ success: true, quoteId: result.id, recordType: result.type, whatsappNotified: result.whatsappNotified }, 201);
    }

    const access = await getAdminAccess(request, client);
    if (access.status !== 200) return adminErrorResponse(access);
    requirePermission(access, 'sales');
    const table = payload.recordType === 'inquiry' ? 'inquiries' : 'quotes';
    const allowedStatuses = table === 'inquiries' ? INQUIRY_STATUSES : QUOTE_STATUSES;
    const identifier = cleanText(payload.uuid || payload.id, 80);
    const idColumn = /^[0-9a-f-]{36}$/i.test(identifier) ? 'id' : 'display_id';
    if (payload.action === 'update-status') {
      if (!allowedStatuses.includes(payload.status)) throw new RequestError('Invalid status.');
      const { data, error } = await client.from(table).update({ status: payload.status }).eq(idColumn, identifier).select().maybeSingle();
      if (error) throw new RequestError('This record could not be updated.', 500);
      if (!data) return json({ error: 'Record not found.' }, 404);
      await logActivity(client, access, table === 'quotes' ? 'quote' : 'inquiry', data.id, 'status_changed', `${data.display_id} moved to ${payload.status}`);
      return json({ success: true, quote: table === 'quotes' ? mapQuote(data) : data });
    }
    if (payload.action === 'update-note') {
      const { data, error } = await client.from(table).update({ admin_note: cleanText(payload.note, 2000) }).eq(idColumn, identifier).select().maybeSingle();
      if (error) throw new RequestError('The team note could not be saved.', 500);
      if (!data) return json({ error: 'Record not found.' }, 404);
      return json({ success: true, quote: table === 'quotes' ? mapQuote(data) : data });
    }
    return json({ error: 'Unknown request action.' }, 400);
  } catch (error) {
    return errorResponse(error);
  }
};
