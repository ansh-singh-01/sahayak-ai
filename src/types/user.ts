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
}

export interface DemoProfile {
  id: string;
  label: string;
  hindiLabel: string;
  tagline: string;
  profile: CitizenProfile;
}
