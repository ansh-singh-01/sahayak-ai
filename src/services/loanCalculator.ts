import { Scheme } from '../types/scheme';

export interface AmortizationRow {
  period: number; // Month or Year number
  label: string;
  isMoratorium: boolean;
  openingBalance: number;
  emiPayment: number;
  principalComponent: number;
  interestComponent: number;
  closingBalance: number;
}

export interface LoanCalculationResult {
  principalAmount: number;
  annualInterestRate: number;
  tenureYears: number;
  totalTenureMonths: number;
  moratoriumMonths: number;
  postMoratoriumMonths: number;
  regularMonthlyEmi: number;
  moratoriumMonthlyInterest: number;
  totalInterestPayable: number;
  totalAmountPayable: number;
  subsidyAmount: number;
  netLoanAfterSubsidy: number;
  amortizationSchedule: AmortizationRow[];
  yearlySchedule: AmortizationRow[];
  hasCeilingWarning: boolean;
  warningMessage?: string;
  hindiWarningMessage?: string;
}

export class LoanCalculatorService {
  /**
   * Calculates comprehensive loan amortization schedule with moratorium support
   */
  public static calculate(
    requestedAmount: number,
    tenureYears: number,
    moratoriumMonths: number,
    scheme?: Scheme
  ): LoanCalculationResult {
    // 1. Check scheme interest slab or default
    let interestRate = 6.0;
    let maxAllowed = 5000000;
    let subsidy = 0;

    if (scheme) {
      maxAllowed = scheme.maxLoanAmount;
      // find slab
      for (const slab of scheme.interestSlabs) {
        if (requestedAmount >= slab.minAmount && (slab.maxAmount === 0 || requestedAmount <= slab.maxAmount)) {
          interestRate = slab.ratePercent;
          break;
        }
      }

      // calculate subsidy if any
      if (scheme.subsidyPercentage && scheme.subsidyPercentage > 0) {
        const potentialSubsidy = (requestedAmount * scheme.subsidyPercentage) / 100;
        subsidy = scheme.maxSubsidyAmount ? Math.min(potentialSubsidy, scheme.maxSubsidyAmount) : potentialSubsidy;
      }
    }

    const hasCeilingWarning = requestedAmount > maxAllowed;
    let warningMessage = undefined;
    let hindiWarningMessage = undefined;

    if (hasCeilingWarning) {
      const diff = requestedAmount - maxAllowed;
      warningMessage = `Requested loan ₹${(requestedAmount / 100000).toFixed(2)} Lakh exceeds scheme ceiling of ₹${(maxAllowed / 100000).toFixed(2)} Lakh by ₹${(diff / 100000).toFixed(2)} Lakh. Calculation is capped to eligible ceiling.`;
      hindiWarningMessage = `मांगी गई राशि योजना की अधिकतम सीमा ₹${(maxAllowed / 100000).toFixed(2)} लाख से अधिक है। गणना पात्र सीमा पर की जा रही है।`;
    }

    const principal = hasCeilingWarning ? maxAllowed : requestedAmount;
    const netPrincipal = Math.max(0, principal - subsidy);

    const totalMonths = tenureYears * 12;
    const effectiveMoratorium = Math.min(moratoriumMonths, totalMonths - 6);
    const activeRepaymentMonths = totalMonths - effectiveMoratorium;

    const monthlyRate = (interestRate / 100) / 12;

    // Monthly interest during moratorium (Simple interest only, principal is deferred)
    const moratoriumMonthlyInterest = netPrincipal * monthlyRate;

    // Standard EMI formula for post-moratorium period:
    // P * r * (1+r)^n / ((1+r)^n - 1)
    let regularMonthlyEmi = 0;
    if (monthlyRate > 0 && activeRepaymentMonths > 0) {
      const numerator = netPrincipal * monthlyRate * Math.pow(1 + monthlyRate, activeRepaymentMonths);
      const denominator = Math.pow(1 + monthlyRate, activeRepaymentMonths) - 1;
      regularMonthlyEmi = denominator > 0 ? (numerator / denominator) : (netPrincipal / activeRepaymentMonths);
    } else if (activeRepaymentMonths > 0) {
      regularMonthlyEmi = netPrincipal / activeRepaymentMonths;
    }

    // Build Month-by-Month Amortization
    let balance = netPrincipal;
    let totalInterest = 0;
    const monthlySchedule: AmortizationRow[] = [];

    // 1. Moratorium Period
    for (let m = 1; m <= effectiveMoratorium; m++) {
      const interestPayment = balance * monthlyRate;
      totalInterest += interestPayment;
      monthlySchedule.push({
        period: m,
        label: `Month ${m} (Moratorium)`,
        isMoratorium: true,
        openingBalance: Math.round(balance),
        emiPayment: Math.round(interestPayment),
        principalComponent: 0,
        interestComponent: Math.round(interestPayment),
        closingBalance: Math.round(balance)
      });
    }

    // 2. Active Repayment Period
    for (let m = 1; m <= activeRepaymentMonths; m++) {
      const monthIndex = effectiveMoratorium + m;
      const interestPart = balance * monthlyRate;
      let principalPart = regularMonthlyEmi - interestPart;

      if (m === activeRepaymentMonths || principalPart > balance) {
        principalPart = balance;
      }

      const payment = principalPart + interestPart;
      balance = Math.max(0, balance - principalPart);
      totalInterest += interestPart;

      monthlySchedule.push({
        period: monthIndex,
        label: `Month ${monthIndex}`,
        isMoratorium: false,
        openingBalance: Math.round(balance + principalPart),
        emiPayment: Math.round(payment),
        principalComponent: Math.round(principalPart),
        interestComponent: Math.round(interestPart),
        closingBalance: Math.round(balance)
      });
    }

    // Aggregate into yearly schedule for clean presentation
    const yearlySchedule: AmortizationRow[] = [];
    let currentYearPrincipal = 0;
    let currentYearInterest = 0;
    let currentYearPayment = 0;
    let yearOpeningBalance = netPrincipal;

    for (let i = 0; i < monthlySchedule.length; i++) {
      const row = monthlySchedule[i];
      currentYearPrincipal += row.principalComponent;
      currentYearInterest += row.interestComponent;
      currentYearPayment += row.emiPayment;

      const isYearEnd = (i + 1) % 12 === 0 || i === monthlySchedule.length - 1;
      if (isYearEnd) {
        const yearNum = Math.ceil((i + 1) / 12);
        yearlySchedule.push({
          period: yearNum,
          label: `Year ${yearNum}`,
          isMoratorium: yearNum === 1 && effectiveMoratorium >= 12,
          openingBalance: Math.round(yearOpeningBalance),
          emiPayment: Math.round(currentYearPayment),
          principalComponent: Math.round(currentYearPrincipal),
          interestComponent: Math.round(currentYearInterest),
          closingBalance: Math.round(row.closingBalance)
        });

        yearOpeningBalance = row.closingBalance;
        currentYearPrincipal = 0;
        currentYearInterest = 0;
        currentYearPayment = 0;
      }
    }

    return {
      principalAmount: principal,
      annualInterestRate: interestRate,
      tenureYears,
      totalTenureMonths: totalMonths,
      moratoriumMonths: effectiveMoratorium,
      postMoratoriumMonths: activeRepaymentMonths,
      regularMonthlyEmi: Math.round(regularMonthlyEmi),
      moratoriumMonthlyInterest: Math.round(moratoriumMonthlyInterest),
      totalInterestPayable: Math.round(totalInterest),
      totalAmountPayable: Math.round(netPrincipal + totalInterest),
      subsidyAmount: Math.round(subsidy),
      netLoanAfterSubsidy: Math.round(netPrincipal),
      amortizationSchedule: monthlySchedule,
      yearlySchedule,
      hasCeilingWarning,
      warningMessage,
      hindiWarningMessage
    };
  }
}
