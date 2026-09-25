const API_BASE = '/api';

export async function submitComplaint(payload) {
  const res = await fetch(`${API_BASE}/complaints/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to submit complaint');
  }
  return res.json();
}

export async function uploadComplaintFile(formData) {
  const res = await fetch(`${API_BASE}/complaints/upload-file`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to upload complaint file');
  }
  return res.json();
}

export async function extractComplaintFileText(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/complaints/extract-file-text`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to parse file text');
  }
  return res.json();
}

export async function fetchTickets(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.append(k, v);
    }
  });
  const res = await fetch(`${API_BASE}/tickets?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function fetchTicketDetail(complaintId) {
  const res = await fetch(`${API_BASE}/tickets/${complaintId}`);
  if (!res.ok) throw new Error(`Failed to fetch ticket ${complaintId}`);
  return res.json();
}

export async function takeTicketAction(complaintId, payload) {
  const res = await fetch(`${API_BASE}/tickets/${complaintId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to take action on ticket');
  }
  return res.json();
}

export async function fetchDashboardMetrics() {
  const res = await fetch(`${API_BASE}/analytics/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchPolicies(category = null, status = null) {
  const query = new URLSearchParams();
  if (category) query.append('category', category);
  if (status) query.append('status_filter', status);
  const res = await fetch(`${API_BASE}/policies?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch policies');
  return res.json();
}

export async function fetchPolicyChunks(docId) {
  const res = await fetch(`${API_BASE}/policies/${docId}/chunks`);
  if (!res.ok) throw new Error(`Failed to fetch chunks for policy ${docId}`);
  return res.json();
}

export async function uploadPolicy(formData) {
  const res = await fetch(`${API_BASE}/policies/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to upload policy document');
  }
  return res.json();
}

export async function updatePolicyStatus(docId, newStatus) {
  const res = await fetch(`${API_BASE}/policies/${docId}/status?new_status=${newStatus}`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to update policy status');
  return res.json();
}

export async function fetchRuleMatrix() {
  const res = await fetch(`${API_BASE}/rule-matrix`);
  if (!res.ok) throw new Error('Failed to fetch rule matrix');
  return res.json();
}

export async function createRuleMatrixEntry(payload) {
  const res = await fetch(`${API_BASE}/rule-matrix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create rule matrix entry');
  return res.json();
}

export async function updateRuleMatrixEntry(id, payload) {
  const res = await fetch(`${API_BASE}/rule-matrix/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update rule matrix entry');
  return res.json();
}

export async function deleteRuleMatrixEntry(id) {
  const res = await fetch(`${API_BASE}/rule-matrix/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete rule matrix entry');
  return res.json();
}

// -------------------------------------------------------------
// Customer Tracking & Authentication API (FR i, FR ii, FR lxvi)
// -------------------------------------------------------------

export async function trackComplaint(complaintId) {
  const res = await fetch(`${API_BASE}/complaints/track/${complaintId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Complaint not found');
  }
  return res.json();
}

export async function fetchRecentPublicComplaints() {
  const res = await fetch(`${API_BASE}/complaints/recent-public-list`);
  if (!res.ok) throw new Error('Failed to fetch public complaints');
  return res.json();
}

export async function fetchCustomerComplaints(identifier) {
  const res = await fetch(`${API_BASE}/complaints/by-customer/${encodeURIComponent(identifier)}`);
  if (!res.ok) throw new Error('Failed to fetch customer complaints');
  return res.json();
}

export async function loginUser(usernameOrEmail, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username_or_email: usernameOrEmail, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Authentication failed');
  }
  return res.json();
}

export async function switchUserRole(role) {
  const res = await fetch(`${API_BASE}/auth/switch-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to switch role');
  }
  return res.json();
}

export async function fetchDemoUsers() {
  const res = await fetch(`${API_BASE}/auth/demo-users`);
  if (!res.ok) throw new Error('Failed to fetch demo personas');
  return res.json();
}

export function getExportUrl(format = 'csv') {
  return `${API_BASE}/analytics/export?format=${format}`;
}

export async function run100BenchmarkAudit() {
  const res = await fetch(`${API_BASE}/benchmark/run-100-audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to run 100-case benchmark');
  }
  return res.json();
}

export async function fetchLatestBenchmark() {
  const res = await fetch(`${API_BASE}/benchmark/latest`);
  if (!res.ok) throw new Error('Failed to fetch benchmark telemetry');
  return res.json();
}

export function getBenchmarkExportUrl() {
  return `${API_BASE}/benchmark/export-report`;
}

export async function customerReplyTicket(complaintId, message, customerEmail = null) {
  const res = await fetch(`${API_BASE}/tickets/${complaintId}/customer-reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, customer_email: customerEmail })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to send reply');
  }
  return res.json();
}

export async function customerCloseTicket(complaintId, satisfactionNotes = null) {
  const res = await fetch(`${API_BASE}/tickets/${complaintId}/customer-close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ satisfaction_notes: satisfactionNotes })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to close ticket');
  }
  return res.json();
}
