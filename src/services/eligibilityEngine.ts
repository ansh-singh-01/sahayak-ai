import { Scheme, SchemeRule } from '../types/scheme';
import { CitizenProfile } from '../types/user';
import { 
  SchemeRecommendation, 
  RuleEvaluationResult, 
  EligibilityGap, 
  EvaluationOutcome 
} from '../types/recommendation';
import { SchemeRegistryService } from './schemeRegistry';

export class EligibilityEngine {
  /**
   * Evaluates a single rule deterministically
   */
  private static evaluateRule(rule: SchemeRule, profile: CitizenProfile, scheme: Scheme): RuleEvaluationResult {
    let passed = false;
    let userVal: any = undefined;

    switch (rule.field) {
      case 'category':
        userVal = profile.category;
        if (rule.condition === 'in') {
          const isCategoryMatch = (expected: string, userCat: string) => {
            if (expected === userCat) return true;
            if ((expected === 'SC' || expected === 'ST') && (userCat === 'SC' || userCat === 'ST')) return true;
            return false;
          };
          passed = Array.isArray(rule.expectedValue) 
            ? rule.expectedValue.some((exp: string) => isCategoryMatch(exp, profile.category))
            : isCategoryMatch(rule.expectedValue, profile.category);
        }
        break;

      case 'annualFamilyIncome':
        userVal = profile.annualFamilyIncome;
        if (rule.condition === 'lte') {
          passed = profile.annualFamilyIncome <= rule.expectedValue;
        }
        break;

      case 'projectCost':
        userVal = profile.projectCost;
        if (rule.condition === 'lte') {
          passed = profile.projectCost <= rule.expectedValue;
        }
        break;

      case 'loanAmountRequested':
        userVal = profile.loanAmountRequested;
        if (rule.condition === 'lte') {
          passed = profile.loanAmountRequested <= rule.expectedValue;
        }
        break;

      case 'gender':
        userVal = profile.gender;
        if (rule.condition === 'equals') {
          passed = profile.gender === rule.expectedValue;
        }
        break;

      case 'purpose':
        userVal = profile.purpose;
        if (rule.condition === 'equals') {
          passed = profile.purpose === rule.expectedValue;
        } else if (rule.condition === 'in') {
          passed = Array.isArray(rule.expectedValue) && rule.expectedValue.includes(profile.purpose);
        }
        break;

      case 'age':
        userVal = profile.age;
        if (rule.condition === 'gte') {
          passed = profile.age >= rule.expectedValue;
        } else if (rule.condition === 'in') {
          passed = profile.age >= rule.expectedValue[0] && profile.age <= rule.expectedValue[1];
        }
        break;

      default:
        passed = true;
    }

    return {
      ruleId: rule.ruleId,
      field: rule.field,
      passed,
      userValue: userVal,
      requiredValue: rule.expectedValue,
      explanation: rule.explanation,
      weight: rule.weight
    };
  }

  /**
   * Computes gap to eligibility for failed rules
   */
  private static computeGaps(failedRules: RuleEvaluationResult[], profile: CitizenProfile, scheme: Scheme): EligibilityGap[] {
    const gaps: EligibilityGap[] = [];

    for (const rule of failedRules) {
      if (rule.field === 'annualFamilyIncome') {
        const diff = profile.annualFamilyIncome - scheme.incomeCeiling;
        gaps.push({
          field: 'annualFamilyIncome',
          fieldLabel: 'Annual Family Income',
          userValue: `₹${(profile.annualFamilyIncome / 100000).toFixed(2)} Lakh`,
          requiredValue: `₹${(scheme.incomeCeiling / 100000).toFixed(2)} Lakh limit`,
          gapDifference: `Exceeds ceiling by ₹${diff.toLocaleString('en-IN')}`,
          remediationAdvice: `You would qualify if annual family income is certified at or below ₹${scheme.incomeCeiling.toLocaleString('en-IN')}.`,
          hindiAdvice: `यदि आपकी पारिवारिक वार्षिक आय ₹${(scheme.incomeCeiling / 100000).toFixed(2)} लाख या उससे कम प्रमाणित होती है तो आप पात्र होंगे।`
        });
      } else if (rule.field === 'category') {
        gaps.push({
          field: 'category',
          fieldLabel: 'Beneficiary Category',
          userValue: profile.category,
          requiredValue: scheme.targetCommunity.join(' or '),
          gapDifference: `Requires ${scheme.targetCommunity.join('/')} certificate`,
          remediationAdvice: `This scheme is reserved under statutory mandate for ${scheme.targetCommunity.join('/')} beneficiaries. Explore schemes under your category (${profile.category}).`,
          hindiAdvice: `यह योजना केवल ${scheme.targetCommunity.join('/')} वर्ग के लिए आरक्षित है।`
        });
      } else if (rule.field === 'gender') {
        gaps.push({
          field: 'gender',
          fieldLabel: 'Gender Restriction',
          userValue: profile.gender,
          requiredValue: 'Women Only (महिला विशेष)',
          gapDifference: 'Reserved exclusively for women entrepreneurs',
          remediationAdvice: 'You can apply jointly with or in the name of an eligible female family member/entrepreneur.',
          hindiAdvice: 'यह योजना विशेष रूप से महिला उद्यमियों हेतु है। परिवार की पात्र महिला सदस्य के नाम से आवेदन कर सकते हैं।'
        });
      } else if (rule.field === 'projectCost') {
        const excess = profile.projectCost - scheme.maxProjectCost;
        gaps.push({
          field: 'projectCost',
          fieldLabel: 'Project Cost Limit',
          userValue: `₹${(profile.projectCost / 100000).toFixed(2)} Lakh`,
          requiredValue: `Up to ₹${(scheme.maxProjectCost / 100000).toFixed(2)} Lakh`,
          gapDifference: `Project cost exceeds ceiling by ₹${excess.toLocaleString('en-IN')}`,
          remediationAdvice: `Revise estimated project cost down to ₹${scheme.maxProjectCost.toLocaleString('en-IN')} or apply under a higher-band term loan.`,
          hindiAdvice: `प्रस्तावित प्रोजेक्ट लागत को ₹${(scheme.maxProjectCost / 100000).toFixed(2)} लाख के भीतर समायोजित करें।`
        });
      } else if (rule.field === 'loanAmountRequested') {
        const excess = profile.loanAmountRequested - scheme.maxLoanAmount;
        gaps.push({
          field: 'loanAmountRequested',
          fieldLabel: 'Maximum Loan Band',
          userValue: `₹${(profile.loanAmountRequested / 100000).toFixed(2)} Lakh`,
          requiredValue: `Up to ₹${(scheme.maxLoanAmount / 100000).toFixed(2)} Lakh`,
          gapDifference: `Requested loan exceeds maximum limit by ₹${excess.toLocaleString('en-IN')}`,
          remediationAdvice: `Reduce requested loan to ₹${scheme.maxLoanAmount.toLocaleString('en-IN')} or consider composite funding with state subsidy.`,
          hindiAdvice: `ऋण राशि को ₹${(scheme.maxLoanAmount / 100000).toFixed(2)} लाख तक सीमित करें।`
        });
      }
    }

    return gaps;
  }

  /**
   * Calculates applicable interest rate from scheme slabs
   */
  public static getApplicableInterestRate(amount: number, scheme: Scheme): number {
    for (const slab of scheme.interestSlabs) {
      if (amount >= slab.minAmount && (slab.maxAmount === 0 || amount <= slab.maxAmount)) {
        return slab.ratePercent;
      }
    }
    return scheme.interestSlabs[scheme.interestSlabs.length - 1]?.ratePercent || 6.0;
  }

  /**
   * Evaluates all schemes against user profile
   */
  public static evaluateAllSchemes(profile: CitizenProfile, schemes: Scheme[] = SchemeRegistryService.getAllSchemes()): EvaluationOutcome {
    const eligibleList: SchemeRecommendation[] = [];
    const nearMissList: SchemeRecommendation[] = [];

    for (const scheme of schemes) {
      const passedRules: RuleEvaluationResult[] = [];
      const failedRules: RuleEvaluationResult[] = [];

      for (const rule of scheme.rules) {
        const result = this.evaluateRule(rule, profile, scheme);
        if (result.passed) {
          passedRules.push(result);
        } else {
          failedRules.push(result);
        }
      }

      // Hard eligibility condition: All mandatory rules must pass
      const isHardEligible = failedRules.length === 0;

      // Calculate weighted score
      let matchScore = 0;
      const reasons: string[] = [];
      const hindiReasons: string[] = [];

      if (isHardEligible) {
        // 1. Purpose fit
        const isExactPurpose = scheme.eligiblePurposes.includes(profile.purpose);
        const purposeScore = isExactPurpose ? 35 : 15;
        if (isExactPurpose) {
          reasons.push(`Targeted purpose match: Suitable for ${profile.purpose.replace('_', ' ').toLowerCase()}`);
          hindiReasons.push(`उद्देश्य अनुकूलता: आपके व्यवसाय उद्देश्य के सर्वथा उपयुक्त`);
        }

        // 2. Category match
        const isCatMatch = scheme.targetCommunity.includes(profile.category) ||
          ((profile.category === 'SC' || profile.category === 'ST') && (scheme.targetCommunity.includes('SC') || scheme.targetCommunity.includes('ST')));
        const catScore = isCatMatch ? 30 : 0;
        reasons.push(`Community eligibility verified: Meets ${profile.category} criteria under ${scheme.agency}`);
        hindiReasons.push(`समुदाय पात्रता: ${scheme.agency} अंतर्गत ${profile.category} वर्ग मापदंड पूर्ण`);

        // 3. Income Headroom fit
        let incomeScore = 20;
        if (scheme.incomeCeiling > 0) {
          const headroom = (scheme.incomeCeiling - profile.annualFamilyIncome) / scheme.incomeCeiling;
          incomeScore = Math.min(20, Math.round(10 + (headroom * 10)));
          reasons.push(`Income within threshold: ₹${(profile.annualFamilyIncome / 100000).toFixed(2)}L vs ₹${(scheme.incomeCeiling / 100000).toFixed(2)}L limit`);
          hindiReasons.push(`आय सीमा के भीतर: ₹${(profile.annualFamilyIncome / 100000).toFixed(2)} लाख (अधिकतम ₹${(scheme.incomeCeiling / 100000).toFixed(2)} लाख)`);
        }

        // 4. Project cost and loan headroom fit
        let projectScore = 15;
        if (profile.loanAmountRequested <= scheme.maxLoanAmount) {
          reasons.push(`Requested loan ₹${(profile.loanAmountRequested / 100000).toFixed(2)}L is within scheme ceiling ₹${(scheme.maxLoanAmount / 100000).toFixed(2)}L`);
          hindiReasons.push(`ऋण राशि योजना सीमा के पूर्णतः अनुकूल`);
        } else {
          projectScore = 8;
        }

        matchScore = Math.min(98, purposeScore + catScore + incomeScore + projectScore);

        const applicableRate = this.getApplicableInterestRate(profile.loanAmountRequested, scheme);

        eligibleList.push({
          scheme,
          isEligible: true,
          matchScore,
          passedRules,
          failedRules: [],
          eligibilityGaps: [],
          reasons,
          hindiReasons,
          maxEligibleLoan: Math.min(profile.projectCost * 0.9, scheme.maxLoanAmount),
          calculatedApplicableInterestRate: applicableRate
        });
      } else {
        // Compute Gap to Eligibility
        const gaps = this.computeGaps(failedRules, profile, scheme);

        // Check if this qualifies as an honest "Near Miss":
        // E.g. failed only 1 rule, or income within 25% of ceiling, or wrong gender/category
        const isSingleFailure = failedRules.length === 1;
        const isIncomeNearMiss = failedRules.length <= 2 && 
          failedRules.some(r => r.field === 'annualFamilyIncome') && 
          profile.annualFamilyIncome <= scheme.incomeCeiling * 1.30;
        const isGenderMismatch = isSingleFailure && failedRules[0].field === 'gender';

        if (isSingleFailure || isIncomeNearMiss || isGenderMismatch) {
          const partialScore = Math.max(40, 85 - (failedRules.length * 20));
          const roadmap = gaps.map(g => g.remediationAdvice);

          nearMissList.push({
            scheme,
            isEligible: false,
            matchScore: partialScore,
            passedRules,
            failedRules,
            eligibilityGaps: gaps,
            qualifyingRoadmap: roadmap,
            reasons: [`Not eligible today due to ${failedRules.length} criterion/criteria`],
            hindiReasons: [`वर्तमान में ${failedRules.length} शर्त पूरी न होने के कारण अपात्र`],
            maxEligibleLoan: scheme.maxLoanAmount,
            calculatedApplicableInterestRate: this.getApplicableInterestRate(scheme.maxLoanAmount / 2, scheme)
          });
        }
      }
    }

    // Sort eligible by match score descending
    eligibleList.sort((a, b) => b.matchScore - a.matchScore);
    // Sort near-miss by score descending
    nearMissList.sort((a, b) => b.matchScore - a.matchScore);

    return {
      eligibleSchemes: eligibleList,
      nearMissSchemes: nearMissList.slice(0, 3), // top 3 near misses
      timestamp: new Date().toISOString(),
      evaluationId: `EVAL-${Date.now().toString(36).toUpperCase()}`
    };
  }
}
