import { API_URL } from './utils';

function getToken() {
  return localStorage.getItem('access_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: async (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    return data;
  },

  me: () => request('/auth/me'),

  createSession: (body) => request('/sessions', { method: 'POST', body: JSON.stringify(body) }),
  getSessions: () => request('/sessions'),
  getSession: (id) => request(`/sessions/${id}`),
  endSession: (id) => request(`/sessions/${id}/end`, { method: 'POST' }),
  saveGoals: (body) => request('/auth/goals', { method: 'POST', body: JSON.stringify(body) }),

  getResources: (dimensions, level) =>
    request(`/resources?dimensions=${dimensions.join(',')}&level=${level}`),
};
