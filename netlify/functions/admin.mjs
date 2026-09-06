import {
  RequestError, actorName, adminErrorResponse, cleanText, errorResponse,
  getAdminAccess, getSupabaseAdmin, json, logActivity, requirePermission
} from './_shared.mjs';

const INQUIRY_STATUSES = ['New', 'Contacted', 'Follow-up', 'Converted', 'Closed'];
const QUOTE_STATUSES = ['New', 'Reviewing', 'Quoted', 'Awaiting Customer', 'Accepted', 'Rejected', 'Expired'];
const ORDER_STAGES = ['Inquiry', 'Quotation', 'Approved', 'Artwork Approval', 'Production', 'Quality Check', 'Ready for Dispatch', 'Dispatched', 'Delivered'];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Online', 'Other'];
const LIST_RESOURCES = new Set(['inquiries', 'quotes', 'customers', 'orders', 'payments', 'products', 'content']);

const numberOrZero = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0;
};
const positiveIntegerOrNull = value => {
  const parsed = Number.parseInt(String(value || '').replace(/\D/g, ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};
const optionalNumber = value => value === '' || value == null ? null : numberOrZero(value);
const optionalDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? value : null;
const cleanSearch = value => cleanText(value, 100).replace(/[,%()]/g, ' ');
const pagination = url => {
  const pageSize = Math.min(Math.max(Number(url.searchParams.get('pageSize')) || 25, 10), 100);
  const page = Math.max(Number(url.searchParams.get('page')) || 1, 1);
  return { page, pageSize, from: (page - 1) * pageSize, to: page * pageSize - 1 };
};

async function enrichCustomers(client, rows) {
  const ids = [...new Set(rows.map(row => row.customer_id).filter(Boolean))];
  if (!ids.length) return rows;
  const { data } = await client.from('customers').select('id,display_id,name,company,phone,whatsapp,email,address').in('id', ids);
  const map = new Map((data || []).map(customer => [customer.id, customer]));
  return rows.map(row => ({ ...row, customer: map.get(row.customer_id) || null }));
}

async function enrichAssignees(client, rows) {
  const ids = [...new Set(rows.map(row => row.assigned_to).filter(Boolean))];
  if (!ids.length) return rows;
  const { data } = await client.from('admin_users').select('user_id,full_name,email,role').in('user_id', ids);
  const map = new Map((data || []).map(admin => [admin.user_id, admin]));
  return rows.map(row => ({ ...row, assigned: map.get(row.assigned_to) || null }));
}

async function enrichCustomerMetrics(client, customers) {
  const ids = customers.map(row => row.id);
  if (!ids.length) return customers;
  const { data: orders } = await client.from('orders').select('id,customer_id,stage,order_total').in('customer_id', ids).is('archived_at', null);
  const orderIds = (orders || []).map(row => row.id);
  const { data: payments } = orderIds.length
    ? await client.from('payments').select('order_id,amount').in('order_id', orderIds)
    : { data: [] };
  const paymentsByOrder = new Map();
  for (const payment of payments || []) paymentsByOrder.set(payment.order_id, (paymentsByOrder.get(payment.order_id) || 0) + Number(payment.amount));
  return customers.map(customer => {
    const related = (orders || []).filter(order => order.customer_id === customer.id);
    return {
      ...customer,
      total_orders: related.length,
      active_orders: related.filter(order => order.stage !== 'Delivered').length,
      outstanding_balance: related.reduce((sum, order) => sum + Math.max(Number(order.order_total) - (paymentsByOrder.get(order.id) || 0), 0), 0)
    };
  });
}

async function loadList(client, resource, url) {
  const { page, pageSize, from, to } = pagination(url);
  const search = cleanSearch(url.searchParams.get('search'));
  const status = cleanText(url.searchParams.get('status'), 60);
  const customerId = cleanText(url.searchParams.get('customer'), 50);
  const productId = cleanText(url.searchParams.get('product'), 50);
  const dateFrom = optionalDate(url.searchParams.get('dateFrom'));
  const dateTo = optionalDate(url.searchParams.get('dateTo'));
  const table = resource === 'content' ? 'site_content' : resource;
  let query = client.from(table).select('*', { count: 'exact' });

  if (resource === 'inquiries') {
    if (search) query = query.or(`display_id.ilike.%${search}%,name.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%,packaging_type.ilike.%${search}%,requirement.ilike.%${search}%`);
    if (status) query = query.eq('status', status);
    query = query.is('archived_at', null).order('created_at', { ascending: false });
  } else if (resource === 'quotes') {
    if (search) query = query.or(`display_id.ilike.%${search}%,name.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,packaging_type.ilike.%${search}%`);
    if (status) query = query.eq('status', status);
    query = query.order('created_at', { ascending: false });
  } else if (resource === 'customers') {
    if (search) query = query.or(`display_id.ilike.%${search}%,name.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%,whatsapp.ilike.%${search}%,email.ilike.%${search}%`);
    query = query.is('archived_at', null).order('created_at', { ascending: false });
  } else if (resource === 'orders') {
    if (search) query = query.or(`display_id.ilike.%${search}%,product_name.ilike.%${search}%,box_type.ilike.%${search}%,delivery_address.ilike.%${search}%`);
    if (status) query = query.eq('stage', status);
    if (productId) query = query.eq('product_id', productId);
    query = query.is('archived_at', null).order('created_at', { ascending: false });
  } else if (resource === 'payments') {
    if (search) query = query.or(`display_id.ilike.%${search}%,reference.ilike.%${search}%,method.ilike.%${search}%,notes.ilike.%${search}%`);
    query = query.order('payment_date', { ascending: false }).order('created_at', { ascending: false });
  } else if (resource === 'products') {
    if (search) query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%,description.ilike.%${search}%`);
    if (status === 'active') query = query.eq('is_active', true).is('archived_at', null);
    if (status === 'inactive') query = query.eq('is_active', false).is('archived_at', null);
    query = query.is('archived_at', null).order('display_order').order('name');
  } else {
    query = query.order('section').order('content_key');
  }
  if (customerId && ['inquiries', 'quotes', 'orders'].includes(resource)) query = query.eq('customer_id', customerId);
  if (dateFrom && resource !== 'content') query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
  if (dateTo && resource !== 'content') query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
  if (resource !== 'content') query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new RequestError(`${resource[0].toUpperCase() + resource.slice(1)} could not be loaded.`, 500);
  let items = data || [];
  if (['inquiries', 'quotes', 'orders'].includes(resource)) items = await enrichCustomers(client, items);
  if (['inquiries', 'quotes'].includes(resource)) items = await enrichAssignees(client, items);
  if (resource === 'customers') items = await enrichCustomerMetrics(client, items);
  if (resource === 'payments') {
    const orderIds = [...new Set(items.map(row => row.order_id))];
    if (orderIds.length) {
      const { data: orders } = await client.from('orders').select('id,display_id,customer_id,order_total').in('id', orderIds);
      const enrichedOrders = await enrichCustomers(client, orders || []);
      const map = new Map(enrichedOrders.map(order => [order.id, order]));
      items = items.map(payment => ({ ...payment, order: map.get(payment.order_id) || null }));
    }
  }
  return { items, count: count ?? items.length, page, pageSize };
}

async function loadDashboard(client) {
  const today = new Date().toISOString().slice(0, 10);
  const queries = await Promise.all([
    client.from('inquiries').select('*', { count: 'exact' }).eq('status', 'New').is('archived_at', null).order('created_at', { ascending: false }).limit(6),
    client.from('quotes').select('*', { count: 'exact' }).in('status', ['New', 'Reviewing', 'Quoted', 'Awaiting Customer']).order('created_at', { ascending: false }).limit(1),
    client.from('orders').select('*', { count: 'exact' }).not('stage', 'eq', 'Delivered').is('archived_at', null).order('created_at', { ascending: false }).limit(6),
    client.from('orders').select('id', { count: 'exact', head: true }).eq('stage', 'Production').is('archived_at', null),
    client.from('orders').select('id', { count: 'exact', head: true }).eq('stage', 'Ready for Dispatch').is('archived_at', null),
    client.from('orders').select('*').gte('delivery_date', today).not('stage', 'in', '(Delivered,Dispatched)').is('archived_at', null).order('delivery_date').limit(6),
    client.from('orders').select('id,order_total,stage').is('archived_at', null).limit(5000),
    client.from('payments').select('order_id,amount').limit(10000),
    client.from('activity_log').select('*').order('created_at', { ascending: false }).limit(8)
  ]);
  const failed = queries.find(result => result.error);
  if (failed) throw new RequestError('Dashboard metrics could not be loaded.', 500);
  const [inquiries, quotes, orders, production, ready, deliveries, orderTotals, paymentTotals, activity] = queries;
  const paidByOrder = new Map();
  for (const payment of paymentTotals.data || []) paidByOrder.set(payment.order_id, (paidByOrder.get(payment.order_id) || 0) + Number(payment.amount));
  const outstanding = (orderTotals.data || []).reduce((sum, order) => sum + Math.max(Number(order.order_total) - (paidByOrder.get(order.id) || 0), 0), 0);
  return {
    kpis: {
      newInquiries: inquiries.count || 0, pendingQuotes: quotes.count || 0,
      activeOrders: orders.count || 0, inProduction: production.count || 0,
      readyForDispatch: ready.count || 0, outstandingBalance: outstanding
    },
    recentInquiries: await enrichCustomers(client, inquiries.data || []),
    recentOrders: await enrichCustomers(client, orders.data || []),
    upcomingDeliveries: await enrichCustomers(client, deliveries.data || []),
    orderStatus: ORDER_STAGES.map(stage => ({ stage, count: (orderTotals.data || []).filter(order => order.stage === stage).length })),
    recentActivity: activity.data || []
  };
}

async function loadDetail(client, resource, id) {
  const table = resource === 'content' ? 'site_content' : resource;
  const idColumn = resource === 'content' ? 'content_key' : 'id';
  const { data, error } = await client.from(table).select('*').eq(idColumn, id).maybeSingle();
  if (error) throw new RequestError('This record could not be loaded.', 500);
  if (!data) throw new RequestError('Record not found.', 404);
  const result = { record: ['inquiries', 'quotes', 'orders'].includes(resource) ? (await enrichCustomers(client, [data]))[0] : data };
  if (resource === 'orders') {
    const [{ data: activities }, { data: payments }, { data: attachments }] = await Promise.all([
      client.from('order_activities').select('*').eq('order_id', id).order('created_at', { ascending: false }),
      client.from('payments').select('*').eq('order_id', id).order('payment_date', { ascending: false }),
      client.from('attachments').select('*').eq('entity_type', 'order').eq('entity_id', id).order('created_at')
    ]);
    result.activities = activities || [];
    result.payments = payments || [];
    result.attachments = attachments || [];
    result.balance = Math.max(Number(data.order_total) - result.payments.reduce((sum, row) => sum + Number(row.amount), 0), 0);
  }
  if (resource === 'quotes') {
    const { data: attachments } = await client.from('attachments').select('*').eq('entity_type', 'quote').eq('entity_id', id).order('created_at');
    result.attachments = attachments || [];
  }
  if (resource === 'customers') {
    const [{ data: quotes }, { data: orders }] = await Promise.all([
      client.from('quotes').select('id,display_id,status,total,created_at').eq('customer_id', id).order('created_at', { ascending: false }),
      client.from('orders').select('id,display_id,stage,order_total,delivery_date,created_at').eq('customer_id', id).is('archived_at', null).order('created_at', { ascending: false })
    ]);
    result.quotes = quotes || [];
    result.orders = orders || [];
  }
  return result;
}

async function findOrCreateCustomer(client, record) {
  if (record.customer_id) return record.customer_id;
  let existing;
  if (record.email) ({ data: existing } = await client.from('customers').select('id').ilike('email', record.email).is('archived_at', null).limit(1).maybeSingle());
  if (!existing && record.phone) ({ data: existing } = await client.from('customers').select('id').eq('phone', record.phone).is('archived_at', null).limit(1).maybeSingle());
  if (existing) return existing.id;
  const { data, error } = await client.from('customers').insert({
    name: record.name, company: record.company || '', phone: record.phone || '',
    whatsapp: record.phone || '', email: record.email || ''
  }).select('id').single();
  if (error) throw new RequestError('The customer could not be linked.', 500);
  return data.id;
}

async function mutate(client, access, payload) {
  const resource = cleanText(payload.resource, 40);
  const action = cleanText(payload.action, 40);
  const id = cleanText(payload.id, 50);

  if (resource === 'inquiries') {
    requirePermission(access, 'sales');
    if (action === 'update') {
      const changes = { status: INQUIRY_STATUSES.includes(payload.status) ? payload.status : 'New', admin_note: cleanText(payload.adminNote, 2000) };
      if (payload.assignedTo !== undefined) changes.assigned_to = payload.assignedTo || null;
      const { data, error } = await client.from('inquiries').update(changes).eq('id', id).select().maybeSingle();
      if (error || !data) throw new RequestError(error ? 'Inquiry could not be updated.' : 'Inquiry not found.', error ? 500 : 404);
      await logActivity(client, access, 'inquiry', data.id, 'updated', `${data.display_id} updated`);
      return { record: data, message: 'Inquiry updated successfully.' };
    }
    if (action === 'convert') {
      const { data: inquiry, error } = await client.from('inquiries').select('*').eq('id', id).maybeSingle();
      if (error || !inquiry) throw new RequestError('Inquiry not found.', 404);
      if (inquiry.converted_quote_id) {
        const { data: existing } = await client.from('quotes').select('*').eq('id', inquiry.converted_quote_id).single();
        return { record: existing, message: 'This inquiry is already linked to a quote.' };
      }
      const customerId = await findOrCreateCustomer(client, inquiry);
      const { data: quote, error: quoteError } = await client.from('quotes').insert({
        customer_id: customerId, name: inquiry.name, company: inquiry.company, phone: inquiry.phone,
        email: inquiry.email, packaging_type: inquiry.packaging_type, quantity: inquiry.quantity,
        details: inquiry.requirement, source: 'Converted Inquiry'
      }).select().single();
      if (quoteError) throw new RequestError('The quotation could not be created.', 500);
      await client.from('inquiries').update({ status: 'Converted', customer_id: customerId, converted_quote_id: quote.id }).eq('id', inquiry.id);
      await logActivity(client, access, 'quote', quote.id, 'created', `${quote.display_id} created from ${inquiry.display_id}`);
      return { record: quote, message: `${inquiry.display_id} converted to ${quote.display_id}.` };
    }
  }

  if (resource === 'quotes') {
    requirePermission(access, 'sales');
    if (action === 'update') {
      if (!QUOTE_STATUSES.includes(payload.status)) throw new RequestError('Select a valid quote status.');
      const subtotal = numberOrZero(payload.subtotal);
      const tax = numberOrZero(payload.tax);
      const delivery = numberOrZero(payload.deliveryAmount);
      const discount = numberOrZero(payload.discount);
      const total = Math.max(Math.round((subtotal + tax + delivery - discount) * 100) / 100, 0);
      const changes = {
        status: payload.status, subtotal, tax, delivery_amount: delivery, discount, total,
        admin_note: cleanText(payload.adminNote, 2000), expires_at: optionalDate(payload.expiresAt),
        accepted_at: payload.status === 'Accepted' ? new Date().toISOString() : null
      };
      const { data, error } = await client.from('quotes').update(changes).eq('id', id).select().maybeSingle();
      if (error || !data) throw new RequestError(error ? 'Quote could not be updated.' : 'Quote not found.', error ? 500 : 404);
      await logActivity(client, access, 'quote', data.id, 'updated', `${data.display_id} updated`);
      return { record: data, message: 'Quote updated successfully.' };
    }
    if (action === 'convert') {
      const { data: quote, error } = await client.from('quotes').select('*').eq('id', id).maybeSingle();
      if (error || !quote) throw new RequestError('Quote not found.', 404);
      const { data: existing } = await client.from('orders').select('*').eq('quote_id', quote.id).maybeSingle();
      if (existing) return { record: existing, message: 'This quote is already linked to an order.' };
      const customerId = await findOrCreateCustomer(client, quote);
      const { data: order, error: orderError } = await client.from('orders').insert({
        customer_id: customerId, quote_id: quote.id, stage: 'Approved', product_name: quote.packaging_type,
        box_type: quote.packaging_type, length: quote.length, width: quote.width, height: quote.height,
        dimension_unit: quote.dimension_unit, quantity: positiveIntegerOrNull(quote.quantity), material: quote.material,
        printing: quote.printing, colors: quote.colors, finish: quote.finish, delivery_date: quote.delivery_date,
        delivery_address: quote.delivery_address, internal_notes: quote.admin_note, order_total: quote.total
      }).select().single();
      if (orderError) throw new RequestError('The order could not be created.', 500);
      await client.from('quotes').update({ status: 'Accepted', accepted_at: new Date().toISOString(), customer_id: customerId }).eq('id', quote.id);
      await client.from('order_activities').insert({ order_id: order.id, actor_user_id: access.admin.user_id, actor_name: actorName(access), action: 'Order created', to_stage: 'Approved', details: `Converted from ${quote.display_id}` });
      await logActivity(client, access, 'order', order.id, 'created', `${order.display_id} created from ${quote.display_id}`);
      return { record: order, message: `${quote.display_id} converted to ${order.display_id}.` };
    }
  }

  if (resource === 'customers') {
    requirePermission(access, 'sales');
    if (action === 'create' || action === 'update') {
      const values = {
        name: cleanText(payload.name, 120), company: cleanText(payload.company, 160),
        phone: cleanText(payload.phone, 50), whatsapp: cleanText(payload.whatsapp, 50),
        email: cleanText(payload.email, 180).toLowerCase(), address: cleanText(payload.address, 500),
        notes: cleanText(payload.notes, 2000)
      };
      if (!values.name) throw new RequestError('Customer name is required.');
      const query = action === 'create' ? client.from('customers').insert(values) : client.from('customers').update(values).eq('id', id);
      const { data, error } = await query.select().maybeSingle();
      if (error || !data) throw new RequestError(error?.code === '23505' ? 'A customer with this email or phone already exists.' : 'Customer could not be saved.', error ? 400 : 404);
      await logActivity(client, access, 'customer', data.id, action, `${data.display_id} ${action === 'create' ? 'created' : 'updated'}`);
      return { record: data, message: `Customer ${action === 'create' ? 'created' : 'updated'} successfully.` };
    }
    if (action === 'archive') {
      const { data, error } = await client.from('customers').update({ archived_at: new Date().toISOString() }).eq('id', id).select().maybeSingle();
      if (error || !data) throw new RequestError('Customer could not be archived.', error ? 500 : 404);
      await logActivity(client, access, 'customer', data.id, 'archived', `${data.display_id} archived`);
      return { record: data, message: 'Customer archived.' };
    }
  }

  if (resource === 'orders') {
    requirePermission(access, 'operations');
    if (action === 'stage') {
      if (!ORDER_STAGES.includes(payload.stage)) throw new RequestError('Select a valid order stage.');
      const { data, error } = await client.rpc('change_order_stage', {
        p_order_id: id, p_stage: payload.stage, p_actor_user_id: access.admin.user_id, p_actor_name: actorName(access)
      });
      if (error) throw new RequestError('Order stage could not be updated.', 500);
      return { record: data, message: `Order moved to ${payload.stage}.` };
    }
    if (action === 'create' || action === 'update') {
      const values = {
        customer_id: cleanText(payload.customerId, 50), product_id: cleanText(payload.productId, 50) || null,
        stage: ORDER_STAGES.includes(payload.stage) ? payload.stage : 'Approved', product_name: cleanText(payload.productName, 160),
        box_type: cleanText(payload.boxType, 160), length: optionalNumber(payload.length), width: optionalNumber(payload.width),
        height: optionalNumber(payload.height), dimension_unit: ['mm', 'cm', 'in'].includes(payload.dimensionUnit) ? payload.dimensionUnit : 'in',
        quantity: positiveIntegerOrNull(payload.quantity), material: cleanText(payload.material, 120), ply: cleanText(payload.ply, 50),
        gsm: cleanText(payload.gsm, 50), printing: cleanText(payload.printing, 160), colors: cleanText(payload.colors, 80),
        finish: cleanText(payload.finish, 120), delivery_date: optionalDate(payload.deliveryDate),
        delivery_address: cleanText(payload.deliveryAddress, 500), internal_notes: cleanText(payload.internalNotes, 3000),
        order_total: numberOrZero(payload.orderTotal)
      };
      if (!values.customer_id) throw new RequestError('Select a customer for this order.');
      const query = action === 'create' ? client.from('orders').insert(values) : client.from('orders').update(values).eq('id', id);
      const { data, error } = await query.select().maybeSingle();
      if (error || !data) throw new RequestError('Order could not be saved.', error ? 500 : 404);
      if (action === 'create') await client.from('order_activities').insert({ order_id: data.id, actor_user_id: access.admin.user_id, actor_name: actorName(access), action: 'Order created', to_stage: data.stage });
      await logActivity(client, access, 'order', data.id, action, `${data.display_id} ${action === 'create' ? 'created' : 'updated'}`);
      return { record: data, message: `Order ${action === 'create' ? 'created' : 'updated'} successfully.` };
    }
    if (action === 'archive') {
      const { data, error } = await client.from('orders').update({ archived_at: new Date().toISOString() }).eq('id', id).select().maybeSingle();
      if (error || !data) throw new RequestError('Order could not be archived.', error ? 500 : 404);
      await logActivity(client, access, 'order', data.id, 'archived', `${data.display_id} archived`);
      return { record: data, message: 'Order archived.' };
    }
  }

  if (resource === 'payments' && action === 'create') {
    requirePermission(access, 'finance');
    const method = PAYMENT_METHODS.includes(payload.method) ? payload.method : 'Other';
    const amount = numberOrZero(payload.amount);
    if (!amount) throw new RequestError('Enter a payment amount greater than zero.');
    const { data, error } = await client.from('payments').insert({
      order_id: cleanText(payload.orderId, 50), amount, payment_date: optionalDate(payload.paymentDate) || new Date().toISOString().slice(0, 10),
      method, reference: cleanText(payload.reference, 160), notes: cleanText(payload.notes, 1000), recorded_by: access.admin.user_id
    }).select().single();
    if (error) throw new RequestError('Payment could not be recorded.', 500);
    await logActivity(client, access, 'payment', data.id, 'created', `${data.display_id} recorded`);
    return { record: data, message: 'Payment recorded successfully. Historical payments remain immutable.' };
  }

  if (resource === 'products') {
    requirePermission(access, 'catalog');
    if (action === 'create' || action === 'update') {
      const name = cleanText(payload.name, 160);
      if (!name) throw new RequestError('Product name is required.');
      const values = {
        slug: cleanText(payload.slug, 120).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name, category: cleanText(payload.category, 120), description: cleanText(payload.description, 1200),
        image_url: cleanText(payload.imageUrl, 500), use_cases: Array.isArray(payload.useCases) ? payload.useCases.map(value => cleanText(value, 80)).filter(Boolean).slice(0, 12) : cleanText(payload.useCases, 500).split(',').map(value => value.trim()).filter(Boolean),
        is_active: Boolean(payload.isActive), display_order: Math.max(Number.parseInt(payload.displayOrder, 10) || 0, 0), archived_at: null
      };
      const query = action === 'create' ? client.from('products').insert(values) : client.from('products').update(values).eq('id', id);
      const { data, error } = await query.select().maybeSingle();
      if (error || !data) throw new RequestError(error?.code === '23505' ? 'That product slug already exists.' : 'Product could not be saved.', error ? 400 : 404);
      await logActivity(client, access, 'product', data.id, action, `${data.name} ${action === 'create' ? 'created' : 'updated'}`);
      return { record: data, message: `Product ${action === 'create' ? 'created' : 'updated'} successfully.` };
    }
    if (action === 'archive') {
      const { data, error } = await client.from('products').update({ archived_at: new Date().toISOString(), is_active: false }).eq('id', id).select().maybeSingle();
      if (error || !data) throw new RequestError('Product could not be archived.', error ? 500 : 404);
      await logActivity(client, access, 'product', data.id, 'archived', `${data.name} archived`);
      return { record: data, message: 'Product archived and removed from the public catalogue.' };
    }
  }

  if (resource === 'content' && action === 'update') {
    requirePermission(access, 'content');
    const key = cleanText(payload.contentKey, 120);
    const { data, error } = await client.from('site_content').update({
      value: cleanText(payload.value, 5000), is_public: payload.isPublic !== false,
      updated_by: access.admin.user_id, updated_at: new Date().toISOString()
    }).eq('content_key', key).select().maybeSingle();
    if (error || !data) throw new RequestError('Website content could not be updated.', error ? 500 : 404);
    await logActivity(client, access, 'content', crypto.randomUUID(), 'updated', `${data.label} updated`);
    return { record: data, message: 'Website content updated successfully.' };
  }
  throw new RequestError('Unknown or unsupported admin action.', 400);
}

export default async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  try {
    const client = getSupabaseAdmin();
    const access = await getAdminAccess(request, client);
    if (access.status !== 200) return adminErrorResponse(access);
    const url = new URL(request.url);
    if (request.method === 'GET') {
      const resource = cleanText(url.searchParams.get('resource') || 'dashboard', 40);
      if (resource === 'access') return json({ authorized: true, profile: access.admin });
      if (resource === 'dashboard') return json(await loadDashboard(client));
      if (resource === 'reports') return json(await loadDashboard(client));
      if (!LIST_RESOURCES.has(resource)) throw new RequestError('Unknown admin resource.', 404);
      const id = cleanText(url.searchParams.get('id'), 120);
      return json(id ? await loadDetail(client, resource, id) : await loadList(client, resource, url));
    }
    if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
    return json({ success: true, ...(await mutate(client, access, await request.json())) });
  } catch (error) {
    return errorResponse(error);
  }
};
