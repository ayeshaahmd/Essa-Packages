import { createClient } from '@supabase/supabase-js';

export class RequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff'
  }
});

export const cleanText = (value, maxLength = 3000) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
export const cleanFilename = value => cleanText(value, 180).replace(/[^a-zA-Z0-9._ -]/g, '_') || 'attachment';

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) throw new RequestError('Supabase server settings are not configured on this site.', 500);
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getAdminAccess(request, client) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return { status: 401 };
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) return { status: 401 };
  const { data: admin, error: adminError } = await client.from('admin_users')
    .select('user_id,email,full_name,role,is_active').eq('user_id', userData.user.id).maybeSingle();
  if (adminError) throw new RequestError('Admin access could not be checked.', 500);
  if (!admin?.is_active) return { user: userData.user, status: 403 };
  return { user: userData.user, admin, status: 200 };
}

export const adminErrorResponse = access => json({
  error: access.status === 403
    ? 'This account is not approved or active for the Essa Packages admin workspace.'
    : 'Please sign in with an approved admin account.'
}, access.status);

const PERMISSIONS = {
  sales: ['owner', 'admin', 'sales'],
  operations: ['owner', 'admin', 'production'],
  finance: ['owner', 'admin', 'accounts'],
  catalog: ['owner', 'admin'],
  content: ['owner', 'admin'],
  settings: ['owner', 'admin']
};

export const can = (access, permission) => Boolean(access?.admin?.is_active && (PERMISSIONS[permission] || []).includes(access.admin.role));
export function requirePermission(access, permission) {
  if (!can(access, permission)) throw new RequestError('Your admin role does not allow this action.', 403);
}
export const actorName = access => access?.admin?.full_name || access?.admin?.email || access?.user?.email || 'Admin user';

export async function logActivity(client, access, entityType, entityId, action, message) {
  const { error } = await client.from('activity_log').insert({
    entity_type: entityType,
    entity_id: entityId,
    actor_user_id: access?.admin?.user_id || null,
    actor_name: access ? actorName(access) : 'Website',
    action,
    message
  });
  if (error) console.error('Activity log insert failed:', error.message);
}

export function errorResponse(error, fallback = 'Unable to process this request.') {
  console.error(error);
  const message = error instanceof SyntaxError ? 'The request data is invalid.' : error.message || fallback;
  return json({ error: message }, error instanceof SyntaxError ? 400 : error.status || 500);
}
