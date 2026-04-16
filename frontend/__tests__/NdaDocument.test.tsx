import { render, screen } from '@testing-library/react';
import NdaDocument from '@/components/NdaDocument';
import { defaultFormData } from '@/lib/ndaUtils';
import type { NdaFormData } from '@/lib/types';

const baseData: NdaFormData = {
  ...defaultFormData,
  purpose: 'Testing the NDA creator.',
  effectiveDate: '2026-06-01',
  mndaTermType: 'expires',
  mndaTermYears: 1,
  confTermType: 'years',
  confTermYears: 2,
  governingLaw: 'California',
  jurisdiction: 'San Francisco, California',
  p1Company: 'Alpha Inc',
  p1Name: 'Alice A',
  p1Title: 'President',
  p1Address: 'alice@alpha.com',
  p2Company: 'Bravo LLC',
  p2Name: 'Bob B',
  p2Title: 'VP',
  p2Address: 'bob@bravo.com',
};

describe('NdaDocument', () => {
  it('renders the NDA title', () => {
    render(<NdaDocument data={baseData} />);
    expect(screen.getAllByText(/Mutual Non-Disclosure Agreement/i).length).toBeGreaterThan(0);
  });

  it('displays the formatted effective date', () => {
    render(<NdaDocument data={baseData} />);
    expect(screen.getAllByText('June 1, 2026').length).toBeGreaterThan(0);
  });

  it('shows a placeholder when effective date is empty', () => {
    render(<NdaDocument data={{ ...baseData, effectiveDate: '' }} />);
    expect(screen.getByText(/Today's date/i)).toBeInTheDocument();
  });

  it('interpolates the purpose text throughout the document', () => {
    render(<NdaDocument data={baseData} />);
    const matches = screen.getAllByText(/Testing the NDA creator\./);
    // Purpose appears in cover page + at least sections 1 and 2 of standard terms
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it('displays the governing law', () => {
    render(<NdaDocument data={baseData} />);
    expect(screen.getAllByText('California').length).toBeGreaterThan(0);
  });

  it('displays the jurisdiction', () => {
    render(<NdaDocument data={baseData} />);
    expect(screen.getAllByText('San Francisco, California').length).toBeGreaterThan(0);
  });

  it('shows governing law placeholder when empty', () => {
    render(<NdaDocument data={{ ...baseData, governingLaw: '' }} />);
    expect(screen.getAllByText(/\[fill in state\]/i).length).toBeGreaterThan(0);
  });

  it('shows jurisdiction placeholder when empty', () => {
    render(<NdaDocument data={{ ...baseData, jurisdiction: '' }} />);
    expect(screen.getAllByText(/\[fill in city or county and state\]/i).length).toBeGreaterThan(0);
  });

  it('renders party names in the signature table', () => {
    render(<NdaDocument data={baseData} />);
    expect(screen.getByText('Alice A')).toBeInTheDocument();
    expect(screen.getByText('Bob B')).toBeInTheDocument();
  });

  it('renders party company names in the signature table header', () => {
    render(<NdaDocument data={baseData} />);
    expect(screen.getAllByText(/Alpha Inc/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bravo LLC/).length).toBeGreaterThan(0);
  });

  it('shows "expires N year(s)" for expires term type', () => {
    render(<NdaDocument data={baseData} />);
    expect(screen.getAllByText(/year\(s\) from Effective Date/i).length).toBeGreaterThan(0);
  });

  it('shows "Continues until terminated" for until-terminated term type', () => {
    render(<NdaDocument data={{ ...baseData, mndaTermType: 'until-terminated' }} />);
    expect(screen.getAllByText(/Continues until terminated/i).length).toBeGreaterThan(0);
  });

  it('shows "In perpetuity" for perpetuity confidentiality term', () => {
    render(<NdaDocument data={{ ...baseData, confTermType: 'perpetuity' }} />);
    expect(screen.getAllByText(/In perpetuity/i).length).toBeGreaterThan(0);
  });

  it('displays modifications text', () => {
    render(<NdaDocument data={{ ...baseData, modifications: 'Section 5 is amended.' }} />);
    expect(screen.getByText('Section 5 is amended.')).toBeInTheDocument();
  });

  it('shows "None." when modifications is empty', () => {
    render(<NdaDocument data={{ ...baseData, modifications: '' }} />);
    expect(screen.getByText('None.')).toBeInTheDocument();
  });

  it('renders all 11 standard term sections', () => {
    render(<NdaDocument data={baseData} />);
    for (let i = 1; i <= 11; i++) {
      expect(screen.getByText(new RegExp(`^${i}\\.`))).toBeInTheDocument();
    }
  });

  it('includes the CC BY 4.0 license link', () => {
    render(<NdaDocument data={baseData} />);
    expect(screen.getByText(/CC BY 4\.0/i)).toBeInTheDocument();
  });
});
