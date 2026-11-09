/**
 * HTTP client configuration module.
 *
 * @module services/httpClient
 * @description The single axios client every service uses to talk to the backend.
 *              The base URL comes from VITE_API_URL (see `resolveApiBaseUrl`); nothing
 *              else in the app should build backend URLs or call `fetch` directly.
 */
import axios from 'axios';
import { resolveApiBaseUrl } from '../utils/resolveApiBaseUrl';

/**
 * Base API URL resolved from VITE_API_URL (or a runtime override / same-origin `/api`).
 * @constant {string}
 */
const rawApiBase = resolveApiBaseUrl({
  viteApiUrl: import.meta.env.VITE_API_URL,
  isViteDev: import.meta.env.DEV,
  directApi: ['true', '1'].includes(String(import.meta.env.VITE_DIRECT_API || '').toLowerCase()),
  runtimeUrl: typeof window !== 'undefined' ? window.__RUNTIME_API_URL : '',
});

export const API_BASE = String(rawApiBase).replace(/\/$/, '');

/**
 * Relative endpoint paths, appended to API_BASE by the axios client.
 * @constant {Object}
 */
export const ENDPOINTS = {
  CLIENTS: '/clients',
  PRODUCTS: '/products',
  INVOICES: '/invoices',
  PROPOSALS: '/proposals',
  ORDERS: '/orders',
  AMAZON_LISTINGS: '/shop/amazon-listings',
  AUTH: '/auth',
};

/**
 * Attaches the JWT from localStorage unless the request opts out with `skipAuth: true`
 * (used for public endpoints, so a stale token can't break them).
 */
function attachToken(config) {
  if (config.skipAuth) return config;
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore (no localStorage)
  }
  return config;
}

/** Clears stored auth when the API rejects the token. */
function handleAuthFailure(err) {
  const status = err?.response?.status;
  if (status === 401 || status === 403) {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.warn('Auth failure detected: cleared local storage. Please re-login.');
    } catch {
      // ignore
    }
  }
  return Promise.reject(err);
}

/**
 * Configured axios instance for JSON API requests.
 * @constant {Object}
 */
export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use(attachToken, (error) => Promise.reject(error));
api.interceptors.response.use((res) => res, handleAuthFailure);

/**
 * Configured axios instance for multipart form data (file uploads).
 * Shares the same base URL and auth handling as `api`.
 * @constant {Object}
 */
export const apiMultipart = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'multipart/form-data' },
});
apiMultipart.interceptors.request.use(attachToken, (error) => Promise.reject(error));
apiMultipart.interceptors.response.use((res) => res, handleAuthFailure);

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return true; // no exp => assume valid
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch {
    return false;
  }
}

/**
 * Extracts meaningful error messages from various error response formats.
 *
 * @function extractError
 * @param {Error|Object} err - Error object from a failed request
 * @returns {string} Human-readable error message
 */
export function extractError(err) {
  return err?.response?.data?.error ||
         err?.response?.data?.message ||
         err.message ||
         'Unknown error';
}

/**
 * True when a response body is an HTML page (SPA fallback or proxy error page)
 * instead of the JSON the API should return.
 * @param {unknown} data
 * @returns {boolean}
 */
export function looksLikeHtml(data) {
  if (typeof data !== 'string') return false;
  const trimmed = data.trimStart();
  return trimmed.startsWith('<!') || trimmed.toLowerCase().startsWith('<html');
}

const HTML_HINT =
  'Received HTML instead of JSON — the API base URL is not reaching the backend. ' +
  'Check VITE_API_URL, start the backend on port 5000, or set VITE_DEV_API_PROXY (Docker).';

/**
 * Turns an axios error into a plain Error with the most useful message available.
 * @param {unknown} err
 * @param {string} [context]
 * @returns {Error}
 */
export function toApiError(err, context = 'API') {
  const res = err?.response;
  if (!res) return new Error(`${context}: network error`);

  const { status, data } = res;
  if (looksLikeHtml(data)) return new Error(`${context} (HTTP ${status}): ${HTML_HINT}`);
  if (status === 401 || status === 403) {
    return new Error(data?.message || data?.error || 'Session expired. Please login again.');
  }
  const msg = data && typeof data === 'object' && (data.error || data.message || data.details);
  return new Error(typeof msg === 'string' && msg ? msg : `HTTP ${status}`);
}

/**
 * Sends a request through the shared axios client and returns the response body.
 * Errors are normalized with `toApiError`.
 *
 * @param {import('axios').AxiosRequestConfig & { skipAuth?: boolean }} config
 * @param {string} [context] - Label used in error messages
 * @param {import('axios').AxiosInstance} [client]
 * @returns {Promise<any>}
 */
export async function apiRequest(config, context = 'API', client = api) {
  let res;
  try {
    res = await client.request(config);
  } catch (err) {
    throw toApiError(err, context);
  }
  if (looksLikeHtml(res.data)) {
    throw new Error(`${context} (HTTP ${res.status}): ${HTML_HINT}`);
  }
  return res.data;
}
