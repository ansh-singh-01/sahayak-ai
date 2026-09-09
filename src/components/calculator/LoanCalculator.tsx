import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Coins, 
  Percent, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Info, 
  ChevronRight,
  HelpCircle,
  Building2
} from 'lucide-react';
import { Scheme } from '../../types/scheme';
import { REAL_MOSJE_SCHEMES } from '../../data/schemesData';
import { LoanCalculatorService } from '../../services/loanCalculator';
import { CostBreakdownChart } from './CostBreakdownChart';
import { AmortizationTable } from './AmortizationTable';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface LoanCalculatorProps {
  selectedScheme: Scheme | null;
  onSelectScheme: (scheme: Scheme) => void;
  language: Language;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  selectedScheme,
  onSelectScheme,
  language
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  const activeScheme = selectedScheme || REAL_MOSJE_SCHEMES[6]; // default to NBCFDC GLS

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
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
            {isHindi ? 'वित्तीय मॉडलर' : 'Financial Modeler'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
            {t.calculatorTitle}
          </h2>
        </div>
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
          {REAL_MOSJE_SCHEMES.map((sch) => {
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
