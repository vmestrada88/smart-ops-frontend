/**
 * Invoice Service
 * API calls for invoice management
 */

import { API_CONFIG, fetchConfig } from './api';

const BASE = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVOICES}`;
const PROPOSALS_BASE = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROPOSALS}`;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...fetchConfig.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const parseAndThrow = async (res) => {
  let detail;
  try {
    detail = await res.json();
  } catch {
    detail = null;
  }

  if (res.status === 401 || res.status === 403) {
    clearAuth();
    throw new Error(detail?.message || 'Session expired. Please login again.');
  }

  throw new Error(detail?.error || `HTTP ${res.status}`);
};

/**
 * Get all invoices
 * @returns {Promise<Array>} List of all invoices
 */
export const fetchInvoices = async () => {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Get all proposals
 * @returns {Promise<Array>} List of all proposals
 */
export const fetchProposals = async () => {
  const res = await fetch(PROPOSALS_BASE, { headers: authHeaders() });
  if (!res.ok) await parseAndThrow(res);
  const data = await res.json();
  return Array.isArray(data) ? data : (Array.isArray(data?.proposals) ? data.proposals : []);
};

/**
 * Get proposal by ID
 * @param {number|string} id - Proposal ID
 * @returns {Promise<Object>} Proposal details
 */
export const fetchProposalById = async (id) => {
  const res = await fetch(`${PROPOSALS_BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Get invoice by ID
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>} Invoice details
 */
export const fetchInvoiceById = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Create new invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} Created invoice
 */
export const createInvoice = async (invoiceData) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(invoiceData)
  });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Update invoice
 * @param {number} id - Invoice ID
 * @param {Object} invoiceData - Updated invoice data
 * @returns {Promise<Object>} Updated invoice
 */
export const updateInvoice = async (id, invoiceData) => {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(invoiceData)
  });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Delete invoice
 * @param {number} id - Invoice ID
 * @returns {Promise<void>}
 */
export const deleteInvoice = async (id) => {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Create new proposal
 * @param {Object} proposalData - Proposal data
 * @returns {Promise<Object>} Created proposal
 */
export const createProposal = async (proposalData) => {
  const res = await fetch(PROPOSALS_BASE, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(proposalData)
  });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Update proposal
 * @param {number|string} id - Proposal ID
 * @param {Object} proposalData - Updated proposal data
 * @returns {Promise<Object>} Updated proposal
 */
export const updateProposal = async (id, proposalData) => {
  const res = await fetch(`${PROPOSALS_BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(proposalData)
  });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Update proposal status
 * @param {number|string} id - Proposal ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Status update response
 */
export const updateProposalStatus = async (id, status) => {
  const res = await fetch(`${PROPOSALS_BASE}/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) await parseAndThrow(res);
  return res.json();
};

/**
 * Create proposal request from public products page (no auth required).
 * @param {Object} proposalData - Public proposal request data
 * @returns {Promise<Object>} Created request response
 */
export const createPublicProposalRequest = async (proposalData) => {
  const res = await fetch(`${PROPOSALS_BASE}/public-request`, {
    method: 'POST',
    headers: fetchConfig.headers,
    body: JSON.stringify(proposalData)
  });

  let detail;
  try {
    detail = await res.json();
  } catch {
    detail = null;
  }

  if (!res.ok) {
    throw new Error(detail?.error || `HTTP ${res.status}`);
  }

  return detail;
};
