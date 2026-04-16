import {
  formatDate,
  safeFilenamePart,
  buildDownloadFilename,
  buildDownloadHtml,
  defaultFormData,
} from '@/lib/ndaUtils';
import type { NdaFormData } from '@/lib/types';

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

// ── buildDownloadFilename ─────────────────────────────────────────────────────

describe('buildDownloadFilename', () => {
  it('builds a filename from party names and date', () => {
    const data: NdaFormData = {
      ...defaultFormData,
      p1Company: 'Acme Corp',
      p2Company: 'Beta LLC',
      effectiveDate: '2026-04-15',
    };
    expect(buildDownloadFilename(data)).toBe('Mutual-NDA_Acme-Corp_Beta-LLC_2026-04-15.html');
  });

  it('uses Party1/Party2 fallback when company names are empty', () => {
    const data: NdaFormData = { ...defaultFormData, p1Company: '', p2Company: '' };
    const filename = buildDownloadFilename(data);
    expect(filename).toMatch(/^Mutual-NDA_Party1_Party2_/);
    expect(filename.endsWith('.html')).toBe(true);
  });
});

// ── buildDownloadHtml ─────────────────────────────────────────────────────────

describe('buildDownloadHtml', () => {
  const baseData: NdaFormData = {
    ...defaultFormData,
    purpose: 'Evaluating a potential partnership.',
    effectiveDate: '2026-04-15',
    mndaTermType: 'expires',
    mndaTermYears: 2,
    confTermType: 'years',
    confTermYears: 3,
    governingLaw: 'Delaware',
    jurisdiction: 'New Castle, Delaware',
    p1Company: 'Acme Corp',
    p1Name: 'Jane Smith',
    p1Title: 'CEO',
    p1Address: 'jane@acme.com',
    p2Company: 'Beta LLC',
    p2Name: 'John Doe',
    p2Title: 'CTO',
    p2Address: 'john@beta.com',
  };

  it('returns a complete HTML document', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
  });

  it('includes the NDA title', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('Mutual Non-Disclosure Agreement');
  });

  it('interpolates the purpose text', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('Evaluating a potential partnership.');
  });

  it('interpolates the formatted effective date', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('April 15, 2026');
  });

  it('includes the MNDA term with correct year count', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('Expires 2 year(s) from Effective Date.');
  });

  it('includes the confidentiality term with correct year count', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('3 year(s) from Effective Date');
  });

  it('includes governing law and jurisdiction', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('Delaware');
    expect(html).toContain('New Castle, Delaware');
  });

  it('includes party names in signature table', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('Jane Smith');
    expect(html).toContain('John Doe');
    expect(html).toContain('Acme Corp');
    expect(html).toContain('Beta LLC');
  });

  it('renders "until terminated" term when mndaTermType is until-terminated', () => {
    const html = buildDownloadHtml({ ...baseData, mndaTermType: 'until-terminated' });
    expect(html).toContain('Continues until terminated');
    expect(html).not.toContain('Expires 2 year(s)');
  });

  it('renders "in perpetuity" when confTermType is perpetuity', () => {
    const html = buildDownloadHtml({ ...baseData, confTermType: 'perpetuity' });
    expect(html).toContain('In perpetuity.');
    expect(html).not.toContain('3 year(s) from Effective Date');
  });

  it('uses placeholder text when governingLaw is empty', () => {
    const html = buildDownloadHtml({ ...baseData, governingLaw: '' });
    expect(html).toContain('[fill in state]');
  });

  it('uses placeholder text when jurisdiction is empty', () => {
    const html = buildDownloadHtml({ ...baseData, jurisdiction: '' });
    expect(html).toContain('[fill in city or county and state]');
  });

  it('uses "None." when modifications is empty', () => {
    const html = buildDownloadHtml({ ...baseData, modifications: '' });
    expect(html).toContain('None.');
  });

  it('escapes HTML special characters in user input', () => {
    const html = buildDownloadHtml({ ...baseData, purpose: '<script>alert("xss")</script>' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('includes the CC BY 4.0 attribution', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('CC BY 4.0');
    expect(html).toContain('commonpaper.com');
  });

  it('includes a print media query', () => {
    const html = buildDownloadHtml(baseData);
    expect(html).toContain('@media print');
  });
});
