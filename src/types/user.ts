import { BeneficiaryCategory, ProjectPurpose } from './scheme';

export type Gender = 'FEMALE' | 'MALE' | 'TRANSGENDER' | 'OTHER';

export interface CitizenProfile {
  name: string;
  category: BeneficiaryCategory;
  gender: Gender;
  age: number;
  annualFamilyIncome: number; // in INR
  state: string;
  district: string;
  isDifferentlyAbled: boolean;
  purpose: ProjectPurpose;
  projectCost: number; // in INR
  loanAmountRequested: number; // in INR
  preferredTenureYears?: number;
  consentGiven: boolean;
  householdId?: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  relation: 'Self' | 'Mother' | 'Father' | 'Spouse' | 'Son' | 'Daughter' | 'Sibling';
  age: number;
  gender: Gender;
  category: BeneficiaryCategory;
  annualIncome: number;
  purpose: ProjectPurpose | string;
  loanAmountRequested: number;
  matchedSchemeName: string;
  matchedSchemeCode: string;
  matchedAgency: 'NSFDC' | 'NBCFDC' | 'NSKFDC';
  matchedInterestRate: string;
  matchedMaxLoan: string;
  matchScore: number;
  highlightTag: string;
  stage: 'ELIGIBLE' | 'DOCUMENTS_READY' | 'SANCTIONED';
}

export interface DemoProfile {
  id: string;
  label: string;
  hindiLabel: string;
  tagline: string;
  profile: CitizenProfile;
}

