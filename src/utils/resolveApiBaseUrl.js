/**
 * Resolves the API base URL for fetch/axios.
 * In Vite dev, VITE_API_URL=http://localhost:5000/api often hits the wrong process on the host;
 * same-origin /api is proxied (see vite.config.mjs). Opt out with VITE_DIRECT_API=true.
 */

/**
 * @param {string} url
 * @returns {boolean}
 */
function isLocalLoopbackPort5000(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url.trim());
    const h = u.hostname.toLowerCase();
    const p = u.port || (u.protocol === 'https:' ? '443' : '80');
    return (h === 'localhost' || h === '127.0.0.1') && String(p) === '5000';
  } catch {
    return false;
  }
}

/**
 * @param {object} opts
 * @param {string} [opts.viteApiUrl]
 * @param {boolean} [opts.isViteDev]
 * @param {boolean} [opts.directApi]
 * @param {string} [opts.runtimeUrl]
 * @param {string} [opts.productionFallback]
 * @returns {string}
 */
export function resolveApiBaseUrl(opts) {
  const {
    viteApiUrl = '',
    isViteDev = false,
    directApi = false,
    runtimeUrl = '',
    productionFallback = 'http://localhost:5000/api',
  } = opts || {};

  if (isViteDev && !directApi && viteApiUrl && isLocalLoopbackPort5000(viteApiUrl)) {
    return '/api';
  }
  if (viteApiUrl) return viteApiUrl;
  if (runtimeUrl) return runtimeUrl;
  if (isViteDev) return '/api';
  return productionFallback;
}
