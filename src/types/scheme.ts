export type MinistryAgency = 'NSFDC' | 'NBCFDC' | 'NSKFDC';

export type BeneficiaryCategory = 'SC' | 'ST' | 'OBC' | 'SAFAI_KARAMCHARI' | 'OPEN' | 'ANY';

export type ProjectPurpose = 
  | 'SMALL_BUSINESS'
  | 'AGRICULTURE'
  | 'GREEN_BUSINESS'
  | 'SANITATION_REHAB'
  | 'WOMEN_MICROCREDIT'
  | 'SKILL_TRAINING'
  | 'EDUCATION'
  | 'TRANSPORT_VEHICLE';

export interface InterestSlab {
  minAmount: number;
  maxAmount: number;
  ratePercent: number;
  description: string;
}

export interface SchemeRule {
  ruleId: string;
  field: string;
  condition: 'lte' | 'gte' | 'equals' | 'in' | 'boolean';
  expectedValue: any;
  explanation: string;
  weight: number;
}

export interface Scheme {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  agency: MinistryAgency;
  agencyFullName: string;
  targetCommunity: BeneficiaryCategory[];
  description: string;
  hindiDescription: string;
  maxProjectCost: number; // in INR
  maxLoanAmount: number; // in INR
  subsidyPercentage?: number; // e.g., up to 33% or fixed capital subsidy
  maxSubsidyAmount?: number;
  interestSlabs: InterestSlab[];
  maxTenureYears: number;
  moratoriumMonths: number;
  eligiblePurposes: ProjectPurpose[];
  genderRestriction?: 'FEMALE_ONLY' | 'ALL';
  incomeCeiling: number; // in INR per annum (e.g. 300000)
  rules: SchemeRule[];
  requiredDocuments: string[];
  keyBenefits: string[];
  officialPortalUrl: string;
  tagline: string;
}
