import { describe, it, expect } from 'vitest';

describe('ci smoke', () => {
  it('runs Vitest in CI', () => {
    expect(true).toBe(true);
  });
});
