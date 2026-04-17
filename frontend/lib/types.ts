export type MndaTermType = 'expires' | 'until-terminated';
export type ConfTermType = 'years' | 'perpetuity';

export type DocumentType =
  | 'mutual-nda'
  | 'nda-cover-page'
  | 'pilot-agreement'
  | 'design-partner-agreement'
  | 'ai-addendum';

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

export interface PilotFormData {
  provider: string;
  customer: string;
  product: string;
  effectiveDate: string;
  pilotStart: string;
  pilotEnd: string;
  governingLaw: string;
  chosenCourts: string;
  generalCapAmount: string;
  fees: string;
  p1Name: string;
  p1Title: string;
  p1Address: string;
  p2Name: string;
  p2Title: string;
  p2Address: string;
}

export interface DesignPartnerFormData {
  provider: string;
  partner: string;
  product: string;
  program: string;
  effectiveDate: string;
  term: string;
  governingLaw: string;
  chosenCourts: string;
  fees: string;
  p1Name: string;
  p1Title: string;
  p1Address: string;
  p2Name: string;
  p2Title: string;
  p2Address: string;
}

export interface AiAddendumFormData {
  provider: string;
  customer: string;
  agreementName: string;
  effectiveDate: string;
  trainingData: string;
  trainingPurposes: string;
  trainingRestrictions: string;
  improvementRestrictions: string;
  governingLaw: string;
  p1Name: string;
  p1Title: string;
  p1Address: string;
  p2Name: string;
  p2Title: string;
  p2Address: string;
}
