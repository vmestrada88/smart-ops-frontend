/**
 * API Configuration and Utilities Module
 *
 * This module provides a centralized way to handle API calls with consistent
 * error handling, base URL configuration, and common fetch settings.
 * It supports multiple environments and runtime URL overrides.
 */

import { resolveApiBaseUrl } from '../utils/resolveApiBaseUrl';

/**
 * API base resolution (see `resolveApiBaseUrl`):
 * - Vite dev + VITE_API_URL pointing at localhost:5000 → `/api` (Vite proxy) unless VITE_DIRECT_API=true
 * - Else VITE_API_URL, runtime override, dev `/api`, or production fallback
 *
 * @type {string} The raw base URL that may contain trailing slashes
 */
const rawBase = resolveApiBaseUrl({
  viteApiUrl: import.meta.env.VITE_API_URL,
  isViteDev: import.meta.env.DEV,
  directApi: ['true', '1'].includes(String(import.meta.env.VITE_DIRECT_API || '').toLowerCase()),
  runtimeUrl: typeof window !== 'undefined' ? window.__RUNTIME_API_URL : '',
});

/**
 * Normalizes the base URL by removing any trailing slash to ensure
 * consistent URL construction when concatenating with endpoints.
 * 
 * @type {string} The normalized base URL without trailing slash
 */
const normalizedBase = rawBase.replace(/\/$/, '');

/**
 * Central API configuration object containing base URL and endpoint definitions.
 * This provides a single source of truth for all API-related URLs.
 * 
 * @type {Object}
 * @property {string} BASE_URL - The normalized base URL for all API calls
 * @property {Object} ENDPOINTS - Collection of API endpoint paths
 */
export const API_CONFIG = {
  /** The base URL used for all API requests */
  BASE_URL: normalizedBase,
  
  /** 
   * Predefined endpoint paths for different API resources.
   * These are relative paths that will be appended to BASE_URL.
   */
  ENDPOINTS: {
    /** Client management endpoints */
    CLIENTS: '/clients',
    /** Product catalog endpoints */
    PRODUCTS: '/products', 
    /** Invoice processing endpoints */
    INVOICES: '/invoices',
    /** Proposal processing endpoints */
    PROPOSALS: '/proposals',
    /** Authentication and authorization endpoints */
    AUTH: '/auth'
  }
};

/**
 * Default configuration object for all fetch requests.
 * Sets common headers that should be included in most API calls.
 * 
 * @type {Object}
 * @property {Object} headers - HTTP headers to include in requests
 */
export const fetchConfig = {
  headers: {
    /** 
     * Content-Type header indicating that request body contains JSON data.
     * This tells the server how to parse the incoming request body.
     */
    'Content-Type': 'application/json',
  },
};

/**
 * Generic API call function that handles network requests with consistent
 * error handling, URL construction, and response processing.
 * 
 * Features:
 * - Automatic URL construction using base URL
 * - Network error handling with user-friendly messages
 * - HTTP status error handling with detailed error extraction
 * - JSON response parsing with fallback error handling
 * 
 * @param {string} endpoint - The API endpoint path (should start with '/')
 * @param {Object} options - Additional fetch options (method, body, headers, etc.)
 * @returns {Promise<Object>} Parsed JSON response from the API
 * @throws {Error} Network errors or HTTP status errors with descriptive messages
 */
export const apiCall = async (endpoint, options = {}) => {
  /** 
   * Construct the full URL by combining base URL with the endpoint.
   * Example: 'https://api.example.com' + '/users' = 'https://api.example.com/users'
   */
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  /** Variable to store the fetch response for error handling */
  let response;
  
  try {
    /** 
     * Make the HTTP request using fetch API.
     * Merge default fetchConfig with any custom options provided.
     * The spread operator ensures custom options can override defaults.
     */
    response = await fetch(url, { ...fetchConfig, ...options });
  } catch {
    /** 
     * Handle network-level errors (no internet, server unreachable, etc.).
     * These are different from HTTP status errors (404, 500, etc.).
     */
    throw new Error('API Network Error');
  }
  
  /** 
   * Check if the HTTP response indicates success (status 200-299).
   * response.ok is false for 4xx and 5xx status codes.
   */
  if (!response.ok) {
    /** Variable to store detailed error information from response body */
    let detail;
    
    try { 
      /** 
       * Attempt to parse the error response as JSON.
       * Many APIs return structured error information in JSON format.
       */
      detail = await response.json(); 
    } catch { 
      // Intentionally empty block
    }
    
    /** 
     * Throw an error with either:
     * 1. The specific error message from the API response, or
     * 2. A generic message with the HTTP status code
     */
    throw new Error(detail?.error || `API Error: ${response.status}`);
  }
  
  /** 
   * Parse and return the successful response as JSON.
   * This assumes all successful API responses contain JSON data.
   */
  return await response.json();
};

/**
 * Convenience function for GET requests to fetch data from API endpoints.
 * Automatically handles URL normalization and uses the common error handling.
 * 
 * @param {string} endpoint - The API endpoint (with or without leading slash)
 * @returns {Promise<Object>} The fetched data as a JSON object
 * @example
 * const users = await fetchData('users'); // GET /api/users
 * const user = await fetchData('/users/123'); // GET /api/users/123
 */
export const fetchData = async (endpoint) => {
  /** 
   * Normalize the endpoint by ensuring it starts with a slash.
   * This handles both '/users' and 'users' formats consistently.
   * The regex /^\\// matches a leading slash, which is then removed and re-added.
   */
  return await apiCall(`/${endpoint.replace(/^\//, '')}`);
};

/**
 * Convenience function for POST requests to send data to API endpoints.
 * Automatically serializes the data to JSON and sets appropriate headers.
 * 
 * @param {string} endpoint - The API endpoint (with or without leading slash)  
 * @param {Object} data - The data object to send in the request body
 * @returns {Promise<Object>} The server response as a JSON object
 * @example
 * const newUser = await postData('users', { name: 'John', email: 'john@example.com' });
 * const result = await postData('/auth/login', { username: 'admin', password: 'secret' });
 */
export const postData = async (endpoint, data) => {
  /** 
   * Make a POST request with:
   * - Normalized endpoint URL (ensuring single leading slash)
   * - POST method specified
   * - Request body containing JSON-serialized data
   * The fetchConfig already includes 'Content-Type: application/json' header
   */
  return await apiCall(`/${endpoint.replace(/^\//, '')}`, {
    method: 'POST', // HTTP method for creating/sending data
    body: JSON.stringify(data), // Convert JavaScript object to JSON string
  });
};
