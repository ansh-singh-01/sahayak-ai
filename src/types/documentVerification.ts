// ==============================================================================
// SAHAYAK - Document Verification Pipeline Types (PRD §5, §7)
// Three-Layer Verification Architecture: DigiLocker -> OCR & Rules -> Review
// ==============================================================================

export type DocumentStatus = 
  | 'UPLOADED'
  | 'OCR_EXTRACTED'
  | 'AUTO_FLAGGED'
  | 'PENDING_PARTNER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED';

export type VerificationSource = 'DIGILOCKER' | 'OCR_MANUAL';

export type DocumentType = 
  | 'INCOME_CERTIFICATE'
  | 'CASTE_CERTIFICATE'
  | 'AADHAAR_CARD'
  | 'DISABILITY_CERTIFICATE'
  | 'BUSINESS_PLAN'
  | 'VOCATIONAL_CERTIFICATE';

export type AutoFlagCode = 
  | 'NAME_MISMATCH'
  | 'DOB_MISMATCH'
  | 'DOCUMENT_STALE'
  | 'DUPLICATE_DOCUMENT'
  | 'UNRECOGNIZED_ISSUER'
  | 'LOW_OCR_CONFIDENCE';

export interface ExtractedDocumentFields {
  name?: string;
  dob?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  annualIncome?: number;
  casteCategory?: string;
  subCaste?: string;
  validityExpiry?: string;
  ocrConfidencePercent?: number;
}

export interface VerificationAuditEntry {
  id: string;
  timestamp: string;
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  action: string;
  reviewedBy: string;
  reviewerRole: 'SYSTEM_RULE_ENGINE' | 'DIGILOCKER_GATEWAY' | 'PARTNER_STAFF' | 'MINISTRY_ADMIN';
  reason?: string;
  ruleCodeFired?: AutoFlagCode;
}

export interface VerifiableDocument {
  id: string;
  applicationId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryPhone: string;
  beneficiaryCategory: string;
  beneficiaryState: string;
  beneficiaryDistrict: string;
  schemeId: string;
  schemeName: string;
  corporation: 'NSFDC' | 'NBCFDC' | 'NSKFDC';
  documentType: DocumentType;
  documentTitle: string;
  status: DocumentStatus;
  verificationSource: VerificationSource;
  digitalSignatureRef?: string;
  issuerName?: string;
  extractedFields?: ExtractedDocumentFields;
  flags: AutoFlagCode[];
  flagReasonDetails?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  auditTrail: VerificationAuditEntry[];
  submittedAt: string;
  previewUrl?: string;
  retentionExpiryDate: string; // DPDP 90-day retention countdown
}

export interface VerificationTelemetry {
  totalDocumentsProcessed: number;
  digiLockerPassRatePercent: number;
  digiLockerTotalCount: number;
  ocrExtractedTotalCount: number;
  autoFlaggedTotalCount: number;
  autoFlaggedRatePercent: number;
  pendingReviewCount: number;
  verifiedCount: number;
  rejectedCount: number;
  averageTatDays: number;
  topFlagTriggers: {
    flag: AutoFlagCode;
    label: string;
    count: number;
    description: string;
  }[];
}
