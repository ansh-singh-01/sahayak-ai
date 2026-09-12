import React, { useState, useMemo, useEffect } from 'react';
import { 
  Scale, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  HeartHandshake, 
  X, 
  Building2, 
  Coins, 
  FileText, 
  Percent, 
  Printer, 
  Check, 
  HelpCircle, 
  Lock, 
  Tractor, 
  Wrench,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sliders,
  PlusCircle,
  Clock,
  ArrowLeftRight,
  Share2,
  MapPin,
  FileCheck2,
  Award,
  Eye,
  EyeOff,
  Layers
} from 'lucide-react';
import { Scheme } from '../../types/scheme';
import { CitizenProfile, Gender } from '../../types/user';
import { AuthUser } from '../../types/auth';
import { Language, TRANSLATIONS } from '../../services/i18nService';
import { SchemeRegistryService } from '../../services/schemeRegistry';
import { AddSchemeModal } from '../partners/AddSchemeModal';
import { LoanCalculatorService } from '../../services/loanCalculator';

interface SchemeComparatorProps {
  language: Language;
  selectedScheme: Scheme | null;
  onSelectScheme: (scheme: Scheme) => void;
  onNavigateTab: (tab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth' | 'compare') => void;
  profile: CitizenProfile;
  authUser: AuthUser | null;
}

// Preset opportunity definitions for taking loans in family member's name
interface FamilyOpportunityPreset {
  id: string;
  relation: 'Mother' | 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Sibling';
  defaultName: string;
  age: number;
  gender: 'FEMALE' | 'MALE';
  titleEn: string;
  titleHi: string;
  schemeCode: string;
  schemeNameEn: string;
  schemeNameHi: string;
  agency: 'NSFDC' | 'NBCFDC' | 'NSKFDC';
  interestRate: string;
  maxAmountStr: string;
  maxAmountNum: number;
  highlightTagEn: string;
  highlightTagHi: string;
  whyInMemberNameEn: string;
  whyInMemberNameHi: string;
  savingEstimateEn: string;
  savingEstimateHi: string;
  iconType: 'mother' | 'student' | 'farmer' | 'youth';
}

const FAMILY_OPPORTUNITIES: FamilyOpportunityPreset[] = [
  {
    id: 'opp-mother-spouse',
    relation: 'Mother',
    defaultName: 'Sunita Devi',
    age: 50,
    gender: 'FEMALE',
    titleEn: 'Mother or Wife',
    titleHi: 'माता या पत्नी',
    schemeCode: 'NBC-MSY-04',
    schemeNameEn: 'Mahila Samriddhi Yojana (Micro-Credit for Women)',
    schemeNameHi: 'महिला समृद्धि योजना (महिलाओं हेतु रियायती सूक्ष्म ऋण)',
    agency: 'NBCFDC',
    interestRate: '4.0%',
    maxAmountStr: '₹1.40 Lakh',
    maxAmountNum: 140000,
    highlightTagEn: 'Flat 4.0% p.a. (Save ~2.5% Interest)',
    highlightTagHi: 'मात्र 4.0% वार्षिक ब्याज (~2.5% बचत)',
    whyInMemberNameEn: 'Exclusive to female beneficiaries! Men cannot apply in their own name. Taking the loan in your Mother\'s or Wife\'s name unlocks the 4.0% rate with zero collateral.',
    whyInMemberNameHi: 'यह योजना केवल महिलाओं हेतु आरक्षित है! पुरुष स्वयं के नाम पर पात्र नहीं हैं, परंतु माता या पत्नी के नाम पर 4% की न्यूनतम ब्याज दर पर ऋण ले सकते हैं।',
    savingEstimateEn: 'Saves approx. ₹6,800/year compared to standard commercial loans',
    savingEstimateHi: 'सामान्य ऋण की तुलना में प्रति वर्ष लगभग ₹6,800 की ब्याज बचत',
    iconType: 'mother'
  },
  {
    id: 'opp-student-child',
    relation: 'Son',
    defaultName: 'Aakash Kumar',
    age: 21,
    gender: 'MALE',
    titleEn: 'Son or Daughter (Student)',
    titleHi: 'पुत्र या पुत्री (छात्र)',
    schemeCode: 'NBC-EDU-02',
    schemeNameEn: 'Higher Professional Education Loan Scheme',
    schemeNameHi: 'उच्च व्यावसायिक शिक्षा ऋण योजना',
    agency: 'NBCFDC',
    interestRate: '3.5%',
    maxAmountStr: '₹20.0 Lakh',
    maxAmountNum: 300000,
    highlightTagEn: '3.5% Rate + Full Study Moratorium',
    highlightTagHi: '3.5% ब्याज + अध्ययन अवधि में कोई EMI नहीं',
    whyInMemberNameEn: 'Education loans must be sanctioned in the student\'s name. You act as the co-applicant/guarantor. Repayment begins only 1 year after graduation!',
    whyInMemberNameHi: 'शिक्षा ऋण छात्र के नाम पर ही स्वीकृत होता है। आप सह-आवेदक बनते हैं। पढ़ाई पूरी होने के 1 वर्ष बाद ही पुनर्भुगतान शुरू होता है!',
    savingEstimateEn: '0% repayment during college + subsidized 3.5% interest rate',
    savingEstimateHi: 'कॉलेज अवधि में शून्य EMI और 3.5% की रियायती ब्याज दर',
    iconType: 'student'
  },
  {
    id: 'opp-senior-father',
    relation: 'Father',
    defaultName: 'Ramphal Kumar',
    age: 58,
    gender: 'MALE',
    titleEn: 'Father / Senior Farmer',
    titleHi: 'पिता या वरिष्ठ किसान',
    schemeCode: 'NBC-KS-05',
    schemeNameEn: 'Krishi Sanjeevani & Farm Mechanization Loan',
    schemeNameHi: 'कृषि संजीवनी एवं कृषि यंत्रीकरण योजना',
    agency: 'NBCFDC',
    interestRate: '5.0%',
    maxAmountStr: '₹10.0 Lakh',
    maxAmountNum: 250000,
    highlightTagEn: 'Agricultural Machinery & Solar Pumps',
    highlightTagHi: 'कृषि उपकरण व सोलर पंप हेतु 5% रियायती दर',
    whyInMemberNameEn: 'If land or agricultural title is held in your father\'s name, applying under his name unlocks priority-sector farm mechanization credit.',
    whyInMemberNameHi: 'यदि भूमि या किसान क्रेडिट अभिलेख पिता के नाम पर है, तो उनके नाम से आवेदन करने पर कृषि यंत्रीकरण प्राथमिकता ऋण तुरंत स्वीकृत होता है।',
    savingEstimateEn: 'Subsidized 5% interest with seasonal harvest-linked repayment cycles',
    savingEstimateHi: '5% रियायती ब्याज दर और फसल कटाई अनुसार सुविधाजनक किस्तें',
    iconType: 'farmer'
  },
  {
    id: 'opp-youth-sibling',
    relation: 'Sibling',
    defaultName: 'Priya Kumari',
    age: 24,
    gender: 'FEMALE',
    titleEn: 'Young Sibling (Unemployed / Graduate)',
    titleHi: 'छोटा भाई या बहन (युवा उद्यमी)',
    schemeCode: 'NSFDC-MICRO-03',
    schemeNameEn: 'PM-DAKSH & Youth Staging Micro-Enterprise',
    schemeNameHi: 'पीएम-दक्ष एवं युवा सूक्ष्म उद्यम योजना',
    agency: 'NSFDC',
    interestRate: '4.0%',
    maxAmountStr: '₹1.0 Lakh',
    maxAmountNum: 100000,
    highlightTagEn: 'Free Skill Certification + Seed Capital',
    highlightTagHi: 'मुफ्त कौशल प्रमाणन + शुरुआती बीज पूंजी',
    whyInMemberNameEn: 'Youth under 30 with no formal credit history get 100% upfront financing upon enrolling in Ministry skill training courses.',
    whyInMemberNameHi: '30 वर्ष से कम उम्र के युवाओं को बिना पूर्व क्रेडिट इतिहास के प्रशिक्षण और ₹1 लाख तक की शुरुआती पूंजी तुरंत मिलती है।',
    savingEstimateEn: 'Zero collateral + ₹1,500/month training stipend included',
    savingEstimateHi: 'बिना किसी गारंटी के पूंजी और ₹1,500/माह प्रशिक्षण वजीफा',
    iconType: 'youth'
  }
];

export const SchemeComparator: React.FC<SchemeComparatorProps> = ({
  language,
  selectedScheme,
  onSelectScheme,
  onNavigateTab,
  profile,
  authUser
}) => {
  const isHindi = language === 'hi';
  const t = TRANSLATIONS[language];
  const isAuthenticated = Boolean(authUser);

  // Active view: 'SIDE_BY_SIDE' | 'FAMILY_OPTIONS'
  // Side-by-Side Comparison is shown first by default, followed by Family Member Options
  const [activeView, setActiveView] = useState<'SIDE_BY_SIDE' | 'FAMILY_OPTIONS'>('SIDE_BY_SIDE');

  // Dynamic Scheme Registry State (MoSJE Base + SCA / Bank Added Schemes)
  const [availableSchemes, setAvailableSchemes] = useState<Scheme[]>(SchemeRegistryService.getAllSchemes());
  const [isAddSchemeModalOpen, setIsAddSchemeModalOpen] = useState(false);

  React.useEffect(() => {
    const unsubscribe = SchemeRegistryService.subscribe(() => {
      setAvailableSchemes(SchemeRegistryService.getAllSchemes());
    });
    return unsubscribe;
  }, []);

  // Two-Scheme Comparison State (Strictly 2 Schemes: Scheme 1 vs Scheme 2 - 91mobiles pattern)
  const [scheme1Id, setScheme1Id] = useState<string>(() => {
    if (selectedScheme) return selectedScheme.id;
    return 'nsfdc-gls';
  });
  const [scheme2Id, setScheme2Id] = useState<string>('nbcfdc-msy');

  useEffect(() => {
    if (selectedScheme) {
      setScheme1Id(selectedScheme.id);
      if (selectedScheme.id === scheme2Id) {
        const other = availableSchemes.find(s => s.id !== selectedScheme.id);
        if (other) setScheme2Id(other.id);
      }
    }
  }, [selectedScheme, availableSchemes]);

  // Comparison Options
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(true);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState<boolean>(false);

  // Scheme 1 & Scheme 2 Objects
  const scheme1 = useMemo(() => {
    return availableSchemes.find(s => s.id === scheme1Id) || availableSchemes[0];
  }, [availableSchemes, scheme1Id]);

  const scheme2 = useMemo(() => {
    return availableSchemes.find(s => s.id === scheme2Id) || availableSchemes[1] || availableSchemes[0];
  }, [availableSchemes, scheme2Id]);

  // Swap Scheme 1 and Scheme 2
  const handleSwapSchemes = () => {
    const temp = scheme1Id;
    setScheme1Id(scheme2Id);
    setScheme2Id(temp);
  };

  // 91score-inspired Sahayak Spec Score (0-100)
  const calculateSpecScore = (scheme: Scheme) => {
    if (!scheme) return 75;
    let score = 50;
    const rate = scheme.interestSlabs?.[0]?.ratePercent || 6;
    if (rate <= 4.0) score += 20;
    else if (rate <= 5.0) score += 16;
    else if (rate <= 6.0) score += 12;
    else score += 6;

    const maxAmt = scheme.maxLoanAmount || 500000;
    if (maxAmt >= 1500000) score += 15;
    else if (maxAmt >= 1000000) score += 12;
    else if (maxAmt >= 500000) score += 9;
    else score += 5;

    const mor = scheme.moratoriumMonths || 6;
    if (mor >= 12) score += 8;
    else if (mor >= 6) score += 6;
    else score += 3;

    if (scheme.maxSubsidyAmount || (scheme.subsidyPercentage && scheme.subsidyPercentage > 0)) {
      score += 7;
    }

    return Math.min(score, 98);
  };

  // Loan Amount & Tenure for live side-by-side comparison
  const [comparisonLoanAmount, setComparisonLoanAmount] = useState<number>(200000);
  const [comparisonTenureYears, setComparisonTenureYears] = useState<number>(5);

  // Modal for inspecting Family Opportunity
  const [activeFamilyOpp, setActiveFamilyOpp] = useState<FamilyOpportunityPreset | null>(null);
  const [customFamilyName, setCustomFamilyName] = useState<string>('');
  const [customFamilyAge, setCustomFamilyAge] = useState<number>(45);

  // Filter schemes by agency
  const [agencyFilter, setAgencyFilter] = useState<string>('ALL');

  // Open Family Opportunity modal
  const handleOpenFamilyModal = (opp: FamilyOpportunityPreset) => {
    setActiveFamilyOpp(opp);
    setCustomFamilyName(opp.defaultName);
    setCustomFamilyAge(opp.age);
  };

  // Select scheme and navigate
  const handleSelectAndApply = (scheme: Scheme) => {
    onSelectScheme(scheme);
    onNavigateTab('checklist');
  };

  const handleSelectAndCalculate = (scheme: Scheme) => {
    onSelectScheme(scheme);
    onNavigateTab('calculator');
  };

  // Commercial Bank Benchmark calculation (12% interest, 0 moratorium)
  const commercialBenchmark = useMemo(() => {
    const monthlyRate = 12.0 / 12 / 100;
    const months = comparisonTenureYears * 12;
    const emi = (comparisonLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayable = emi * months;
    const totalInterest = totalPayable - comparisonLoanAmount;
    return {
      rate: 12.0,
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest)
    };
  }, [comparisonLoanAmount, comparisonTenureYears]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                {isHindi ? 'योजना तुलना एवं परिवार विकल्प विश्लेषक' : 'Scheme Comparison & Family Credit Engine'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans mt-1">
              {isHindi ? 'योजनाओं की सीधी तुलना व पारिवारिक विकल्प' : 'Compare Schemes & Family Loan Options'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isHindi 
                ? 'विभिन्न शीर्ष निगमों (NSFDC, NBCFDC, NSKFDC) की ब्याज दरों, सब्सिडी, ईएमआई की तुलना करें अथवा परिवार के सदस्यों के नाम पर रियायती योजनाएं अनलॉक करें।' 
                : 'Compare interest rates, capital subsidies, and monthly EMIs side-by-side, or unlock high-impact concessional schemes in a family member\'s name.'}
            </p>
          </div>

          {/* View Switcher Tabs: First Side-by-Side Comparison, then Family Member Options */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-center">
            {/* 1. Side-by-Side Comparison (First) */}
            <button
              onClick={() => setActiveView('SIDE_BY_SIDE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeView === 'SIDE_BY_SIDE'
                  ? 'bg-white text-orange-900 shadow-xs border border-orange-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-orange-600" />
              <span>{isHindi ? '⚖️ सीधी योजना तुलना' : 'Side-by-Side Comparison'}</span>
            </button>

            {/* 2. Family Member Options (Second) */}
            {isAuthenticated ? (
              <button
                onClick={() => setActiveView('FAMILY_OPTIONS')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  activeView === 'FAMILY_OPTIONS'
                    ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isHindi ? '👨‍👩‍👧 परिवार के नाम पर ऋण' : 'Family Member Options'}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('auth')}
                className="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer text-slate-500 hover:text-indigo-800 hover:bg-white/60"
                title={isHindi ? 'परिवार के नाम पर ऋण सुविधा देखने हेतु साइन-इन करें' : "Sign in to access 'Take the Loan in a Family Member's Name'"}
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>{isHindi ? '🔒 परिवार के नाम पर ऋण (साइन-इन)' : '🔒 Family Member Options (Sign In)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: TAKE THE LOAN IN A FAMILY MEMBER'S NAME (DISPLAYED AFTER SIGN IN) */}
      {/* ========================================================================= */}
      {activeView === 'FAMILY_OPTIONS' && (
        !isAuthenticated ? (
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-500/30 shadow-xl text-center space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <div className="max-w-xl mx-auto space-y-2.5">
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isHindi ? 'नागरिक प्रमाणीकरण आवश्यक' : 'Citizen Sign-In Required'}</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {isHindi ? 'परिवार के सदस्य के नाम पर ऋण सुविधा' : "Take the Loan in a Family Member's Name"}
              </h3>
              <p className="text-sm text-indigo-200/90 leading-relaxed">
                {isHindi
                  ? 'माता, पत्नी, छात्र संतान अथवा वरिष्ठ किसान के नाम पर 3.5%–4.0% की विशेष रियायती दर और सब्सिडी का लाभ उठाने के लिए कृपया पहले अपने नागरिक खाते में साइन-इन करें।'
                  : 'To unlock concessional 3.5%–4.0% p.a. interest rates and household subsidies in the name of your mother, wife, student child, or father, please sign in to your citizen account.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateTab('auth')}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-600/30 transition flex items-center space-x-2 cursor-pointer active:scale-95"
              >
                <span>{isHindi ? '🔐 अभी साइन-इन करें (Sign In Now)' : '🔐 Sign In to Unlock Feature'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveView('SIDE_BY_SIDE')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition cursor-pointer"
              >
                <span>{isHindi ? 'सीधी योजना तुलना देखें →' : 'View Standard Comparison Instead →'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Main Vibrant Feature Banner */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 space-y-4">
              
              {/* Header Badges & Titles */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span>{isHindi ? 'परिवार ऋण अनुकूलन सुविधा' : 'Household Cross-Scheme Financing'}</span>
                  </div>
                  {authUser ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isHindi ? 'प्रमाणित सत्र: परिवार ऋण सक्रिय' : 'Signed In: Family Loan Active'}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('auth')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer"
                    >
                      <span>🔒 {isHindi ? 'साइन इन करें (आवेदन हेतु)' : 'Sign In to Apply'}</span>
                    </button>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isHindi 
                    ? 'परिवार के अन्य सदस्यों के नाम पर रियायती ऋण लें' 
                    : "Take the Loan in a Family Member's Name"}
                </h3>

                <p className="text-xs sm:text-sm text-indigo-200/90 max-w-3xl leading-relaxed">
                  {isHindi 
                    ? 'क्या आपके परिवार में माता, पत्नी, छात्र संतान अथवा पिता हैं? इनके नाम पर विशेष रियायती योजनाएं अनलॉक करने के लिए नीचे चुनें:' 
                    : 'Do you have a Mother, Wife, Student Child, or Father in your household? Select below to unlock targeted concessional schemes in their name:'}
                </p>

                {/* Selected Scheme Context Banner */}
                {selectedScheme && (
                  <div className="p-4 rounded-2xl bg-white/15 border border-amber-300/40 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-inner mt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 shadow-sm">
                          {isHindi ? 'वर्तमान में चयनित योजना' : 'Currently Selected Scheme'}
                        </span>
                        <span className="text-xs font-bold text-indigo-200">
                          {selectedScheme.agency} • {selectedScheme.code}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white">
                        {isHindi && selectedScheme.hindiName ? selectedScheme.hindiName : selectedScheme.name}
                      </h4>
                      <p className="text-xs text-indigo-100 font-medium">
                        {isHindi 
                          ? `सामान्य ब्याज दर: ${selectedScheme.interestSlabs?.[0]?.ratePercent || 6}% प्रति वर्ष | अधिकतम ऋण सीमा: ₹${(selectedScheme.maxLoanAmount / 100000).toFixed(1)} लाख`
                          : `Standard Interest Rate: ${selectedScheme.interestSlabs?.[0]?.ratePercent || 6}% p.a. | Max Financing: ₹${(selectedScheme.maxLoanAmount / 100000).toFixed(1)} Lakhs`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 bg-emerald-950/50 px-3.5 py-2.5 rounded-xl border border-emerald-400/40 shrink-0">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                      <span>
                        {isHindi 
                          ? 'परिवार के सदस्य के नाम पर 3.5% - 4.0% की विशेष छूट पाएं' 
                          : 'Unlock 3.5% - 4.0% Concessional Rates in Family Member Name'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Four Preset Opportunity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                {FAMILY_OPPORTUNITIES.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all duration-200 space-y-3.5 flex flex-col justify-between group backdrop-blur-xs shadow-lg"
                  >
                    <div className="space-y-2.5">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                          {isHindi ? opp.highlightTagHi : opp.highlightTagEn}
                        </span>

                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                          {opp.agency}
                        </span>
                      </div>

                      {/* Title & Scheme Name */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-black text-white">
                            {isHindi ? opp.titleHi : opp.titleEn}
                          </span>
                          <span className="text-xs text-indigo-300">({opp.relation})</span>
                        </div>
                        <h4 className="text-xs font-bold text-indigo-100 line-clamp-1 mt-0.5">
                          {isHindi ? opp.schemeNameHi : opp.schemeNameEn}
                        </h4>
                      </div>

                      {/* Key Comparison Metrics */}
                      <div className="grid grid-cols-2 gap-2 bg-black/20 p-2.5 rounded-xl border border-white/10 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            {isHindi ? 'ब्याज दर' : 'Concessional Rate'}
                          </span>
                          <strong className="text-emerald-400 text-sm font-black">{opp.interestRate}</strong>
                          <span className="text-[10px] text-slate-400 block">per annum</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">
                            {isHindi ? 'अधिकतम ऋण सीमा' : 'Financing Ceiling'}
                          </span>
                          <strong className="text-white text-sm font-black">{opp.maxAmountStr}</strong>
                          <span className="text-[10px] text-slate-400 block">priority quota</span>
                        </div>
                      </div>

                      {/* Why Apply in this Member's Name */}
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-[11px] text-slate-200 leading-relaxed">
                        💡 <strong>{isHindi ? 'इनके नाम पर क्यों?' : 'Why in their name?'}:</strong>{' '}
                        {isHindi ? opp.whyInMemberNameHi : opp.whyInMemberNameEn}
                      </div>

                      {/* Savings Tag */}
                      <div className="flex items-center space-x-1.5 text-[11px] text-emerald-300 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{isHindi ? opp.savingEstimateHi : opp.savingEstimateEn}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenFamilyModal(opp)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 group-hover:scale-[1.01] cursor-pointer"
                    >
                      <span>
                        {isHindi 
                          ? `इनके नाम पर ऋण तुलना व आवेदन (${opp.interestRate})` 
                          : `Compare & Apply in ${opp.relation}'s Name`}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Statutory Compliance Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-200/80 pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isHindi 
                      ? 'निगम नियमावली अनुसार पूर्णतः वैध: एक ही परिवार के सदस्य स्वतंत्र रूप से गैर-विरोधी योजनाओं के लिए पात्र हैं।' 
                      : 'Statutory Compliance: Multi-member credit is legally verified under MoSJE corporation guidelines.'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {isHindi ? 'प्राथमिक आवेदक स्वतः सह-आवेदक (Co-Applicant) बन जाता है' : 'You are assigned as Primary Co-Applicant & Guarantor'}
                </span>
              </div>

            </div>
          </div>

          {/* Quick Comparison Highlights Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>{isHindi ? 'परिवार के नाम पर आवेदन करने पर शुद्ध बचत विश्लेषण' : 'Household Savings: Self vs Family Member Name'}</span>
              </h4>
              <button
                onClick={() => setActiveView('SIDE_BY_SIDE')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center space-x-1"
              >
                <span>{isHindi ? 'सभी योजनाओं की पूरी तालिका देखें →' : 'View Full Comparison Table →'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 block">1. महिला उद्यमी (माता/पत्नी)</span>
                <p className="text-slate-500 text-[11px]">
                  {isHindi 
                    ? 'सामान्य मियादी ऋण (6%) के बजाय महिला समृद्धि (4%) में आवेदन करने पर प्रति ₹1 लाख पर ₹2,000 की सीधी वार्षिक ब्याज बचत।' 
                    : 'Applying under Mahila Samriddhi (4%) instead of General Term Loan (6%) saves ₹2,000/year per ₹1 Lakh borrowed.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 block">2. छात्र संतान (उच्च शिक्षा)</span>
                <p className="text-slate-500 text-[11px]">
                  {isHindi 
                    ? 'अध्ययन के 3 से 4 वर्षों के दौरान शून्य किस्त। पढ़ाई पूरी होने के 1 वर्ष बाद 3.5% की रियायती दर पर आसान पुनर्भुगतान।' 
                    : 'Zero EMI throughout college. 3.5% concessional interest starts only 1 year after graduation.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-700 block">3. पिता (कृषि यंत्रीकरण)</span>
                <p className="text-slate-500 text-[11px]">
                  {isHindi 
                    ? 'ट्रैक्टर, थ्रेशर या सोलर पंप हेतु वाणिज्यिक बैंक के 12% के स्थान पर नाबार्ड/निगम 5% पर ऋण एवं 33% तक सरकारी पूंजी सब्सिडी।' 
                    : '5% interest for farm machinery & solar pumps vs 12% commercial bank rates, plus up to 33% capital subsidy.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    )}

      {/* ========================================================================= */}
      {/* VIEW 2: SIDE-BY-SIDE SCHEME COMPARATOR TABLE & SLIDER                     */}
      {/* ========================================================================= */}
      {activeView === 'SIDE_BY_SIDE' && (() => {
        // Financial calculations for both schemes
        const rate1 = scheme1.interestSlabs?.[0]?.ratePercent || 5;
        const rate2 = scheme2.interestSlabs?.[0]?.ratePercent || 5;

        const calc1 = LoanCalculatorService.calculate(
          comparisonLoanAmount,
          comparisonTenureYears,
          scheme1.moratoriumMonths || 6,
          scheme1
        );

        const calc2 = LoanCalculatorService.calculate(
          comparisonLoanAmount,
          comparisonTenureYears,
          scheme2.moratoriumMonths || 6,
          scheme2
        );

        const emi1 = Math.round(calc1.regularMonthlyEmi);
        const emi2 = Math.round(calc2.regularMonthlyEmi);
        const totalInterest1 = Math.round(calc1.totalInterestPayable);
        const totalInterest2 = Math.round(calc2.totalInterestPayable);

        const score1 = calculateSpecScore(scheme1);
        const score2 = calculateSpecScore(scheme2);

        // Commercial Bank Benchmark comparison (12%)
        const commercialMonthlyRate = 12.0 / 12 / 100;
        const commercialMonths = comparisonTenureYears * 12;
        const commercialEmi = Math.round(
          (comparisonLoanAmount * commercialMonthlyRate * Math.pow(1 + commercialMonthlyRate, commercialMonths)) /
          (Math.pow(1 + commercialMonthlyRate, commercialMonths) - 1)
        );
        const commercialTotalInterest = Math.round(commercialEmi * commercialMonths - comparisonLoanAmount);

        const savings1 = commercialTotalInterest - totalInterest1;
        const savings2 = commercialTotalInterest - totalInterest2;

        // Dynamic 91mobiles-style Verdict Bullet Points
        const verdictScheme1Advantages: string[] = [];
        if (rate1 < rate2) {
          verdictScheme1Advantages.push(`${rate1}% p.a. interest (${(rate2 - rate1).toFixed(1)}% lower rate)`);
        }
        if (emi1 < emi2) {
          verdictScheme1Advantages.push(`₹${(emi2 - emi1).toLocaleString('en-IN')}/month lower EMI`);
        }
        if (totalInterest1 < totalInterest2) {
          verdictScheme1Advantages.push(`Saves ₹${(totalInterest2 - totalInterest1).toLocaleString('en-IN')} extra in total interest`);
        }
        if ((scheme1.maxSubsidyAmount || 0) > (scheme2.maxSubsidyAmount || 0)) {
          verdictScheme1Advantages.push(`Higher capital subsidy (up to ₹${((scheme1.maxSubsidyAmount || 0) / 100000).toFixed(1)}L)`);
        }
        if (scheme1.maxLoanAmount > scheme2.maxLoanAmount) {
          verdictScheme1Advantages.push(`Higher max loan ceiling (₹${(scheme1.maxLoanAmount / 100000).toFixed(1)} Lakh)`);
        }
        if ((scheme1.moratoriumMonths || 0) > (scheme2.moratoriumMonths || 0)) {
          verdictScheme1Advantages.push(`Longer repayment moratorium (${scheme1.moratoriumMonths} months)`);
        }
        if (scheme1.genderRestriction === 'FEMALE_ONLY') {
          verdictScheme1Advantages.push('100% reserved for women entrepreneurs with zero collateral');
        }
        if (verdictScheme1Advantages.length === 0) {
          verdictScheme1Advantages.push('Zero prepayment penalty and collateral-free loan sanction');
          verdictScheme1Advantages.push('Direct nodal state channelizing agency delivery');
        }

        const verdictScheme2Advantages: string[] = [];
        if (rate2 < rate1) {
          verdictScheme2Advantages.push(`${rate2}% p.a. interest (${(rate1 - rate2).toFixed(1)}% lower rate)`);
        }
        if (emi2 < emi1) {
          verdictScheme2Advantages.push(`₹${(emi1 - emi2).toLocaleString('en-IN')}/month lower EMI`);
        }
        if (totalInterest2 < totalInterest1) {
          verdictScheme2Advantages.push(`Saves ₹${(totalInterest1 - totalInterest2).toLocaleString('en-IN')} extra in total interest`);
        }
        if ((scheme2.maxSubsidyAmount || 0) > (scheme1.maxSubsidyAmount || 0)) {
          verdictScheme2Advantages.push(`Higher capital subsidy (up to ₹${((scheme2.maxSubsidyAmount || 0) / 100000).toFixed(1)}L)`);
        }
        if (scheme2.maxLoanAmount > scheme1.maxLoanAmount) {
          verdictScheme2Advantages.push(`Higher max loan ceiling (₹${(scheme2.maxLoanAmount / 100000).toFixed(1)} Lakh)`);
        }
        if ((scheme2.moratoriumMonths || 0) > (scheme1.moratoriumMonths || 0)) {
          verdictScheme2Advantages.push(`Longer repayment moratorium (${scheme2.moratoriumMonths} months)`);
        }
        if (scheme2.genderRestriction === 'FEMALE_ONLY') {
          verdictScheme2Advantages.push('100% reserved for women entrepreneurs with zero collateral');
        }
        if (verdictScheme2Advantages.length === 0) {
          verdictScheme2Advantages.push('Zero prepayment penalty and collateral-free loan sanction');
          verdictScheme2Advantages.push('Direct nodal state channelizing agency delivery');
        }

        // Spec comparison table data grouped into 4 categories
        const specCategories = [
          {
            titleEn: '1. Financial Terms & Live EMI',
            titleHi: '1. वित्तीय शर्तें एवं लाइव ईएमआई',
            icon: Coins,
            rows: [
              {
                labelEn: 'Concessional Interest Rate',
                labelHi: 'रियायती ब्याज दर',
                val1: `${rate1}% p.a.`,
                val2: `${rate2}% p.a.`,
                isDiff: rate1 !== rate2,
                winner: rate1 < rate2 ? (1 as const) : rate2 < rate1 ? (2 as const) : undefined,
                diffBadge: rate1 < rate2 ? `${(rate2 - rate1).toFixed(1)}% Lower` : rate2 < rate1 ? `${(rate1 - rate2).toFixed(1)}% Lower` : undefined
              },
              {
                labelEn: `Monthly EMI (at ₹${(comparisonLoanAmount / 100000).toFixed(2)}L for ${comparisonTenureYears}Y)`,
                labelHi: `मासिक ईएमआई (₹${(comparisonLoanAmount / 100000).toFixed(2)}L ऋण, ${comparisonTenureYears} वर्ष हेतु)`,
                val1: `₹${emi1.toLocaleString('en-IN')} / mo`,
                val2: `₹${emi2.toLocaleString('en-IN')} / mo`,
                isDiff: emi1 !== emi2,
                winner: emi1 < emi2 ? (1 as const) : emi2 < emi1 ? (2 as const) : undefined,
                diffBadge: emi1 < emi2 ? `Saves ₹${(emi2 - emi1).toLocaleString('en-IN')}/mo` : emi2 < emi1 ? `Saves ₹${(emi1 - emi2).toLocaleString('en-IN')}/mo` : undefined
              },
              {
                labelEn: 'Total Interest Payable',
                labelHi: 'कुल देय ब्याज',
                val1: `₹${totalInterest1.toLocaleString('en-IN')}`,
                val2: `₹${totalInterest2.toLocaleString('en-IN')}`,
                isDiff: totalInterest1 !== totalInterest2,
                winner: totalInterest1 < totalInterest2 ? (1 as const) : totalInterest2 < totalInterest1 ? (2 as const) : undefined,
                diffBadge: totalInterest1 < totalInterest2 ? `Save ₹${(totalInterest2 - totalInterest1).toLocaleString('en-IN')}` : totalInterest2 < totalInterest1 ? `Save ₹${(totalInterest1 - totalInterest2).toLocaleString('en-IN')}` : undefined
              },
              {
                labelEn: 'Savings vs Commercial Bank (12%)',
                labelHi: 'वाणिज्यिक बैंक (12%) की तुलना में बचत',
                val1: `₹${savings1 > 0 ? savings1.toLocaleString('en-IN') : 0} saved`,
                val2: `₹${savings2 > 0 ? savings2.toLocaleString('en-IN') : 0} saved`,
                isDiff: savings1 !== savings2,
                winner: savings1 > savings2 ? (1 as const) : savings2 > savings1 ? (2 as const) : undefined
              },
              {
                labelEn: 'Moratorium / Repayment Grace',
                labelHi: 'स्थगन / अनुग्रह अवधि',
                val1: `${scheme1.moratoriumMonths || 6} Months Grace`,
                val2: `${scheme2.moratoriumMonths || 6} Months Grace`,
                isDiff: (scheme1.moratoriumMonths || 6) !== (scheme2.moratoriumMonths || 6),
                winner: (scheme1.moratoriumMonths || 6) > (scheme2.moratoriumMonths || 6) ? (1 as const) : (scheme2.moratoriumMonths || 6) > (scheme1.moratoriumMonths || 6) ? (2 as const) : undefined
              },
              {
                labelEn: 'Max Loan Amount Ceiling',
                labelHi: 'अधिकतम ऋण सीमा',
                val1: `₹${(scheme1.maxLoanAmount / 100000).toFixed(2)} Lakh`,
                val2: `₹${(scheme2.maxLoanAmount / 100000).toFixed(2)} Lakh`,
                isDiff: scheme1.maxLoanAmount !== scheme2.maxLoanAmount,
                winner: scheme1.maxLoanAmount > scheme2.maxLoanAmount ? (1 as const) : scheme2.maxLoanAmount > scheme1.maxLoanAmount ? (2 as const) : undefined,
                diffBadge: scheme1.maxLoanAmount > scheme2.maxLoanAmount ? `+₹${((scheme1.maxLoanAmount - scheme2.maxLoanAmount) / 100000).toFixed(1)}L Limit` : scheme2.maxLoanAmount > scheme1.maxLoanAmount ? `+₹${((scheme2.maxLoanAmount - scheme1.maxLoanAmount) / 100000).toFixed(1)}L Limit` : undefined
              },
              {
                labelEn: 'Capital / Interest Subsidy',
                labelHi: 'पूंजी / ब्याज अनुदान (सब्सिडी)',
                val1: scheme1.maxSubsidyAmount ? `Up to ₹${(scheme1.maxSubsidyAmount / 100000).toFixed(1)} Lakh` : scheme1.subsidyPercentage ? `Up to ${scheme1.subsidyPercentage}%` : 'Up to 33% capital grant',
                val2: scheme2.maxSubsidyAmount ? `Up to ₹${(scheme2.maxSubsidyAmount / 100000).toFixed(1)} Lakh` : scheme2.subsidyPercentage ? `Up to ${scheme2.subsidyPercentage}%` : 'Up to 33% capital grant',
                isDiff: (scheme1.maxSubsidyAmount || 0) !== (scheme2.maxSubsidyAmount || 0)
              },
              {
                labelEn: 'Prepayment / Foreclosure Penalty',
                labelHi: 'समय पूर्व भुगतान शुल्क',
                val1: 'Zero / Nil (No Foreclosure Charges)',
                val2: 'Zero / Nil (No Foreclosure Charges)',
                isDiff: false
              },
              {
                labelEn: 'Prompt Repayment Rebate',
                labelHi: 'समय पर भुगतान पर विशेष छूट',
                val1: '1.0% p.a. interest rebate on timely EMI',
                val2: '1.0% p.a. interest rebate on timely EMI',
                isDiff: false
              }
            ]
          },
          {
            titleEn: '2. Beneficiary Eligibility & Target Quota',
            titleHi: '2. लाभार्थी पात्रता एवं सामाजिक कोटा',
            icon: Users,
            rows: [
              {
                labelEn: 'Target Social Community',
                labelHi: 'लक्षित सामाजिक वर्ग',
                val1: scheme1.targetCommunity.join(', '),
                val2: scheme2.targetCommunity.join(', '),
                isDiff: scheme1.targetCommunity.join(', ') !== scheme2.targetCommunity.join(', ')
              },
              {
                labelEn: 'Annual Family Income Ceiling',
                labelHi: 'वार्षिक पारिवारिक आय सीमा',
                val1: scheme1.incomeCeiling ? `Up to ₹${(scheme1.incomeCeiling / 100000).toFixed(1)} Lakh/year` : 'Up to ₹3.00 Lakh/year',
                val2: scheme2.incomeCeiling ? `Up to ₹${(scheme2.incomeCeiling / 100000).toFixed(1)} Lakh/year` : 'Up to ₹3.00 Lakh/year',
                isDiff: scheme1.incomeCeiling !== scheme2.incomeCeiling
              },
              {
                labelEn: 'Eligible Age Bracket',
                labelHi: 'पात्र आयु वर्ग',
                val1: '18 – 50 Years',
                val2: '18 – 50 Years',
                isDiff: false
              },
              {
                labelEn: 'Gender Concession / Priority',
                labelHi: 'लैंगिक प्राथमिकता व आरक्षण',
                val1: scheme1.genderRestriction === 'FEMALE_ONLY' ? 'Women Only (100% Reserved)' : 'All Beneficiaries (Women Priority)',
                val2: scheme2.genderRestriction === 'FEMALE_ONLY' ? 'Women Only (100% Reserved)' : 'All Beneficiaries (Women Priority)',
                isDiff: scheme1.genderRestriction !== scheme2.genderRestriction,
                winner: scheme1.genderRestriction === 'FEMALE_ONLY' ? (1 as const) : scheme2.genderRestriction === 'FEMALE_ONLY' ? (2 as const) : undefined
              },
              {
                labelEn: 'Eligible Enterprise Purposes',
                labelHi: 'पात्र व्यवसाय एवं प्रयोजन',
                val1: scheme1.eligiblePurposes ? scheme1.eligiblePurposes.map(p => p.replace('_', ' ')).join(', ') : 'Small Business, Services, Agri',
                val2: scheme2.eligiblePurposes ? scheme2.eligiblePurposes.map(p => p.replace('_', ' ')).join(', ') : 'Small Business, Services, Agri',
                isDiff: (scheme1.eligiblePurposes || []).join(',') !== (scheme2.eligiblePurposes || []).join(',')
              }
            ]
          },
          {
            titleEn: '3. Channel Delivery & Implementation',
            titleHi: '3. चैनल वितरण एवं कार्यान्वयन',
            icon: Building2,
            rows: [
              {
                labelEn: 'Apex Implementing Agency',
                labelHi: 'शीर्ष कार्यान्वयन एजेंसी',
                val1: `${scheme1.agency} (${scheme1.agencyFullName})`,
                val2: `${scheme2.agency} (${scheme2.agencyFullName})`,
                isDiff: scheme1.agency !== scheme2.agency
              },
              {
                labelEn: 'Participating Channel Desks',
                labelHi: 'भागीदार चैनल डेस्क',
                val1: scheme1.channelProviderName ? `${scheme1.channelProviderName} (${scheme1.channelProviderType || 'Bank'})` : 'State Channelizing Agency (SCA) & Sponsoring PSU Banks',
                val2: scheme2.channelProviderName ? `${scheme2.channelProviderName} (${scheme2.channelProviderType || 'Bank'})` : 'State Channelizing Agency (SCA) & Sponsoring PSU Banks',
                isDiff: scheme1.channelProviderName !== scheme2.channelProviderName
              },
              {
                labelEn: 'Processing Turnaround SLA',
                labelHi: 'प्रसंस्करण समय सीमा (SLA)',
                val1: '7 – 14 Working Days',
                val2: '7 – 14 Working Days',
                isDiff: false
              },
              {
                labelEn: 'Collateral / Guarantee Requirement',
                labelHi: 'जमानत / बंधक आवश्यकता',
                val1: 'Zero Collateral up to ₹10L (Covered by CGTMSE)',
                val2: 'Zero Collateral up to ₹10L (Covered by CGTMSE)',
                isDiff: false
              },
              {
                labelEn: 'Digital Aadhaar e-KYC',
                labelHi: 'डिजिटल आधार e-KYC',
                val1: 'Direct API Verification Enabled',
                val2: 'Direct API Verification Enabled',
                isDiff: false
              }
            ]
          },
          {
            titleEn: '4. Required Documentation',
            titleHi: '4. आवश्यक दस्तावेज',
            icon: FileText,
            rows: [
              {
                labelEn: 'Social Category Proof',
                labelHi: 'सामाजिक श्रेणी प्रमाण पत्र',
                val1: 'Mandatory (Caste / Community Certificate)',
                val2: 'Mandatory (Caste / Community Certificate)',
                isDiff: false
              },
              {
                labelEn: 'Family Income Certificate',
                labelHi: 'पारिवारिक आय प्रमाण पत्र',
                val1: 'Required (Tehsildar issued / Self-Declaration under ₹3L)',
                val2: 'Required (Tehsildar issued / Self-Declaration under ₹3L)',
                isDiff: false
              },
              {
                labelEn: 'Business Quotation / DPR',
                labelHi: 'परियोजना रिपोर्ट / कोटेशन',
                val1: 'Required for projects above ₹2 Lakh',
                val2: 'Required for projects above ₹2 Lakh',
                isDiff: false
              },
              {
                labelEn: 'Identity & Address Proof',
                labelHi: 'पहचान एवं पता प्रमाण',
                val1: 'Aadhaar Card + Voter ID / Ration Card',
                val2: 'Aadhaar Card + Voter ID / Ration Card',
                isDiff: false
              }
            ]
          }
        ];

        return (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* 1. 91MOBILES STYLE TOP TWO-SCHEME COMPARISON HEADER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
                
                {/* SCHEME 1 CARD (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 hover:border-orange-400 transition-all shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Selector Dropdown */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        {isHindi ? 'योजना 1 बदलें' : 'Select Scheme 1'}
                      </label>
                      <select
                        value={scheme1Id}
                        onChange={(e) => {
                          const newId = e.target.value;
                          if (newId === scheme2Id) {
                            setScheme2Id(scheme1Id);
                          }
                          setScheme1Id(newId);
                        }}
                        className="w-full bg-white text-slate-900 font-bold text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs truncate"
                      >
                        {availableSchemes.map((s) => (
                          <option key={s.id} value={s.id}>
                            [{s.agency}] {s.name} ({s.interestSlabs?.[0]?.ratePercent || 5}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Agency & Code Badges */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-800 border border-orange-200">
                        {scheme1.agency} Nodal
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {scheme1.code}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-black text-lg text-slate-900 leading-snug">
                        {isHindi ? scheme1.hindiName : scheme1.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {scheme1.agencyFullName}
                      </p>
                    </div>

                    {/* 91score-style Spec Score Meter */}
                    <div className="flex items-center space-x-3 bg-slate-100/80 p-3 rounded-2xl border border-slate-200">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
                        <span className="text-base leading-none">{score1}</span>
                        <span className="text-[8px] opacity-85 leading-none mt-0.5">/100</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-800">
                            {isHindi ? 'सहायक स्पेक स्कोर' : 'Sahayak Spec Score'}
                          </span>
                          {score1 > score2 && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                              🏆 Spec Winner
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {score1 >= 90 ? 'Outstanding Concessional Terms' : score1 >= 80 ? 'Highly Recommended' : 'Competitive Rates'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Spec Chips */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Interest Rate</span>
                        <strong className="text-emerald-700 font-extrabold font-mono text-sm">{rate1}% p.a.</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Monthly EMI</span>
                        <strong className="text-slate-900 font-black font-mono text-sm">₹{emi1.toLocaleString('en-IN')}/mo</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Max Limit</span>
                        <strong className="text-slate-800 font-bold font-mono">₹{(scheme1.maxLoanAmount / 100000).toFixed(1)}L</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Moratorium</span>
                        <strong className="text-blue-700 font-bold">{scheme1.moratoriumMonths || 6} Months</strong>
                      </div>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAndApply(scheme1)}
                      className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer active:scale-98"
                    >
                      <span>{selectedScheme?.id === scheme1.id ? 'चयनित योजना (Selected)' : 'Select & Apply (योजना 1)'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* CENTER VS BADGE & SWAP (1 col) */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-3 my-auto py-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white font-black text-base flex items-center justify-center shadow-lg ring-4 ring-orange-100">
                    VS
                  </div>
                  <button
                    type="button"
                    onClick={handleSwapSchemes}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1 cursor-pointer border border-slate-300 shadow-2xs active:scale-95"
                    title="Swap Scheme 1 and Scheme 2"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-orange-600" />
                    <span>{isHindi ? 'बदलें' : 'Swap'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddSchemeModalOpen(true)}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center space-x-0.5 cursor-pointer text-center"
                  >
                    <PlusCircle className="w-3 h-3 shrink-0" />
                    <span>{isHindi ? 'नई योजना' : '+ Add'}</span>
                  </button>
                </div>

                {/* SCHEME 2 CARD (5 cols) */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 hover:border-blue-400 transition-all shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Selector Dropdown */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        {isHindi ? 'योजना 2 बदलें' : 'Select Scheme 2'}
                      </label>
                      <select
                        value={scheme2Id}
                        onChange={(e) => {
                          const newId = e.target.value;
                          if (newId === scheme1Id) {
                            setScheme1Id(scheme2Id);
                          }
                          setScheme2Id(newId);
                        }}
                        className="w-full bg-white text-slate-900 font-bold text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs truncate"
                      >
                        {availableSchemes.map((s) => (
                          <option key={s.id} value={s.id}>
                            [{s.agency}] {s.name} ({s.interestSlabs?.[0]?.ratePercent || 5}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Agency & Code Badges */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                        {scheme2.agency} Nodal
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {scheme2.code}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-black text-lg text-slate-900 leading-snug">
                        {isHindi ? scheme2.hindiName : scheme2.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {scheme2.agencyFullName}
                      </p>
                    </div>

                    {/* 91score-style Spec Score Meter */}
                    <div className="flex items-center space-x-3 bg-slate-100/80 p-3 rounded-2xl border border-slate-200">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
                        <span className="text-base leading-none">{score2}</span>
                        <span className="text-[8px] opacity-85 leading-none mt-0.5">/100</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-xs font-black text-slate-800">
                            {isHindi ? 'सहायक स्पेक स्कोर' : 'Sahayak Spec Score'}
                          </span>
                          {score2 > score1 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-black uppercase tracking-wider">
                              🏆 Spec Winner
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {score2 >= 90 ? 'Outstanding Concessional Terms' : score2 >= 80 ? 'Highly Recommended' : 'Competitive Rates'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Spec Chips */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Interest Rate</span>
                        <strong className="text-emerald-700 font-extrabold font-mono text-sm">{rate2}% p.a.</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Monthly EMI</span>
                        <strong className="text-slate-900 font-black font-mono text-sm">₹{emi2.toLocaleString('en-IN')}/mo</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Max Limit</span>
                        <strong className="text-slate-800 font-bold font-mono">₹{(scheme2.maxLoanAmount / 100000).toFixed(1)}L</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-bold">Moratorium</span>
                        <strong className="text-blue-700 font-bold">{scheme2.moratoriumMonths || 6} Months</strong>
                      </div>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAndApply(scheme2)}
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer active:scale-98"
                    >
                      <span>{selectedScheme?.id === scheme2.id ? 'चयनित योजना (Selected)' : 'Select & Apply (योजना 2)'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. 91MOBILES STYLE QUICK VERDICT BOX */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-800/50 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-indigo-800/60">
                <div className="flex items-center space-x-2.5">
                  <Award className="w-6 h-6 text-amber-400" />
                  <div>
                    <h4 className="text-lg font-black text-white">
                      {isHindi ? 'त्वरित निर्णय: आपके लिए कौन सी योजना बेहतर है?' : 'Quick Verdict: Which Scheme Should You Choose?'}
                    </h4>
                    <p className="text-xs text-indigo-300">
                      {isHindi ? 'विस्तृत स्पेक तुलना के आधार पर विशेषज्ञ निष्कर्ष' : 'Key advantages distilled for instant decision making'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-extrabold">
                    {score1 > score2 ? `🏆 ${scheme1.name.split(' ')[0]} Leads (+${score1 - score2} pts)` : score2 > score1 ? `🏆 ${scheme2.name.split(' ')[0]} Leads (+${score2 - score1} pts)` : '⚖️ Equal Spec Score'}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Advantages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Scheme 1 Verdict */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-400 uppercase tracking-wider">
                      {isHindi ? 'योजना 1 चुनने के कारण:' : `Why Choose ${scheme1.name.split(' ')[0]}:`}
                    </span>
                    {score1 > score2 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Top Spec Choice
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2 text-xs text-indigo-100">
                    {verdictScheme1Advantages.map((adv, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scheme 2 Verdict */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                      {isHindi ? 'योजना 2 चुनने के कारण:' : `Why Choose ${scheme2.name.split(' ')[0]}:`}
                    </span>
                    {score2 > score1 && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        Top Spec Choice
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2 text-xs text-indigo-100">
                    {verdictScheme2Advantages.map((adv, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Advisory Recommendation Note */}
              <div className="p-4 rounded-2xl bg-indigo-900/40 border border-indigo-700/50 flex items-start space-x-3 text-xs text-indigo-200 leading-relaxed">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-bold block mb-0.5">
                    {isHindi ? 'सहायक विशेषज्ञ परामर्श (Final Recommendation):' : 'Sahayak Decision Guide:'}
                  </strong>
                  <span>
                    {rate1 < rate2
                      ? `If your goal is minimal monthly EMI repayment pressure, choose ${scheme1.name} (saves ₹${Math.abs(emi1 - emi2).toLocaleString('en-IN')}/month in EMI). If you need higher project finance, ${scheme2.name} offers up to ₹${(scheme2.maxLoanAmount / 100000).toFixed(1)} Lakh.`
                      : rate2 < rate1
                      ? `If your goal is minimal monthly EMI repayment pressure, choose ${scheme2.name} (saves ₹${Math.abs(emi1 - emi2).toLocaleString('en-IN')}/month in EMI). If you need higher project finance, ${scheme1.name} offers up to ₹${(scheme1.maxLoanAmount / 100000).toFixed(1)} Lakh.`
                      : `Both schemes offer matching ${rate1}% p.a. interest rates. Your best selection depends on your social category (${scheme1.targetCommunity.join(', ')} vs ${scheme2.targetCommunity.join(', ')}) and maximum required project outlay.`}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. INTERACTIVE FINANCIAL MODELER & COMPARISON CONTROLS */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              
              {/* Header & Feature Toggles (91mobiles Style 'Highlight Differences' / 'Only Differences') */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-orange-600" />
                    <span>{isHindi ? 'लाइव वित्तीय स्लाइडर्स एवं तुलना टॉगल' : 'Live Financial Modeler & Comparison Toggles'}</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isHindi ? 'ऋण राशि व अवधि बदलकर दोनों योजनाओं की मासिक EMI व कुल बचत का लाइव अंतर देखें:' : 'Adjust sliders to simulate EMI & interest savings across both schemes side-by-side:'}
                  </p>
                </div>

                {/* 91mobiles Iconic Toggles */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setHighlightDifferences(!highlightDifferences)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      highlightDifferences
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isHindi ? 'अंतर हाइलाइट करें' : 'Highlight Differences'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      showOnlyDifferences
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'केवल अंतर दिखाएं' : 'Show Only Differences'}</span>
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Amount Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">{isHindi ? 'ऋण राशि (Loan Amount):' : 'Borrowing Amount:'}</span>
                    <span className="text-orange-600 font-extrabold text-sm font-mono">
                      ₹{(comparisonLoanAmount / 100000).toFixed(2)} Lakh (₹{comparisonLoanAmount.toLocaleString('en-IN')})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={1500000}
                    step={25000}
                    value={comparisonLoanAmount}
                    onChange={(e) => setComparisonLoanAmount(Number(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>₹50,000</span>
                    <span>₹5,00,000</span>
                    <span>₹10,00,000</span>
                    <span>₹15,00,000</span>
                  </div>
                </div>

                {/* Tenure Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">{isHindi ? 'पुनर्भुगतान अवधि (Tenure):' : 'Repayment Tenure:'}</span>
                    <span className="text-blue-600 font-extrabold text-sm font-mono">
                      {comparisonTenureYears} {isHindi ? 'वर्ष (Years)' : 'Years'} ({comparisonTenureYears * 12} Months)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={comparisonTenureYears}
                    onChange={(e) => setComparisonTenureYears(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>1 Year</span>
                    <span>3 Years</span>
                    <span>5 Years</span>
                    <span>10 Years</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Difference Insight Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {emi1 !== emi2 ? (
                      emi1 < emi2 ? (
                        <>
                          <strong>{scheme1.name.split(' ')[0]}</strong> offers a lower EMI of <strong>₹{emi1.toLocaleString('en-IN')}/mo</strong>, saving <strong>₹{(emi2 - emi1).toLocaleString('en-IN')}/month</strong> (Total <strong>₹{(totalInterest2 - totalInterest1).toLocaleString('en-IN')}</strong> less interest over {comparisonTenureYears} years)!
                        </>
                      ) : (
                        <>
                          <strong>{scheme2.name.split(' ')[0]}</strong> offers a lower EMI of <strong>₹{emi2.toLocaleString('en-IN')}/mo</strong>, saving <strong>₹{(emi1 - emi2).toLocaleString('en-IN')}/month</strong> (Total <strong>₹{(totalInterest1 - totalInterest2).toLocaleString('en-IN')}</strong> less interest over {comparisonTenureYears} years)!
                        </>
                      )
                    ) : (
                      <>Both schemes have identical monthly EMI of <strong>₹{emi1.toLocaleString('en-IN')}/mo</strong> at this amount and tenure.</>
                    )}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  Live Computed
                </span>
              </div>

            </div>

            {/* 4. 91MOBILES STYLE CATEGORIZED SPECIFICATION TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              
              {/* Sticky Table Header */}
              <div className="sticky top-16 z-20 bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 font-black text-xs sm:text-sm text-slate-300 uppercase tracking-wider">
                  {isHindi ? 'विशेषताएं एवं मापदंड' : 'Specifications & Details'}
                </div>
                <div className="col-span-4 text-center">
                  <span className="text-[10px] font-bold text-orange-400 block uppercase">Scheme 1</span>
                  <span className="font-extrabold text-xs sm:text-sm text-white truncate block">
                    {scheme1.name}
                  </span>
                </div>
                <div className="col-span-4 text-center">
                  <span className="text-[10px] font-bold text-blue-400 block uppercase">Scheme 2</span>
                  <span className="font-extrabold text-xs sm:text-sm text-white truncate block">
                    {scheme2.name}
                  </span>
                </div>
              </div>

              {/* Categorized Rows */}
              <div className="divide-y divide-slate-200">
                {specCategories.map((category, catIdx) => {
                  const CategoryIcon = category.icon;
                  const displayRows = category.rows.filter(r => !showOnlyDifferences || r.isDiff);

                  if (displayRows.length === 0) return null;

                  return (
                    <div key={catIdx}>
                      {/* Category Header */}
                      <div className="bg-slate-100/80 px-4 sm:px-6 py-3 border-y border-slate-200 flex items-center space-x-2">
                        <CategoryIcon className="w-4 h-4 text-orange-600" />
                        <h5 className="font-black text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                          {isHindi ? category.titleHi : category.titleEn}
                        </h5>
                      </div>

                      {/* Rows */}
                      <div className="divide-y divide-slate-100">
                        {displayRows.map((row, rowIdx) => {
                          const isHighlighted = highlightDifferences && row.isDiff;
                          const isWin1 = highlightDifferences && row.winner === 1;
                          const isWin2 = highlightDifferences && row.winner === 2;

                          return (
                            <div
                              key={rowIdx}
                              className={`grid grid-cols-12 gap-4 p-4 text-xs transition-colors items-center ${
                                isHighlighted ? 'bg-amber-50/20' : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* Spec Name */}
                              <div className="col-span-4 font-bold text-slate-700 pr-2">
                                <span>{isHindi ? row.labelHi : row.labelEn}</span>
                                {row.isDiff && (
                                  <span className="ml-1.5 inline-block text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                    Diff
                                  </span>
                                )}
                              </div>

                              {/* Scheme 1 Value */}
                              <div
                                className={`col-span-4 text-center p-2 rounded-xl transition ${
                                  isWin1
                                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                                    : 'text-slate-800 font-semibold'
                                }`}
                              >
                                <div>{row.val1}</div>
                                {isWin1 && (
                                  <div className="mt-0.5">
                                    <span className="inline-flex items-center text-[9px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                                      ✓ {row.diffBadge || 'Winner'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Scheme 2 Value */}
                              <div
                                className={`col-span-4 text-center p-2 rounded-xl transition ${
                                  isWin2
                                    ? 'bg-blue-50 border border-blue-300 text-blue-950 font-bold shadow-2xs'
                                    : 'text-slate-800 font-semibold'
                                }`}
                              >
                                <div>{row.val2}</div>
                                {isWin2 && (
                                  <div className="mt-0.5">
                                    <span className="inline-flex items-center text-[9px] font-extrabold uppercase text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                                      ✓ {row.diffBadge || 'Winner'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* 5. STICKY FLOATING QUICK ACTION BAR */}
            <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>
                  <strong>Ready to proceed?</strong> Select your preferred scheme to generate the instant document checklist & application pass.
                </span>
              </div>
              <div className="flex items-center space-x-3 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSelectAndApply(scheme1)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs transition cursor-pointer shadow-sm active:scale-95"
                >
                  Apply {scheme1.name.split(' ')[0]}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAndApply(scheme2)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition cursor-pointer shadow-sm active:scale-95"
                >
                  Apply {scheme2.name.split(' ')[0]}
                </button>
              </div>
            </div>

          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: FAMILY MEMBER SCHEME INSPECTION & ROUTING SLIP                      */}
      {/* ========================================================================= */}
      {activeFamilyOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-indigo-950 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-900 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-800/80 border border-indigo-400/30 flex items-center justify-center font-bold text-lg">
                  👩‍👦
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    {isHindi ? 'पारिवारिक ऋण तुलना एवं आवेदन' : 'Family Member Credit Alternative'}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {isHindi ? activeFamilyOpp.titleHi : activeFamilyOpp.titleEn}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveFamilyOpp(null)}
                className="w-8 h-8 rounded-full bg-indigo-900 hover:bg-indigo-800 text-indigo-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Member Input Fields */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block">
                  {isHindi ? 'परिवार के सदस्य का विवरण (सह-आवेदक पास हेतु):' : 'Family Member Details (For Co-Applicant Pass):'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      {isHindi ? 'सदस्य का पूरा नाम' : 'Member Full Name'}
                    </label>
                    <input
                      type="text"
                      value={customFamilyName}
                      onChange={(e) => setCustomFamilyName(e.target.value)}
                      placeholder="e.g. Sunita Devi"
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      {isHindi ? 'उम्र (वर्ष)' : 'Age (Years)'}
                    </label>
                    <input
                      type="number"
                      value={customFamilyAge}
                      onChange={(e) => setCustomFamilyAge(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Side-by-Side Savings Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    {isHindi ? 'आपके नाम पर (सामान्य दर)' : 'In Your Own Name'}
                  </span>
                  <strong className="text-sm font-black text-slate-700">6.0% – 8.0% p.a.</strong>
                  <span className="text-[10px] text-slate-500 block">Standard Term Loan rate</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">
                    {isHindi ? 'इनके नाम पर (रियायती दर)' : `In ${activeFamilyOpp.relation}'s Name`}
                  </span>
                  <strong className="text-sm font-black text-emerald-700">{activeFamilyOpp.interestRate} p.a.</strong>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    {isHindi ? activeFamilyOpp.highlightTagHi : activeFamilyOpp.highlightTagEn}
                  </span>
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1.5 leading-relaxed">
                <div className="font-bold text-indigo-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>{isHindi ? 'यह आपके परिवार के लिए सबसे बेहतर क्यों है?' : 'Why is this the smartest choice for your household?'}</span>
                </div>
                <p className="text-[11px] text-indigo-800">
                  {isHindi ? activeFamilyOpp.whyInMemberNameHi : activeFamilyOpp.whyInMemberNameEn}
                </p>
                <div className="pt-1 text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span>{isHindi ? activeFamilyOpp.savingEstimateHi : activeFamilyOpp.savingEstimateEn}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    const matched = availableSchemes.find(s => s.code === activeFamilyOpp.schemeCode) || availableSchemes[0];
                    setActiveFamilyOpp(null);
                    handleSelectAndApply(matched);
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>
                    {isHindi 
                      ? `${customFamilyName} के नाम पर आवेदन प्रारंभ करें` 
                      : `Apply in ${customFamilyName}'s Name`}
                  </span>
                </button>

                <button
                  onClick={() => {
                    const matched = availableSchemes.find(s => s.code === activeFamilyOpp.schemeCode) || availableSchemes[0];
                    setActiveFamilyOpp(null);
                    handleSelectAndCalculate(matched);
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5 border border-slate-300 cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-orange-600" />
                  <span>{isHindi ? 'ईएमआई कैलकुलेटर' : 'Model EMI'}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ADD SCHEME MODAL (SCA / BANK CHANNEL DESK) */}
      <AddSchemeModal
        isOpen={isAddSchemeModalOpen}
        onClose={() => setIsAddSchemeModalOpen(false)}
        onSchemeAdded={(newScheme) => {
          setAvailableSchemes(SchemeRegistryService.getAllSchemes());
          setScheme2Id(newScheme.id);
          setIsAddSchemeModalOpen(false);
        }}
        language={language}
      />

    </div>
  );
};
