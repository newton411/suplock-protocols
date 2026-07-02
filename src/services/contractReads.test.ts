import { describe, expect, it } from 'vitest';
import { formatReadableAmount, normalizeViewValue } from './contractReads';

describe('contract read helpers', () => {
  it('normalizes bigint and numeric view values', () => {
    expect(normalizeViewValue([12n])).toBe(12);
    expect(normalizeViewValue('1250000')).toBe(1250000);
    expect(normalizeViewValue([['41', '42']])).toBe(0);
  });

  it('formats large values into compact human-friendly strings', () => {
    expect(formatReadableAmount(1250000)).toBe('1.25M');
    expect(formatReadableAmount(1250000000)).toBe('1.25B');
    expect(formatReadableAmount(0)).toBe('0');
  });
});
