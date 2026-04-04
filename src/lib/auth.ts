const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

type AuthPayload = { name?: string; email: string; password: string; phone?: string; department?: string };
type AuthResponse = { id: string; email: string; name: string; role: string; approved: boolean };

export async function register(payload: AuthPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Register failed');
  return json;
}

export async function login(payload: AuthPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Login failed');
  return json;
}

export async function getPending() {
  const res = await fetch(`${API_BASE}/auth/pending`);
  if (!res.ok) throw new Error('Failed to fetch pending');
  return res.json();
}

export async function approveUser(id: string, group?: string) {
  const res = await fetch(`${API_BASE}/auth/approve/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ group }) });
  if (!res.ok) throw new Error('Approve failed');
  return res.json();
}

export async function rejectUser(id: string) {
  const res = await fetch(`${API_BASE}/auth/reject/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Reject failed');
  return res.json();
}

export async function resetPassword(email: string, newPassword: string, confirmPassword?: string) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, newPassword, confirmPassword }) });
  if (!res.ok) throw new Error('Reset password failed');
  return res.json();
}

export default { register, login, getPending, approveUser, rejectUser, resetPassword };
