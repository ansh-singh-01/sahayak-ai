export type PartnerType = 'SCA' | 'RRB' | 'PSU_BANK' | 'COOPERATIVE_BANK';

export interface PartnerReliabilityMetrics {
  averageResponseTimeDays: number; // e.g. 4.2 days vs 18 days
  allocatedFundUtilizationPercent: number; // e.g. 68% utilized = available; 98% = exhausted
  grievanceResolutionRate: number; // e.g. 96%
  activeApplicationQuota: number; // Remaining slots this quarter
  lastAuditDate: string;
}

export interface ChannelPartner {
  id: string;
  name: string;
  hindiName: string;
  type: PartnerType;
  typeLabel: string;
  supportedAgencies: ('NSFDC' | 'NBCFDC' | 'NSKFDC')[];
  state: string;
  district: string;
  address: string;
  pinCode: string;
  lat: number;
  lng: number;
  contactPerson: string;
  designation: string;
  phone: string;
  email: string;
  workingHours: string;
  reliability: PartnerReliabilityMetrics;
  acceptingNewApplications: boolean;
}

export interface RankedPartner extends ChannelPartner {
  distanceKm: number;
  compositeScore: number;
  rank: number;
  rankingRationale: string;
  reliabilityLevel: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'CONGESTED';
}
