export async function adminRequest(session, resource, options = {}) {
  const params = new URLSearchParams({ resource, ...(options.params || {}) });
  Object.keys(Object.fromEntries(params)).forEach(key => {
    if (params.get(key) === '' || params.get(key) === 'undefined' || params.get(key) === 'null') params.delete(key);
  });
  const response = await fetch(`/api/admin?${params}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    },
    body: options.body ? JSON.stringify({ resource, ...options.body }) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'The admin request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const money = value => new Intl.NumberFormat('en-PK', {
  style: 'currency', currency: 'PKR', maximumFractionDigits: 0
}).format(Number(value) || 0);

export const shortDate = value => value
  ? new Date(value).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
  : 'Not set';

export const dateTime = value => value
  ? new Date(value).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : 'Not available';

export const phoneHref = value => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.startsWith('0') ? `92${digits.slice(1)}` : digits;
};
