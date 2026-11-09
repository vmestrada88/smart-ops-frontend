/**
 * Shop service module for order history API operations.
 * @module services/shopService
 */
import { API_CONFIG, fetchConfig } from './api';

const ORDERS_BASE = `${API_CONFIG.BASE_URL}/orders`;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...fetchConfig.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ─── Orders ──────────────────────────────────────────────────
export const fetchOrders = async () => {
  const res = await fetch(ORDERS_BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchOrder = async (id) => {
  const res = await fetch(`${ORDERS_BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
