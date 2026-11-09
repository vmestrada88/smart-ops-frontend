import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, apiRequest, looksLikeHtml, toApiError } from './httpClient';

function mockAdapter(status, data) {
  return vi.fn(async (config) => {
    const response = { status, data, headers: {}, config, statusText: '' };
    if (status >= 200 && status < 300) return response;
    const err = new Error(`Request failed with status code ${status}`);
    err.response = response;
    err.config = config;
    throw err;
  });
}

describe('looksLikeHtml', () => {
  it('detects HTML documents', () => {
    expect(looksLikeHtml('<!DOCTYPE html><html>')).toBe(true);
    expect(looksLikeHtml('  <html>')).toBe(true);
  });
  it('ignores JSON payloads', () => {
    expect(looksLikeHtml({ a: 1 })).toBe(false);
    expect(looksLikeHtml([])).toBe(false);
  });
});

describe('toApiError', () => {
  it('uses the API error message', () => {
    expect(toApiError({ response: { status: 400, data: { error: 'Bad input' } } }).message).toBe('Bad input');
  });
  it('falls back to the status code', () => {
    expect(toApiError({ response: { status: 500, data: '' } }).message).toBe('HTTP 500');
  });
  it('reports auth failures as an expired session', () => {
    expect(toApiError({ response: { status: 401, data: {} } }).message).toMatch(/session expired/i);
  });
  it('reports network errors', () => {
    expect(toApiError(new Error('boom'), 'Orders').message).toBe('Orders: network error');
  });
});

describe('apiRequest', () => {
  const store = {};
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => { store[k] = v; },
      removeItem: (k) => { delete store[k]; },
    });
    store.token = 'jwt-123';
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the body and attaches the JWT', async () => {
    const adapter = mockAdapter(200, [{ id: 1 }]);
    await expect(apiRequest({ url: '/orders', adapter })).resolves.toEqual([{ id: 1 }]);
    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer jwt-123');
  });

  it('skips the JWT for public requests', async () => {
    const adapter = mockAdapter(200, []);
    await apiRequest({ url: '/products', adapter, skipAuth: true });
    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });

  it('throws a clear error when the body is HTML', async () => {
    const adapter = mockAdapter(200, '<!DOCTYPE html><html></html>');
    await expect(apiRequest({ url: '/products', adapter }, 'Products')).rejects.toThrow(/HTML instead of JSON/);
  });

  it('clears stored auth on 401', async () => {
    store.user = '{}';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const adapter = mockAdapter(401, { message: 'Token expired' });
    await expect(apiRequest({ url: '/invoices', adapter })).rejects.toThrow('Token expired');
    expect(store.token).toBeUndefined();
    expect(store.user).toBeUndefined();
    warn.mockRestore();
  });

  it('uses the configured base URL', () => {
    expect(api.defaults.baseURL).toBeTruthy();
  });
});
