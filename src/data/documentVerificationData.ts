import { VerifiableDocument, VerificationTelemetry } from '../types/documentVerification';

export const INITIAL_VERIFICATION_TELEMETRY: VerificationTelemetry = {
  totalDocumentsProcessed: 24180,
  digiLockerPassRatePercent: 74.2,
  digiLockerTotalCount: 17942,
  ocrExtractedTotalCount: 6238,
  autoFlaggedTotalCount: 2370,
  autoFlaggedRatePercent: 9.8,
  pendingReviewCount: 4304,
  verifiedCount: 18912,
  rejectedCount: 964,
  averageTatDays: 1.8,
  topFlagTriggers: [
    {
      flag: 'NAME_MISMATCH',
      label: 'Name Mismatch',
      count: 842,
      description: 'Discrepancy between applicant profile name and certificate text'
    },
    {
      flag: 'DOCUMENT_STALE',
      label: 'Stale / Expired Certificate',
      count: 710,
      description: 'Income certificate issue date older than 12-month statutory freshness window'
    },
    {
      flag: 'UNRECOGNIZED_ISSUER',
      label: 'Unrecognized Issuing Authority',
      count: 312,
      description: 'Certificate not issued by designated SDO/Tehsildar/Revenue Officer'
    },
    {
      flag: 'DUPLICATE_DOCUMENT',
      label: 'Duplicate Document Recycling',
      count: 189,
      description: 'Same certificate number submitted across multiple beneficiary accounts'
    },
    {
      flag: 'DOB_MISMATCH',
      label: 'Date of Birth Mismatch',
      count: 204,
      description: 'Discrepancy in date of birth between Aadhaar and state certificate'
    },
    {
      flag: 'LOW_OCR_CONFIDENCE',
      label: 'Low OCR Confidence',
      count: 113,
      description: 'Blurry or corrupted image scan routed directly to human-in-the-loop review'
    }
  ]
};

export const MOCK_VERIFIABLE_DOCUMENTS: VerifiableDocument[] = [
  {
    id: 'DOC-2026-001',
    applicationId: 'APP-MP-2026-9921',
    beneficiaryId: 'CITIZEN-001',
    beneficiaryName: 'Ramesh Kumar',
    beneficiaryPhone: '9876543210',
    beneficiaryCategory: 'OBC',
    beneficiaryState: 'Madhya Pradesh',
    beneficiaryDistrict: 'Indore',
    schemeId: 'nbcfdc-eli-01',
    schemeName: 'General Loan Scheme (Term Loan) - NBCFDC',
    corporation: 'NBCFDC',
    documentType: 'INCOME_CERTIFICATE',
    documentTitle: 'Annual Income Certificate (Tahsildar Issued)',
    status: 'AUTO_FLAGGED',
    verificationSource: 'OCR_MANUAL',
    extractedFields: {
      name: 'Ramesh K. Verma',
      dob: '12-05-1988',
      certificateNumber: 'MP/REV/2026/099182',
      issuingAuthority: 'Tehsildar, Indore Sadar, MP',
      issueDate: '14-Jan-2025',
      annualIncome: 180000,
      casteCategory: 'OBC (Sonar)',
      validityExpiry: '13-Jan-2026',
      ocrConfidencePercent: 94.2
    },
    flags: ['NAME_MISMATCH', 'DOCUMENT_STALE'],
    flagReasonDetails: [
      '[Rule #1] Name Mismatch: Document reads "Ramesh K. Verma", but applicant profile is registered as "Ramesh Kumar".',
      '[Rule #3] Freshness Window Expired: Certificate was issued on 14-Jan-2025 (>12 months ago). MoSJE statutory freshness window is 12 months.'
    ],
    auditTrail: [
      {
        id: 'AUD-001',
        timestamp: '2026-09-08T10:14:22Z',
        fromStatus: 'UPLOADED',
        toStatus: 'OCR_EXTRACTED',
        action: 'OCR extraction completed with 94.2% confidence',
        reviewedBy: 'Tesseract OCR Pipeline v4.1',
        reviewerRole: 'SYSTEM_RULE_ENGINE'
      },
      {
        id: 'AUD-002',
        timestamp: '2026-09-08T10:14:25Z',
        fromStatus: 'OCR_EXTRACTED',
        toStatus: 'AUTO_FLAGGED',
        action: 'Rule Engine triggered NAME_MISMATCH and DOCUMENT_STALE flags',
        reviewedBy: 'MoSJE Rule Engine Sentinel',
        reviewerRole: 'SYSTEM_RULE_ENGINE',
        reason: 'Automated cross-check detected name deviation and expired certificate date'
      }
    ],
    submittedAt: '2026-09-08 10:14 AM',
    retentionExpiryDate: '88 days remaining (DPDP Act §8 compliant)'
  },
  {
    id: 'DOC-2026-002',
    applicationId: 'APP-UP-2026-7841',
    beneficiaryId: 'CITIZEN-002',
    beneficiaryName: 'Sunita Devi',
    beneficiaryPhone: '9812345678',
    beneficiaryCategory: 'SC',
    beneficiaryState: 'Uttar Pradesh',
    beneficiaryDistrict: 'Varanasi',
    schemeId: 'nsfdc-msy-01',
    schemeName: 'Mahila Samriddhi Yojana (MSY) - NSFDC',
    corporation: 'NSFDC',
    documentType: 'CASTE_CERTIFICATE',
    documentTitle: 'Scheduled Caste Certificate (SDO Verified)',
    status: 'VERIFIED',
    verificationSource: 'DIGILOCKER',
    digitalSignatureRef: 'DL-UP-2026-SC-88912-DS',
    issuerName: 'Sub-Divisional Magistrate (SDM), Varanasi Sadar',
    extractedFields: {
      name: 'Sunita Devi',
      dob: '08-11-1991',
      certificateNumber: 'UP/SC/2025/441209',
      issuingAuthority: 'SDM Varanasi, Government of Uttar Pradesh',
      issueDate: '10-Jul-2025',
      casteCategory: 'Scheduled Caste (Chamar)',
      ocrConfidencePercent: 100
    },
    flags: [],
    flagReasonDetails: [],
    reviewedBy: 'National DigiLocker Gateway (MeitY)',
    reviewedAt: '2026-09-08 14:20 PM',
    auditTrail: [
      {
        id: 'AUD-003',
        timestamp: '2026-09-08T14:20:01Z',
        fromStatus: 'UPLOADED',
        toStatus: 'VERIFIED',
        action: '1-Click Source Verification via DigiLocker Sandbox API',
        reviewedBy: 'DigiLocker Auth Gateway',
        reviewerRole: 'DIGILOCKER_GATEWAY',
        reason: 'Cryptographic SHA-256 digital signature verified against UP e-District repository'
      }
    ],
    submittedAt: '2026-09-08 02:20 PM',
    retentionExpiryDate: 'Metadata only retained (raw scan pruned per DPDP §8)'
  },
  {
    id: 'DOC-2026-003',
    applicationId: 'APP-MH-2026-3190',
    beneficiaryId: 'CITIZEN-003',
    beneficiaryName: 'Babu Lal Solanki',
    beneficiaryPhone: '9765432109',
    beneficiaryCategory: 'SAFAI_KARAMCHARI',
    beneficiaryState: 'Maharashtra',
    beneficiaryDistrict: 'Nagpur',
    schemeId: 'nskfdc-suy-01',
    schemeName: 'Swachhta Udyami Yojana (SUY) - NSKFDC',
    corporation: 'NSFDC',
    documentType: 'INCOME_CERTIFICATE',
    documentTitle: 'Dependent Safai Karamchari Income Certificate',
    status: 'AUTO_FLAGGED',
    verificationSource: 'OCR_MANUAL',
    extractedFields: {
      name: 'Babu Lal Solanki',
      dob: '02-03-1984',
      certificateNumber: 'MH/REV/2024/991200',
      issuingAuthority: 'Tahsildar Nagpur Urban',
      issueDate: '18-Feb-2026',
      annualIncome: 120000,
      casteCategory: 'Safai Karamchari Dependent',
      ocrConfidencePercent: 96.8
    },
    flags: ['DUPLICATE_DOCUMENT'],
    flagReasonDetails: [
      '[Rule #4] Duplicate Document Alert: Certificate # MH/REV/2024/991200 is already registered under Application # APP-MH-2025-1102 (User: Prakash Solanki, Pune). Potential cross-district subsidy recycling.'
    ],
    auditTrail: [
      {
        id: 'AUD-004',
        timestamp: '2026-09-08T16:05:10Z',
        fromStatus: 'UPLOADED',
        toStatus: 'OCR_EXTRACTED',
        action: 'OCR extraction successful (96.8% confidence)',
        reviewedBy: 'OCR Worker 02',
        reviewerRole: 'SYSTEM_RULE_ENGINE'
      },
      {
        id: 'AUD-005',
        timestamp: '2026-09-08T16:05:13Z',
        fromStatus: 'OCR_EXTRACTED',
        toStatus: 'AUTO_FLAGGED',
        action: 'Cross-District Duplicate Sentinel Triggered',
        reviewedBy: 'MoSJE Central De-Duplication Engine',
        reviewerRole: 'SYSTEM_RULE_ENGINE',
        reason: 'Duplicate certificate number matched active file in Pune district'
      }
    ],
    submittedAt: '2026-09-08 04:05 PM',
    retentionExpiryDate: '89 days remaining (DPDP Act §8 compliant)'
  },
  {
    id: 'DOC-2026-004',
    applicationId: 'APP-MP-2026-1049',
    beneficiaryId: 'CITIZEN-004',
    beneficiaryName: 'Pooja Verma',
    beneficiaryPhone: '9425012345',
    beneficiaryCategory: 'OBC',
    beneficiaryState: 'Madhya Pradesh',
    beneficiaryDistrict: 'Ujjain',
    schemeId: 'nbcfdc-msy-01',
    schemeName: 'Mahila Samriddhi Yojana (NBCFDC)',
    corporation: 'NBCFDC',
    documentType: 'CASTE_CERTIFICATE',
    documentTitle: 'OBC Caste & Non-Creamy Layer Certificate',
    status: 'PENDING_PARTNER_REVIEW',
    verificationSource: 'OCR_MANUAL',
    extractedFields: {
      name: 'Pooja Verma',
      dob: '22-09-1995',
      certificateNumber: 'MP/OBC/2025/778102',
      issuingAuthority: 'Sub Divisional Officer (SDO) Revenue, Ujjain',
      issueDate: '12-Nov-2025',
      annualIncome: 145000,
      casteCategory: 'OBC (Darji)',
      ocrConfidencePercent: 98.4
    },
    flags: [],
    flagReasonDetails: [],
    auditTrail: [
      {
        id: 'AUD-006',
        timestamp: '2026-09-09T06:12:00Z',
        fromStatus: 'UPLOADED',
        toStatus: 'OCR_EXTRACTED',
        action: 'OCR extraction successful (98.4% confidence)',
        reviewedBy: 'Tesseract OCR Pipeline',
        reviewerRole: 'SYSTEM_RULE_ENGINE'
      },
      {
        id: 'AUD-007',
        timestamp: '2026-09-09T06:12:03Z',
        fromStatus: 'OCR_EXTRACTED',
        toStatus: 'PENDING_PARTNER_REVIEW',
        action: 'All 6 automated rule checks passed cleanly',
        reviewedBy: 'MoSJE Rule Engine',
        reviewerRole: 'SYSTEM_RULE_ENGINE',
        reason: 'Clean match on Name, DOB, Freshness, and Authority. Awaiting Layer 3 Human Sign-off.'
      }
    ],
    submittedAt: '2026-09-09 06:12 AM',
    retentionExpiryDate: '90 days remaining (DPDP Act §8 compliant)'
  },
  {
    id: 'DOC-2026-005',
    applicationId: 'APP-DL-2026-4401',
    beneficiaryId: 'CITIZEN-005',
    beneficiaryName: 'Amit Mehra',
    beneficiaryPhone: '9911223344',
    beneficiaryCategory: 'SC',
    beneficiaryState: 'Delhi',
    beneficiaryDistrict: 'North West Delhi',
    schemeId: 'nsfdc-eli-02',
    schemeName: 'Educational Loan Scheme (ELIS) - NSFDC',
    corporation: 'NSFDC',
    documentType: 'AADHAAR_CARD',
    documentTitle: 'UIDAI Aadhaar Card',
    status: 'VERIFIED',
    verificationSource: 'DIGILOCKER',
    digitalSignatureRef: 'DL-UIDAI-2026-EKYC-99014',
    issuerName: 'Unique Identification Authority of India (UIDAI)',
    extractedFields: {
      name: 'Amit Mehra',
      dob: '15-01-2002',
      certificateNumber: 'XXXX-XXXX-4812',
      issuingAuthority: 'UIDAI Govt of India',
      issueDate: '20-Oct-2024',
      ocrConfidencePercent: 100
    },
    flags: [],
    flagReasonDetails: [],
    reviewedBy: 'DigiLocker Auth Gateway',
    reviewedAt: '2026-09-09 07:30 AM',
    auditTrail: [
      {
        id: 'AUD-008',
        timestamp: '2026-09-09T07:30:15Z',
        fromStatus: 'UPLOADED',
        toStatus: 'VERIFIED',
        action: 'DigiLocker biometric eKYC digital signature confirmed',
        reviewedBy: 'UIDAI DigiLocker Service',
        reviewerRole: 'DIGILOCKER_GATEWAY'
      }
    ],
    submittedAt: '2026-09-09 07:30 AM',
    retentionExpiryDate: 'Metadata only retained (raw scan pruned per DPDP §8)'
  },
  {
    id: 'DOC-2026-006',
    applicationId: 'APP-MP-2026-6612',
    beneficiaryId: 'CITIZEN-006',
    beneficiaryName: 'Deepak Chouhan',
    beneficiaryPhone: '9826098765',
    beneficiaryCategory: 'SC',
    beneficiaryState: 'Madhya Pradesh',
    beneficiaryDistrict: 'Bhopal',
    schemeId: 'nsfdc-eli-01',
    schemeName: 'Term Loan Scheme for Small Business - NSFDC',
    corporation: 'NSFDC',
    documentType: 'INCOME_CERTIFICATE',
    documentTitle: 'Income Certificate from Notary Advocate',
    status: 'AUTO_FLAGGED',
    verificationSource: 'OCR_MANUAL',
    extractedFields: {
      name: 'Deepak Chouhan',
      dob: '30-07-1990',
      certificateNumber: 'NOTARY/BPL/2026/112',
      issuingAuthority: 'Public Notary Advocate, Bhopal District Court',
      issueDate: '01-Aug-2026',
      annualIncome: 95000,
      casteCategory: 'SC',
      ocrConfidencePercent: 88.5
    },
    flags: ['UNRECOGNIZED_ISSUER'],
    flagReasonDetails: [
      '[Rule #5] Unrecognized Issuing Authority: Certificate issued by "Public Notary Advocate". MoSJE statutory guidelines mandate Income Certificates issued strictly by Tehsildar, Naib Tehsildar, or SDO (Revenue).'
    ],
    auditTrail: [
      {
        id: 'AUD-009',
        timestamp: '2026-09-09T08:00:10Z',
        fromStatus: 'UPLOADED',
        toStatus: 'OCR_EXTRACTED',
        action: 'OCR extraction completed',
        reviewedBy: 'OCR Worker 01',
        reviewerRole: 'SYSTEM_RULE_ENGINE'
      },
      {
        id: 'AUD-010',
        timestamp: '2026-09-09T08:00:12Z',
        fromStatus: 'OCR_EXTRACTED',
        toStatus: 'AUTO_FLAGGED',
        action: 'Issuer Authority Whitelist Validation Failed',
        reviewedBy: 'MoSJE Rule Engine Sentinel',
        reviewerRole: 'SYSTEM_RULE_ENGINE',
        reason: 'Private notary declaration is legally inadmissible for capital subsidy disbursal'
      }
    ],
    submittedAt: '2026-09-09 08:00 AM',
    retentionExpiryDate: '90 days remaining (DPDP Act §8 compliant)'
  },
  {
    id: 'DOC-2026-007',
    applicationId: 'APP-MH-2026-8819',
    beneficiaryId: 'CITIZEN-007',
    beneficiaryName: 'Rekha Kamble',
    beneficiaryPhone: '9730112233',
    beneficiaryCategory: 'SC',
    beneficiaryState: 'Maharashtra',
    beneficiaryDistrict: 'Mumbai Suburban',
    schemeId: 'nsfdc-msy-01',
    schemeName: 'Mahila Samriddhi Yojana (MSY) - NSFDC',
    corporation: 'NSFDC',
    documentType: 'CASTE_CERTIFICATE',
    documentTitle: 'Caste Scrutiny Certificate',
    status: 'REJECTED',
    verificationSource: 'OCR_MANUAL',
    extractedFields: {
      name: 'Rekha Kamble',
      dob: '19-04-1987',
      certificateNumber: 'MH/CSC/2023/0019',
      issuingAuthority: 'Divisional Caste Scrutiny Committee, Konkan',
      issueDate: '11-Jan-2023',
      casteCategory: 'SC (Mahar)',
      ocrConfidencePercent: 54.0
    },
    flags: ['LOW_OCR_CONFIDENCE'],
    flagReasonDetails: [
      '[Rule #6] Low OCR Confidence: Document image scan heavily blurred and unreadable. Human reviewer confirmed photo illegible.'
    ],
    reviewedBy: 'Nodal Officer S. Deshmukh (MPBCDC Mumbai)',
    reviewedAt: '2026-09-09 08:45 AM',
    rejectionReason: 'Scan unreadable / blurred. Please re-upload a clear flat scan or pull verified copy directly via DigiLocker.',
    auditTrail: [
      {
        id: 'AUD-011',
        timestamp: '2026-09-09T08:15:00Z',
        fromStatus: 'UPLOADED',
        toStatus: 'AUTO_FLAGGED',
        action: 'Low OCR confidence threshold (<60%) triggered',
        reviewedBy: 'OCR Worker 02',
        reviewerRole: 'SYSTEM_RULE_ENGINE'
      },
      {
        id: 'AUD-012',
        timestamp: '2026-09-09T08:45:20Z',
        fromStatus: 'AUTO_FLAGGED',
        toStatus: 'REJECTED',
        action: 'Partner Staff rejected with resubmission notice',
        reviewedBy: 'S. Deshmukh (MPBCDC Mumbai)',
        reviewerRole: 'PARTNER_STAFF',
        reason: 'Scan unreadable / blurred. Beneficiary SMS notification dispatched.'
      }
    ],
    submittedAt: '2026-09-09 08:15 AM',
    retentionExpiryDate: 'Terminal State (Scheduled for auto-purge in 30 days)'
  }
];
