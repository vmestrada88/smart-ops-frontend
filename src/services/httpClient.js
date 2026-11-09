/**
 * HTTP client configuration module.
 * 
 * @module services/httpClient
 * @description Configures and exports axios instances for API communication,
 *              with preconfigured base URL and headers. Also provides error extraction utility.
 */
import axios from 'axios';
import { resolveApiBaseUrl } from '../utils/resolveApiBaseUrl';

/**
 * Base API URL (same rules as `api.js` / `resolveApiBaseUrl`).
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
 * Configured axios instance for JSON API requests.
 * @constant {Object}
 */
export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Attach Authorization header from localStorage when token is present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore (server-side rendering or no localStorage)
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle auth failures globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      try {
        // Clear stored auth and force reload so user can re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optionally reload to show login screen
        // window.location.reload(); // commented to avoid unexpected reloads during dev
        console.warn('Auth failure detected: cleared local storage. Please re-login.');
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(err);
  }
);

export function isTokenValid(token) {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return true; // no exp => assume valid
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    return false;
  }
}

/**
 * Configured axios instance for multipart form data (file uploads).
 * @constant {Object}
 */
export const apiMultipart = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'multipart/form-data' }
});

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