/**
 * Shop service module for order history API operations.
 * @module services/shopService
 */
import { apiRequest, ENDPOINTS } from './httpClient';

const BASE = ENDPOINTS.ORDERS;

export const fetchOrders = () => apiRequest({ method: 'GET', url: BASE }, 'Orders');

export const fetchOrder = (id) => apiRequest({ method: 'GET', url: `${BASE}/${id}` }, 'Order');
