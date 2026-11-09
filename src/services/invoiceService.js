/**
 * Invoice Service
 * API calls for invoice and proposal management
 */

import { apiRequest, ENDPOINTS } from './httpClient';

const BASE = ENDPOINTS.INVOICES;
const PROPOSALS_BASE = ENDPOINTS.PROPOSALS;

/**
 * Get all invoices
 * @returns {Promise<Array>} List of all invoices
 */
export const fetchInvoices = () => apiRequest({ method: 'GET', url: BASE }, 'Invoices');

/**
 * Get all proposals
 * @returns {Promise<Array>} List of all proposals
 */
export const fetchProposals = async () => {
  const data = await apiRequest({ method: 'GET', url: PROPOSALS_BASE }, 'Proposals');
  return Array.isArray(data) ? data : (Array.isArray(data?.proposals) ? data.proposals : []);
};

/**
 * Get proposal by ID
 * @param {number|string} id - Proposal ID
 * @returns {Promise<Object>} Proposal details
 */
export const fetchProposalById = (id) =>
  apiRequest({ method: 'GET', url: `${PROPOSALS_BASE}/${id}` }, 'Proposal');

/**
 * Get invoice by ID
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>} Invoice details
 */
export const fetchInvoiceById = (id) =>
  apiRequest({ method: 'GET', url: `${BASE}/${id}` }, 'Invoice');

/**
 * Create new invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} Created invoice
 */
export const createInvoice = (invoiceData) =>
  apiRequest({ method: 'POST', url: BASE, data: invoiceData }, 'Create invoice');

/**
 * Update invoice
 * @param {number} id - Invoice ID
 * @param {Object} invoiceData - Updated invoice data
 * @returns {Promise<Object>} Updated invoice
 */
export const updateInvoice = (id, invoiceData) =>
  apiRequest({ method: 'PUT', url: `${BASE}/${id}`, data: invoiceData }, 'Update invoice');

/**
 * Delete invoice
 * @param {number} id - Invoice ID
 * @returns {Promise<Object>}
 */
export const deleteInvoice = (id) =>
  apiRequest({ method: 'DELETE', url: `${BASE}/${id}` }, 'Delete invoice');

/**
 * Create new proposal
 * @param {Object} proposalData - Proposal data
 * @returns {Promise<Object>} Created proposal
 */
export const createProposal = (proposalData) =>
  apiRequest({ method: 'POST', url: PROPOSALS_BASE, data: proposalData }, 'Create proposal');

/**
 * Update proposal
 * @param {number|string} id - Proposal ID
 * @param {Object} proposalData - Updated proposal data
 * @returns {Promise<Object>} Updated proposal
 */
export const updateProposal = (id, proposalData) =>
  apiRequest({ method: 'PUT', url: `${PROPOSALS_BASE}/${id}`, data: proposalData }, 'Update proposal');

/**
 * Update proposal status
 * @param {number|string} id - Proposal ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Status update response
 */
export const updateProposalStatus = (id, status) =>
  apiRequest({ method: 'PATCH', url: `${PROPOSALS_BASE}/${id}/status`, data: { status } }, 'Update proposal status');

/**
 * Create proposal request from public products page (no auth required).
 * @param {Object} proposalData - Public proposal request data
 * @returns {Promise<Object>} Created request response
 */
export const createPublicProposalRequest = (proposalData) =>
  apiRequest(
    { method: 'POST', url: `${PROPOSALS_BASE}/public-request`, data: proposalData, skipAuth: true },
    'Proposal request'
  );
