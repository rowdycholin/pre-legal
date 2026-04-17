import type {
  DocumentType,
  NdaFormData,
  PilotFormData,
  DesignPartnerFormData,
  AiAddendumFormData,
} from './types';

export interface DocumentConfig {
  id: DocumentType;
  name: string;
  description: string;
  requiredFields: string[];
  downloadEndpoint: string;
}

export const DOCUMENTS: DocumentConfig[] = [
  {
    id: 'mutual-nda',
    name: 'Mutual Non-Disclosure Agreement',
    description: 'Standard mutual NDA covering confidentiality obligations between two parties',
    requiredFields: [
      'governingLaw', 'jurisdiction',
      'p1Company', 'p1Name', 'p1Title', 'p1Address',
      'p2Company', 'p2Name', 'p2Title', 'p2Address',
    ],
    downloadEndpoint: '/api/download',
  },
  {
    id: 'nda-cover-page',
    name: 'Mutual NDA Cover Page',
    description: 'Cover page only — standard terms incorporated by reference from commonpaper.com',
    requiredFields: [
      'governingLaw', 'jurisdiction',
      'p1Company', 'p1Name', 'p1Title', 'p1Address',
      'p2Company', 'p2Name', 'p2Title', 'p2Address',
    ],
    downloadEndpoint: '/api/download/nda-cover-page',
  },
  {
    id: 'pilot-agreement',
    name: 'Pilot Agreement',
    description: 'Short-term trial agreement allowing a prospective customer to evaluate a product',
    requiredFields: [
      'provider', 'customer', 'product',
      'effectiveDate', 'pilotStart', 'pilotEnd',
      'governingLaw', 'chosenCourts', 'generalCapAmount',
      'p1Name', 'p1Title', 'p1Address',
      'p2Name', 'p2Title', 'p2Address',
    ],
    downloadEndpoint: '/api/download/pilot',
  },
  {
    id: 'design-partner-agreement',
    name: 'Design Partner Agreement',
    description: 'Agreement for early-stage customers collaborating with a vendor on product development',
    requiredFields: [
      'provider', 'partner', 'product', 'program',
      'effectiveDate', 'term',
      'governingLaw', 'chosenCourts',
      'p1Name', 'p1Title', 'p1Address',
      'p2Name', 'p2Title', 'p2Address',
    ],
    downloadEndpoint: '/api/download/design-partner',
  },
  {
    id: 'ai-addendum',
    name: 'AI Addendum',
    description: 'AI-specific provisions addendum to an existing service agreement',
    requiredFields: [
      'provider', 'customer', 'agreementName',
      'effectiveDate', 'governingLaw',
      'p1Name', 'p1Title', 'p1Address',
      'p2Name', 'p2Title', 'p2Address',
    ],
    downloadEndpoint: '/api/download/ai-addendum',
  },
];

export const DOCUMENT_MAP = Object.fromEntries(
  DOCUMENTS.map((d) => [d.id, d]),
) as Record<DocumentType, DocumentConfig>;

const today = () => new Date().toISOString().slice(0, 10);

export const defaultNdaFormData: NdaFormData = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: today(),
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

export const defaultPilotFormData: PilotFormData = {
  provider: '',
  customer: '',
  product: '',
  effectiveDate: today(),
  pilotStart: '',
  pilotEnd: '',
  governingLaw: '',
  chosenCourts: '',
  generalCapAmount: '',
  fees: '',
  p1Name: '',
  p1Title: '',
  p1Address: '',
  p2Name: '',
  p2Title: '',
  p2Address: '',
};

export const defaultDesignPartnerFormData: DesignPartnerFormData = {
  provider: '',
  partner: '',
  product: '',
  program: '',
  effectiveDate: today(),
  term: '',
  governingLaw: '',
  chosenCourts: '',
  fees: '',
  p1Name: '',
  p1Title: '',
  p1Address: '',
  p2Name: '',
  p2Title: '',
  p2Address: '',
};

export const defaultAiAddendumFormData: AiAddendumFormData = {
  provider: '',
  customer: '',
  agreementName: '',
  effectiveDate: today(),
  trainingData: '',
  trainingPurposes: '',
  trainingRestrictions: '',
  improvementRestrictions: '',
  governingLaw: '',
  p1Name: '',
  p1Title: '',
  p1Address: '',
  p2Name: '',
  p2Title: '',
  p2Address: '',
};
