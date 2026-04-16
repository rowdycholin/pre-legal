/**
 * @jest-environment node
 *
 * Tests for the POST /api/download route.
 * Tests the route handler function directly (not via HTTP) to avoid needing
 * a running Next.js server.
 */
import { POST } from '@/app/api/download/route';
import { NextRequest } from 'next/server';
import type { NdaFormData } from '@/lib/types';

function makeRequest(body: Partial<NdaFormData>): NextRequest {
  return new NextRequest('http://localhost/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const fullData: NdaFormData = {
  purpose: 'Testing the API route.',
  effectiveDate: '2026-04-15',
  mndaTermType: 'expires',
  mndaTermYears: 1,
  confTermType: 'years',
  confTermYears: 2,
  governingLaw: 'Delaware',
  jurisdiction: 'Wilmington, Delaware',
  modifications: '',
  p1Company: 'Acme Corp',
  p1Name: 'Jane Smith',
  p1Title: 'CEO',
  p1Address: 'jane@acme.com',
  p2Company: 'Beta LLC',
  p2Name: 'John Doe',
  p2Title: 'CTO',
  p2Address: 'john@beta.com',
};

describe('POST /api/download', () => {
  it('returns 200 with HTML content', async () => {
    const res = await POST(makeRequest(fullData));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('<!DOCTYPE html>');
    expect(text).toContain('Mutual Non-Disclosure Agreement');
  });

  it('returns Content-Disposition: attachment header', async () => {
    const res = await POST(makeRequest(fullData));
    const disposition = res.headers.get('Content-Disposition');
    expect(disposition).toMatch(/attachment/);
    expect(disposition).toMatch(/filename="Mutual-NDA_Acme-Corp_Beta-LLC_2026-04-15\.html"/);
  });

  it('returns Content-Type: text/html', async () => {
    const res = await POST(makeRequest(fullData));
    expect(res.headers.get('Content-Type')).toContain('text/html');
  });

  it('interpolates purpose into the downloaded HTML', async () => {
    const res = await POST(makeRequest(fullData));
    const text = await res.text();
    expect(text).toContain('Testing the API route.');
  });

  it('uses default purpose when not supplied', async () => {
    const res = await POST(makeRequest({ ...fullData, purpose: undefined }));
    const text = await res.text();
    expect(text).toContain('Evaluating whether to enter into a business relationship');
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles missing party names gracefully', async () => {
    const res = await POST(makeRequest({ ...fullData, p1Company: '', p2Company: '' }));
    expect(res.status).toBe(200);
    const disposition = res.headers.get('Content-Disposition');
    expect(disposition).toMatch(/Mutual-NDA_Party1_Party2/);
  });

  it('renders "until terminated" when mndaTermType is until-terminated', async () => {
    const res = await POST(makeRequest({ ...fullData, mndaTermType: 'until-terminated' }));
    const text = await res.text();
    expect(text).toContain('Continues until terminated');
  });

  it('renders "in perpetuity" when confTermType is perpetuity', async () => {
    const res = await POST(makeRequest({ ...fullData, confTermType: 'perpetuity' }));
    const text = await res.text();
    expect(text).toContain('In perpetuity.');
  });

  it('escapes XSS in user-supplied fields', async () => {
    const res = await POST(makeRequest({ ...fullData, purpose: '<script>alert(1)</script>' }));
    const text = await res.text();
    expect(text).not.toContain('<script>alert(1)</script>');
    expect(text).toContain('&lt;script&gt;');
  });
});
