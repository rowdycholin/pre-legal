import type { NdaFormData } from './types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const monthIndex = parseInt(m, 10) - 1;
  const dayNum = parseInt(d, 10);
  if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11 || isNaN(dayNum)) return dateStr;
  return `${MONTHS[monthIndex]} ${dayNum}, ${y}`;
}

export function safeFilenamePart(s: string): string {
  return s.replace(/[^a-zA-Z0-9_\-.]/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

export const defaultFormData: NdaFormData = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: new Date().toISOString().slice(0, 10),
  mndaTermType: 'expires',
  mndaTermYears: 1,
  confTermType: 'years',
  confTermYears: 1,
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
  p1Company: '',
  p1Name: '',
  p1Title: '',
  p1Address: '',
  p2Company: '',
  p2Name: '',
  p2Title: '',
  p2Address: '',
};
