import { BeneficiaryCategory } from './scheme';

export type UserRole = 'CITIZEN' | 'PARTNER' | 'MINISTRY';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  category?: BeneficiaryCategory;
  state?: string;
  district?: string;
  designation?: string;
  agency?: string;
  token: string;
  dpdpConsentTimestamp: string;
}

export interface LoginPayload {
  identifier: string; // phone or email or officer ID
  password?: string;
  otp?: string;
  role: UserRole;
}

export interface SignUpPayload {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: UserRole;
  category: BeneficiaryCategory;
  state: string;
  district: string;
  consentGiven: boolean;
}

export interface AuthResponse {
  status: 'SUCCESS' | 'ERROR';
  message?: string;
  data?: {
    user: AuthUser;
    token: string;
  };
}
