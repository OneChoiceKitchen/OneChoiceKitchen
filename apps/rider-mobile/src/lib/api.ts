export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  tokenKey = 'rider_token'
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function riderLogin(email: string, password: string) {
  const data = await apiFetch<{ access_token: string }>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ email, password }) },
    'rider_token'
  );
  localStorage.setItem('rider_token', data.access_token);
  return data;
}
