import { Scheme, MinistryAgency } from './scheme';
import { RankedPartner } from './partner';

export type ApplicationStage = 
  | 'RECOMMENDED' 
  | 'DOCUMENTS_PENDING' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED';

export interface DocumentAuditItem {
  name: string;
  isReady: boolean;
  requiredForScheme: boolean;
  issuingAuthority: string;
  notes?: string;
}

export interface ApplicationTimelineEvent {
  stage: ApplicationStage;
  title: string;
  hindiTitle?: string;
  description: string;
  timestamp: string;
  completed: boolean;
  officerRole?: string;
}

export interface BeneficiaryApplicationItem {
  id: string;
  referenceNumber: string; // e.g. SHK-849201
  schemeId: string;
  schemeName: string;
  schemeCode: string;
  agency: MinistryAgency;
  category: string;
  requestedAmount: number;
  projectCost: number;
  stage: ApplicationStage;
  appliedDate: string;
  lastUpdated: string;
  partner?: RankedPartner | null;
  partnerId?: string;
  partnerName?: string;
  partnerAddress?: string;
  partnerPhone?: string;
  partnerDistanceKm?: number;
  documentsTotal: number;
  documentsReady: number;
  documentsList: DocumentAuditItem[];
  timeline: ApplicationTimelineEvent[];
}

export interface BeneficiaryNotification {
  id: string;
  title: string;
  hindiTitle?: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'PARTNER_RESPONSE' | 'DOC_VERIFIED' | 'ELIGIBILITY_UPDATE' | 'GENERAL';
  actionLabel?: string;
  targetTab?: 'checklist' | 'calculator' | 'partners' | 'recommendations';
}
