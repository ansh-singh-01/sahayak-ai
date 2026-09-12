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

export interface RejectionDetails {
  type: 'FIXABLE' | 'HARD_INELIGIBLE';
  code: 'DOCUMENT_STALE' | 'NAME_MISMATCH' | 'INCOME_CEILING_EXCEEDED' | 'CATEGORY_MISMATCH' | 'INCOMPLETE_DPR';
  title: string;
  hindiTitle?: string;
  reason: string;
  hindiReason?: string;
  ruleCitation: string;
  resolutionStep: string;
  hindiResolutionStep?: string;
  actionableCta: string;
  alternativeSchemes?: {
    schemeName: string;
    agency: MinistryAgency;
    reason: string;
  }[];
}

export interface ApplicationEscalation {
  id: string;
  ticketNumber: string; // e.g. ESC-2026-9041
  raisedAt: string;
  reason: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  assignedTo: string; // SUPPORT_OFFICER
  officerContact?: string;
  slaHoursRemaining: number;
  expectedResolutionTime: string;
  auditNote?: string;
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
  // USP 2: Explain My Rejection Details
  rejectionDetails?: RejectionDetails;
  // USP 3: Grievance Escalation for Stalled Applications
  expectedDecisionDays?: number;
  daysInCurrentStage?: number;
  isStalled?: boolean;
  escalation?: ApplicationEscalation | null;
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
