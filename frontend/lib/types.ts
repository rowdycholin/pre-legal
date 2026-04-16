export type MndaTermType = 'expires' | 'until-terminated';
export type ConfTermType = 'years' | 'perpetuity';

export interface NdaFormData {
  purpose: string;
  effectiveDate: string; // YYYY-MM-DD
  mndaTermType: MndaTermType;
  mndaTermYears: number;
  confTermType: ConfTermType;
  confTermYears: number;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  p1Company: string;
  p1Name: string;
  p1Title: string;
  p1Address: string;
  p2Company: string;
  p2Name: string;
  p2Title: string;
  p2Address: string;
}
