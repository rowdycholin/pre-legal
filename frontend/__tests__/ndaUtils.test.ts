import {
  formatDate,
  safeFilenamePart,
  defaultFormData,
} from '@/lib/ndaUtils';

// ── formatDate ────────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a valid date correctly', () => {
    expect(formatDate('2026-04-15')).toBe('April 15, 2026');
  });

  it('handles single-digit day', () => {
    expect(formatDate('2026-01-05')).toBe('January 5, 2026');
  });

  it('handles all 12 months', () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    months.forEach((month, i) => {
      const m = String(i + 1).padStart(2, '0');
      expect(formatDate(`2026-${m}-01`)).toBe(`${month} 1, 2026`);
    });
  });

  it('returns empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });

  it('returns the original string when format is invalid', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

// ── safeFilenamePart ─────────────────────────────────────────────────────────

describe('safeFilenamePart', () => {
  it('passes through alphanumeric characters unchanged', () => {
    expect(safeFilenamePart('AcmeCorp')).toBe('AcmeCorp');
  });

  it('replaces spaces with hyphens', () => {
    expect(safeFilenamePart('Acme Corp')).toBe('Acme-Corp');
  });

  it('replaces unsafe characters', () => {
    expect(safeFilenamePart('Foo/Bar<Baz')).toBe('Foo-Bar-Baz');
  });

  it('strips leading and trailing hyphens', () => {
    expect(safeFilenamePart('  Acme  ')).toBe('--Acme--'.replace(/^-+|-+$/g, ''));
  });

  it('returns "unknown" for empty string', () => {
    expect(safeFilenamePart('')).toBe('unknown');
  });
});

// ── defaultFormData ───────────────────────────────────────────────────────────

describe('defaultFormData', () => {
  it('has a non-empty default purpose', () => {
    expect(defaultFormData.purpose.length).toBeGreaterThan(0);
  });

  it('defaults mndaTermType to expires', () => {
    expect(defaultFormData.mndaTermType).toBe('expires');
  });

  it('defaults confTermType to years', () => {
    expect(defaultFormData.confTermType).toBe('years');
  });
});
