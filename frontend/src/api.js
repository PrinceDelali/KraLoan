// Simple API utility for KraLoan frontend
const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

export const api = {
  deleteGroup: (id) => apiRequest(`/groups/${id}`, { method: 'DELETE' }),
  removeMember: (groupId, userId) => apiRequest(`/groups/${groupId}/remove-member`, { method: 'POST', body: JSON.stringify({ userId }) }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: (id) => apiRequest(`/users/${id}`),
  updateProfile: (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createGroup: (data) => apiRequest('/groups', { method: 'POST', body: JSON.stringify(data) }),
  listGroups: () => apiRequest('/groups'),
  joinGroup: (id) => apiRequest(`/groups/${id}/join`, { method: 'POST' }),
  createTransaction: (data) => apiRequest('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  listTransactions: () => apiRequest('/transactions'),
};
