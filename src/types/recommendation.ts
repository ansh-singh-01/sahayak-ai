import { Scheme } from './scheme';

export interface RuleEvaluationResult {
  ruleId: string;
  field: string;
  passed: boolean;
  userValue: any;
  requiredValue: any;
  explanation: string;
  weight: number;
}

export interface EligibilityGap {
  field: string;
  fieldLabel: string;
  userValue: any;
  requiredValue: any;
  gapDifference: string;
  remediationAdvice: string;
  hindiAdvice: string;
}

export interface SchemeRecommendation {
  scheme: Scheme;
  isEligible: boolean;
  matchScore: number; // 0 to 100
  passedRules: RuleEvaluationResult[];
  failedRules: RuleEvaluationResult[];
  eligibilityGaps: EligibilityGap[];
  qualifyingRoadmap?: string[];
  reasons: string[];
  hindiReasons: string[];
  maxEligibleLoan: number;
  calculatedApplicableInterestRate: number;
}

export interface EvaluationOutcome {
  eligibleSchemes: SchemeRecommendation[];
  nearMissSchemes: SchemeRecommendation[]; // Missed by small margin, with explicit gap report
  timestamp: string;
  evaluationId: string;
}
