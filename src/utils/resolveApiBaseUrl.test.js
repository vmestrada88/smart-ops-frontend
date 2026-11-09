import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from './resolveApiBaseUrl';

describe('resolveApiBaseUrl', () => {
  it('rewrites localhost:5000 to /api in Vite dev when not direct', () => {
    expect(
      resolveApiBaseUrl({
        viteApiUrl: 'http://localhost:5000/api',
        isViteDev: true,
        directApi: false,
      })
    ).toBe('/api');
  });

  it('keeps localhost:5000 when VITE_DIRECT_API', () => {
    expect(
      resolveApiBaseUrl({
        viteApiUrl: 'http://localhost:5000/api',
        isViteDev: true,
        directApi: true,
      })
    ).toBe('http://localhost:5000/api');
  });

  it('keeps remote API in dev', () => {
    expect(
      resolveApiBaseUrl({
        viteApiUrl: 'https://api.example.com/api',
        isViteDev: true,
        directApi: false,
      })
    ).toBe('https://api.example.com/api');
  });

  it('uses production fallback when not dev and no env', () => {
    expect(
      resolveApiBaseUrl({
        isViteDev: false,
      })
    ).toBe('http://localhost:5000/api');
  });
});
