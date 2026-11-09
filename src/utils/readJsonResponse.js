/**
 * Parses fetch Response as JSON; detects HTML (SPA / error pages) for clearer errors.
 * @param {Response} res
 * @param {string} [context]
 * @returns {Promise<unknown>}
 */
export async function readJsonResponse(res, context = 'API') {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const text = await res.text();
  const trimmed = text.trimStart();
  const looksLikeHtml =
    trimmed.startsWith('<!') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<HTML');

  if (looksLikeHtml || (!contentType.includes('json') && trimmed.startsWith('<'))) {
    const hint =
      'Received HTML instead of JSON — the Vite proxy may not be reaching the API. ' +
      'Start the backend on port 5000, set VITE_DEV_API_PROXY (Docker), or use VITE_DIRECT_API=true with a reachable VITE_API_URL.';
    throw new Error(`${context} (HTTP ${res.status}): ${hint}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `${context}: response is not valid JSON (HTTP ${res.status}): ${text.slice(0, 160)}`
    );
  }
}
