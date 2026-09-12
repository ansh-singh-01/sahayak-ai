import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Percent, 
  Calendar, 
  Clock, 
  HelpCircle, 
  TrendingDown, 
  ShieldAlert,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Scheme } from '../../types/scheme';
import { SchemeRegistryService } from '../../services/schemeRegistry';
import { LoanCalculatorService } from '../../services/loanCalculator';
import { CostBreakdownChart } from './CostBreakdownChart';
import { AmortizationTable } from './AmortizationTable';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface LoanCalculatorProps {
  selectedScheme: Scheme | null;
  onSelectScheme: (scheme: Scheme) => void;
  language: Language;
  onNavigateToFamilyLoan?: (scheme: Scheme) => void;
  isAuthenticated?: boolean;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  selectedScheme,
  onSelectScheme,
  language,
  onNavigateToFamilyLoan,
  isAuthenticated = false
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  const [availableSchemes, setAvailableSchemes] = useState<Scheme[]>(SchemeRegistryService.getAllSchemes());

  React.useEffect(() => {
    const unsubscribe = SchemeRegistryService.subscribe(() => {
      setAvailableSchemes(SchemeRegistryService.getAllSchemes());
    });
    return unsubscribe;
  }, []);

  const activeScheme = selectedScheme || availableSchemes[0];

  const [loanAmount, setLoanAmount] = useState<number>(350000);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(activeScheme.moratoriumMonths || 6);

  // Synchronize defaults if scheme changes
  React.useEffect(() => {
    if (selectedScheme) {
      setMoratoriumMonths(selectedScheme.moratoriumMonths || 0);
      setTenureYears(Math.min(tenureYears, selectedScheme.maxTenureYears || 5));
      if (loanAmount > selectedScheme.maxLoanAmount) {
        setLoanAmount(selectedScheme.maxLoanAmount);
      }
    }
  }, [selectedScheme]);

  // Run calculation
  const calcResult = useMemo(() => {
    return LoanCalculatorService.calculate(
      loanAmount,
      tenureYears,
      moratoriumMonths,
      activeScheme
    );
  }, [loanAmount, tenureYears, moratoriumMonths, activeScheme]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
          {t.calculatorTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {t.calculatorSubtitle}
        </p>
      </div>

      {/* Scheme Selector Pills */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          {isHindi ? 'योजना चुनें (मॉडलिंग हेतु):' : 'Select Scheme for Official Interest Slabs:'}
        </label>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {availableSchemes.map((sch) => {
            const isSelected = sch.id === activeScheme.id;
            return (
              <button
                key={sch.id}
                onClick={() => {
                  onSelectScheme(sch);
                  setLoanAmount(Math.min(loanAmount, sch.maxLoanAmount));
                  setMoratoriumMonths(sch.moratoriumMonths);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[10px] opacity-70">[{sch.agency}]</span>
                <span>{isHindi ? sch.hindiName : sch.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* USP 1: TAKE THE LOAN IN A FAMILY MEMBER'S NAME (DISPLAYED ONLY AFTER SIGN IN) */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-5 sm:p-6 border border-indigo-500/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{isHindi ? 'ब्याज बचत अवसर' : 'Interest Rate Optimizer'}</span>
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {isHindi ? 'रियायती दर 3.5% – 4.0% p.a.' : 'Concessional 3.5% – 4.0% p.a.'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {isHindi ? 'परिवार के सदस्य के नाम पर ऋण लें' : "Take the Loan in a Family Member's Name"}
            </h3>

            <p className="text-xs text-indigo-200/90 leading-relaxed max-w-2xl">
              {isHindi
                ? `चयनित योजना "${isHindi ? activeScheme.hindiName : activeScheme.name}" के स्थान पर यदि आप माता, पत्नी या छात्र संतान के नाम पर आवेदन करते हैं तो न्यूनतम 3.5%–4.0% रियायती ब्याज व शून्य-गारंटी लाभ प्राप्त हो सकता है।`
                : `Modeling for "${activeScheme.name}"? Taking the loan in your Mother's, Wife's, or Student Child's name can lower your interest rate to 3.5%–4.0% with zero-collateral and moratorium benefits.`}
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToFamilyLoan) {
                  onNavigateToFamilyLoan(activeScheme);
                }
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-600 to-indigo-700 hover:from-indigo-600 hover:to-blue-800 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.02] active:scale-95"
            >
              <Users className="w-4 h-4 text-white" />
              <span>{isHindi ? 'परिवार ऋण विकल्प देखें →' : "Family Loan Options →"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Ceiling Advisory Warning if loan exceeds scheme cap */}
      {calcResult.hasCeilingWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-950 block">{t.ceilingWarning}</strong>
            <p className="mt-0.5">
              {isHindi ? calcResult.hindiWarningMessage : calcResult.warningMessage}
            </p>
          </div>
        </div>
      )}

      {/* Two Column Layout: Sliders on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>{isHindi ? 'ऋण शर्तें निर्धारित करें' : 'Loan Input Parameters'}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {calcResult.annualInterestRate}% {isHindi ? 'लागू ब्याज' : 'Interest Slab'}
            </span>
          </h3>

          {/* Loan Amount Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.principalAmount}
              </label>
              <span className="text-base font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                ₹{loanAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={25000}
              max={activeScheme.maxLoanAmount}
              step={25000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>₹25k</span>
              <span>₹{(activeScheme.maxLoanAmount / 100000).toFixed(1)}L Max</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.tenure} ({tenureYears} {isHindi ? 'वर्ष' : 'Years'})
              </label>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                {tenureYears * 12} {isHindi ? 'महीने' : 'Months'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={activeScheme.maxTenureYears || 8}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1 {isHindi ? 'वर्ष' : 'Yr'}</span>
              <span>{activeScheme.maxTenureYears} {isHindi ? 'वर्ष अधिकतम' : 'Yrs Max'}</span>
            </div>
          </div>

          {/* Moratorium Months Slider */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{t.moratorium}</span>
              </label>
              <span className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                {moratoriumMonths} {isHindi ? 'महीने' : 'Months'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={moratoriumMonths}
              onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-amber-900 mt-2 leading-relaxed">
              💡 <strong>{isHindi ? 'मोराटोरियम लाभ:' : 'Moratorium Advantage:'}</strong> {t.moratoriumExplain}
            </p>
          </div>

          {/* Scheme Interest Slabs Info Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700 block mb-2">
              {isHindi ? 'आधिकारिक ब्याज स्लैब:' : 'Official MoSJE Concessional Slabs:'}
            </span>
            <div className="space-y-1 text-slate-600 text-[11px]">
              {activeScheme.interestSlabs.map((sl, i) => (
                <div key={i} className="flex justify-between py-0.5 border-b border-slate-200/60 last:border-0">
                  <span>{sl.description}</span>
                  <span className="font-bold text-orange-600">{sl.ratePercent}% p.a.</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Output Summary Cards & Cost Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Key Output Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Regular Monthly EMI */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">
                {t.monthlyEmi}
              </span>
              <div className="text-2xl sm:text-3xl font-black mt-1 font-sans">
                ₹{calcResult.regularMonthlyEmi.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {isHindi ? 'मोराटोरियम समाप्ति के बाद' : `For remaining ${calcResult.postMoratoriumMonths} months`}
              </span>
            </div>

            {/* Moratorium Monthly Interest */}
            <div className="bg-white rounded-3xl p-5 border-2 border-amber-300 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                {t.moratoriumEmi}
              </span>
              <div className="text-2xl sm:text-3xl font-black mt-1 text-amber-900 font-sans">
                ₹{calcResult.moratoriumMonthlyInterest.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block">
                {isHindi ? 'आरंभिक छूट महीनों में देय' : `During initial ${calcResult.moratoriumMonths} months`}
              </span>
            </div>

            {/* Total Interest */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {t.totalInterest}
              </span>
              <div className="text-xl font-bold mt-1 text-orange-600 font-sans">
                ₹{calcResult.totalInterestPayable.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Total Amount Payable */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {t.totalPayable}
              </span>
              <div className="text-xl font-bold mt-1 text-slate-900 font-sans">
                ₹{calcResult.totalAmountPayable.toLocaleString('en-IN')}
              </div>
            </div>

          </div>

          {/* Donut Chart Visual */}
          <CostBreakdownChart
            principal={calcResult.principalAmount}
            totalInterest={calcResult.totalInterestPayable}
            subsidy={calcResult.subsidyAmount}
            language={language}
          />

        </div>

      </div>

      {/* Amortization Table */}
      <AmortizationTable
        yearlySchedule={calcResult.yearlySchedule}
        monthlySchedule={calcResult.amortizationSchedule}
        language={language}
      />

    </div>
  );
};
