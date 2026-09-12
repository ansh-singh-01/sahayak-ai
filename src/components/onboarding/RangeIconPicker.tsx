import React from 'react';
import { 
  HeartHandshake, 
  Store, 
  Briefcase, 
  Building2, 
  Wrench, 
  Truck, 
  Coins, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../../services/i18nService';

interface RangeOption {
  value: number;
  label: string;
  hindiLabel: string;
  subtext: string;
  hindiSubtext: string;
  icon: any;
  color: string;
}

interface RangeIconPickerProps {
  mode: 'INCOME' | 'LOAN';
  value: number;
  onChange: (val: number) => void;
  language: Language;
}

export const RangeIconPicker: React.FC<RangeIconPickerProps> = ({
  mode,
  value,
  onChange,
  language
}) => {
  const isHindi = language === 'hi';

  const incomeOptions: RangeOption[] = [
    {
      value: 120000,
      label: '₹0 – ₹1.5 Lakh',
      hindiLabel: '₹0 – ₹1.5 लाख',
      subtext: 'BPL / Antyodaya (Max Subsidies)',
      hindiSubtext: 'बीपीएल / अंत्योदय (अधिकतम सब्सिडी)',
      icon: HeartHandshake,
      color: 'emerald'
    },
    {
      value: 250000,
      label: '₹1.5 – ₹3.0 Lakh',
      hindiLabel: '₹1.5 – ₹3.0 लाख',
      subtext: 'Standard MoSJE Concession Band',
      hindiSubtext: 'मानक मंत्रालय रियायती श्रेणी',
      icon: Store,
      color: 'amber'
    },
    {
      value: 400000,
      label: '₹3.0 – ₹5.0 Lakh',
      hindiLabel: '₹3.0 – ₹5.0 लाख',
      subtext: 'Term Loan / Working Capital',
      hindiSubtext: 'टर्म लोन / कार्यशील पूंजी',
      icon: Briefcase,
      color: 'blue'
    },
    {
      value: 600000,
      label: '₹5.0 Lakh+',
      hindiLabel: '₹5.0 लाख से अधिक',
      subtext: 'Higher Enterprise Band',
      hindiSubtext: 'उच्च उद्यम ऋण श्रेणी',
      icon: Building2,
      color: 'purple'
    }
  ];

  const loanOptions: RangeOption[] = [
    {
      value: 50000,
      label: '₹50,000',
      hindiLabel: '₹50,000',
      subtext: 'Micro-Credit & Hand Tools',
      hindiSubtext: 'सूक्ष्म ऋण एवं औजार',
      icon: Wrench,
      color: 'emerald'
    },
    {
      value: 200000,
      label: '₹2.0 Lakh',
      hindiLabel: '₹2.0 लाख',
      subtext: 'Retail Shop & Small Business',
      hindiSubtext: 'दुकान व लघु व्यवसाय',
      icon: Store,
      color: 'amber'
    },
    {
      value: 500000,
      label: '₹5.0 Lakh',
      hindiLabel: '₹5.0 लाख',
      subtext: 'Machinery & Vehicles',
      hindiSubtext: 'मशीनरी व व्यावसायिक वाहन',
      icon: Truck,
      color: 'blue'
    },
    {
      value: 1500000,
      label: '₹15.0 Lakh',
      hindiLabel: '₹15.0 लाख',
      subtext: 'Medium Enterprise / Factory',
      hindiSubtext: 'मध्यम उद्योग / विस्तार',
      icon: Building2,
      color: 'purple'
    }
  ];

  const options = mode === 'INCOME' ? incomeOptions : loanOptions;

  // Determine which card is active based on value range
  const isSelected = (optVal: number) => {
    if (mode === 'INCOME') {
      if (optVal === 120000) return value <= 150000;
      if (optVal === 250000) return value > 150000 && value <= 300000;
      if (optVal === 400000) return value > 300000 && value <= 500000;
      return value > 500000;
    } else {
      if (optVal === 50000) return value <= 100000;
      if (optVal === 200000) return value > 100000 && value <= 350000;
      if (optVal === 500000) return value > 350000 && value <= 800000;
      return value > 800000;
    }
  };

  return (
    <div className="space-y-4">
      {/* 4 Large Tappable Icon Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = isSelected(opt.value);

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between text-left cursor-pointer active:scale-95 group ${
                active
                  ? 'border-orange-500 bg-orange-50/60 shadow-md ring-2 ring-orange-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between w-full mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  active 
                    ? 'bg-orange-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {active && (
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                )}
              </div>

              <div>
                <span className="font-black text-sm text-slate-900 block font-sans">
                  {isHindi ? opt.hindiLabel : opt.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 block leading-tight font-medium">
                  {isHindi ? opt.hindiSubtext : opt.subtext}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Fine-Tuning Slider */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
            {isHindi ? 'सटीक समायोजन (स्लाइडर):' : 'Fine-Tune Adjustment (Slider):'}
          </span>
          <span className="font-black text-orange-700 bg-white px-2.5 py-0.5 rounded-lg border border-orange-200 font-sans">
            ₹{(value / 100000).toFixed(2)} Lakh
          </span>
        </div>

        <input
          type="range"
          min={mode === 'INCOME' ? 50000 : 20000}
          max={mode === 'INCOME' ? 600000 : 2500000}
          step={mode === 'INCOME' ? 10000 : 25000}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-orange-600 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>{mode === 'INCOME' ? '₹0.50 L' : '₹20k'}</span>
          <span>{mode === 'INCOME' ? '₹3.00 L (MoSJE Cap)' : '₹5.00 L'}</span>
          <span>{mode === 'INCOME' ? '₹6.00 L' : '₹25.00 L'}</span>
        </div>
      </div>
    </div>
  );
};
