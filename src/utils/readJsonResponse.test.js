import { describe, expect, it } from 'vitest';
import { readJsonResponse } from './readJsonResponse';

function mockResponse(status, body, contentType = 'text/html') {
  return new Response(body, {
    status,
    headers: { 'content-type': contentType },
  });
}

describe('readJsonResponse', () => {
  it('throws a clear error when body is HTML', async () => {
    const res = mockResponse(200, '<!DOCTYPE html><html>', 'text/html');
    await expect(readJsonResponse(res, 'Test')).rejects.toThrow(/HTML instead of JSON/i);
  });

  it('parses JSON with application/json', async () => {
    const res = mockResponse(200, '{"a":1}', 'application/json; charset=utf-8');
    await expect(readJsonResponse(res, 'Test')).resolves.toEqual({ a: 1 });
  });

  it('parses JSON without json content-type if body is object-like', async () => {
    const res = new Response('[]', { status: 200, headers: { 'content-type': 'text/plain' } });
    await expect(readJsonResponse(res, 'Test')).resolves.toEqual([]);
  });
});
