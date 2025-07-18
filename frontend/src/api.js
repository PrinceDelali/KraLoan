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

// Upload profile image (multipart/form-data)
async function uploadProfileImage(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('profileImage', file);
  const res = await fetch(`${API_BASE}/users/profile-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

// Update avatar
async function updateAvatar(avatar) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/users/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ avatar }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

// Group join request management
async function getPendingRequests(groupId) {
  return apiRequest(`/groups/${groupId}/pending-requests`);
}
async function approveJoinRequest(groupId, userId) {
  return apiRequest(`/groups/${groupId}/approve-request`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}
async function declineJoinRequest(groupId, userId) {
  return apiRequest(`/groups/${groupId}/decline-request`, {
    method: 'POST',
    body: JSON.stringify({ userId })
  });
}

async function postGroupMessageWithFile(groupId, text, file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('text', text || '');
  if (file) formData.append('file', file);
  const res = await fetch(`${API_BASE}/groups/${groupId}/messages`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

async function editGroupMessage(groupId, messageId, text) {
  return apiRequest(`/groups/${groupId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ text })
  });
}
async function deleteGroupMessage(groupId, messageId) {
  return apiRequest(`/groups/${groupId}/messages/${messageId}`, {
    method: 'DELETE'
  });
}

async function getGroupMessages(groupId) {
  return apiRequest(`/groups/${groupId}/messages`);
}

export async function removeMember(groupId, userId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/groups/${groupId}/remove-member`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to remove member');
  return res.json();
}
// Stubs for admin actions
export async function promoteAdmin(groupId, userId) { throw new Error('Not implemented'); }
export async function demoteAdmin(groupId, userId) { throw new Error('Not implemented'); }

export const api = {
  leaveGroup: (groupId) => apiRequest(`/groups/${groupId}/leave`, { method: 'POST' }),
  deleteGroup: (id) => apiRequest(`/groups/${id}`, { method: 'DELETE' }),
  removeMember,
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getCurrentUser: () => apiRequest('/users/me'),
  getProfile: (id) => apiRequest(`/users/${id}`),
  updateProfile: (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createGroup: (data) => apiRequest('/groups', { method: 'POST', body: JSON.stringify(data) }),
  listGroups: () => apiRequest('/groups'),
  joinGroup: (id) => apiRequest(`/groups/${id}/join`, { method: 'POST' }),
  joinGroupByInviteToken: (token) => apiRequest(`/groups/invite/${token}/join`, { method: 'POST' }),
  createTransaction: (data) => apiRequest('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  listTransactions: () => apiRequest('/transactions'),
  getGroupTransactions: (groupId) => apiRequest(`/transactions/group/${groupId}`),
  getAllGroupTransactions: (groupId) => apiRequest(`/transactions/group/${groupId}/all`),
  uploadProfileImage,
  updateAvatar,
  getPendingRequests,
  approveJoinRequest,
  declineJoinRequest,
  editGroupMessage,
  deleteGroupMessage,
  postGroupMessageWithFile,
  getGroupMessages,
  getGroupById: (id) => apiRequest(`/groups/${id}`),
  updateGroup: (groupId, data) => apiRequest(`/groups/${groupId}`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadGroupLogo: async (groupId, file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', file);
    const res = await fetch(`${API_BASE}/groups/${groupId}/logo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Failed to upload logo');
    return res.json();
  },
  // Loan APIs
  requestLoan,
  getLoans,
  approveLoan,
  declineLoan,
  repayLoan,
  promoteAdmin,
  demoteAdmin,
};

// Group loan APIs
async function requestLoan(groupId, amount, reason) {
  return apiRequest(`/groups/${groupId}/loans`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  });
}

async function getLoans(groupId) {
  return apiRequest(`/groups/${groupId}/loans`, { method: 'GET' });
}

async function approveLoan(groupId, loanId) {
  return apiRequest(`/groups/${groupId}/loans/${loanId}/approve`, { method: 'POST' });
}

async function declineLoan(groupId, loanId) {
  return apiRequest(`/groups/${groupId}/loans/${loanId}/decline`, { method: 'POST' });
}

export async function repayLoan(groupId, loanId, amount) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/groups/${groupId}/loans/${loanId}/repay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to record repayment');
  return res.json();
}
