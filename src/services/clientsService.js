/**
 * Client service module for handling client-related API operations.
 * 
 * @module services/clientsService
 * @description Provides methods for fetching, creating, updating, and deleting clients.
 */
import { API_CONFIG } from './api';
import { api } from './httpClient';

// Uses the axios client so the JWT is attached; every /clients endpoint requires auth
const BASE = API_CONFIG.ENDPOINTS.CLIENTS;

/**
 * Fetches all clients from the API.
 * 
 * @async
 * @function fetchClients
 * @returns {Promise<Array>} Promise resolving to an array of client objects.
 * @throws {Error} If there's an error fetching clients.
 */
export const fetchClients = async () => {
  try {
    const res = await api.get(BASE);
    return res.data;
  } catch {
    throw new Error('Error fetching clients');
  }
};

/**
 * Creates a new client.
 * 
 * @async
 * @function createClient
 * @param {Object} clientData - Client data object.
 * @param {string} clientData.name - Client name.
 * @param {string} [clientData.email] - Client email.
 * @param {string} [clientData.phone] - Client phone.
 * @param {string} [clientData.address] - Client address.
 * @returns {Promise<Object>} Promise resolving to the created client object.
 * @throws {Error} If there's an error creating the client.
 */
export const createClient = async (clientData) => {
  try {
    const res = await api.post(BASE, clientData);
    return res.data;
  } catch {
    throw new Error('Error creating client');
  }
};

export const updateClient = async (id, clientData) => {
  try {
    const res = await api.put(`${BASE}/${id}`, clientData);
    return res.data;
  } catch {
    throw new Error('Error updating client');
  }
};

export const deleteClient = async (id) => {
  try {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  } catch {
    throw new Error('Error deleting client');
  }
};

export const getClientById = async (id) => {
  try {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  } catch {
    throw new Error('Error fetching client');
  }
};
