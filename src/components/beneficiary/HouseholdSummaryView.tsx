import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
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
  Tractor, 
  Wrench,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Scale
} from 'lucide-react';
import { HouseholdMember } from '../../types/user';
import { Language } from '../../services/i18nService';

interface HouseholdSummaryViewProps {
  primaryCitizenName: string;
  primaryCategory: string;
  language: Language;
  onSelectMemberScheme?: (schemeCode: string) => void;
  onNavigateToTab: (tab: 'wizard' | 'calculator' | 'partners' | 'recommendations' | 'checklist' | 'compare') => void;
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
    savingEstimateEn: 'Saves approx. ₹6,800/year compared to standard 7.5% commercial loans',
    savingEstimateHi: 'सामान्य 7.5% ऋण की तुलना में प्रति वर्ष लगभग ₹6,800 की बचत',
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
    maxAmountStr: '₹5.0 Lakh',
    maxAmountNum: 200000,
    highlightTagEn: '5.0% for Small Tractor & Solar Pump',
    highlightTagHi: 'छोटे ट्रैक्टर व सौर पंप हेतु 5.0% ब्याज',
    whyInMemberNameEn: 'If ancestral agricultural land or Kisan Passbook is registered in your father\'s name, loan processing is 80% faster with zero title transfer hassles.',
    whyInMemberNameHi: 'यदि पैतृक कृषि भूमि या किसान पासबुक पिता के नाम पर है, तो बिना भूमि नामांतरण के तत्काल ऋण स्वीकृत हो जाता है।',
    savingEstimateEn: 'Subsidized capital support with 6-month seasonal harvest moratorium',
    savingEstimateHi: 'फसल कटाई चक्र के अनुकूल 6 महीने का अतिरिक्त मोराटोरियम',
    iconType: 'farmer'
  },
  {
    id: 'opp-youth-sibling',
    relation: 'Sibling',
    defaultName: 'Pooja Kumari',
    age: 22,
    gender: 'FEMALE',
    titleEn: 'Young Sibling / Unemployed Youth',
    titleHi: 'भाई या बहन (युवा)',
    schemeCode: 'MoSJE-DAKSH-01',
    schemeNameEn: 'PM-DAKSH & Skill Self-Employment Loan',
    schemeNameHi: 'पीएम-दक्ष एवं कौशल स्वरोजगार ऋण',
    agency: 'NSFDC',
    interestRate: '4.0%',
    maxAmountStr: '₹2.0 Lakh',
    maxAmountNum: 100000,
    highlightTagEn: 'Free NSDC Training + ₹1,500/mo Stipend',
    highlightTagHi: 'मुफ्त कौशल प्रशिक्षण + ₹1,500 मासिक वजीफा',
    whyInMemberNameEn: 'Aimed at young family members (under 35). Combines government-certified skill training, monthly stipend, and instant tool-kit micro-credit.',
    whyInMemberNameHi: '35 वर्ष से कम आयु के युवाओं हेतु। सरकारी कौशल प्रमाण पत्र, वजीफा और तुरंत टूल-किट स्वरोजगार ऋण प्राप्त होता है।',
    savingEstimateEn: '100% free certified vocational course with guaranteed SCA credit linkage',
    savingEstimateHi: '100% मुफ्त सरकारी प्रशिक्षण और सीधे निगम से ऋण संयोजन',
    iconType: 'youth'
  }
];

export const HouseholdSummaryView: React.FC<HouseholdSummaryViewProps> = ({
  primaryCitizenName,
  primaryCategory,
  language,
  onSelectMemberScheme,
  onNavigateToTab
}) => {
  const isHindi = language === 'hi';
  const primaryName = primaryCitizenName || (isHindi ? 'आप (मुख्य खाता)' : 'You (Primary Account)');

  // Multi-member household roster
  const [members, setMembers] = useState<HouseholdMember[]>([
    {
      id: 'mem-1',
      name: primaryName,
      relation: 'Self',
      age: 32,
      gender: 'MALE',
      category: (primaryCategory as any) || 'OBC',
      annualIncome: 180000,
      purpose: 'ARTISAN_EQUIPMENT',
      loanAmountRequested: 250000,
      matchedSchemeName: 'General Term Loan Scheme (Small Business & Mechanization)',
      matchedSchemeCode: 'NBC-TL-01',
      matchedAgency: 'NBCFDC',
      matchedInterestRate: '6.0%',
      matchedMaxLoan: '₹15.0 Lakh',
      matchScore: 98,
      highlightTag: isHindi ? 'मुख्य खाताधारक (स्वयं)' : 'Primary Account Holder',
      stage: 'DOCUMENTS_READY'
    },
    {
      id: 'mem-2',
      name: isHindi ? 'सुनीता देवी' : 'Sunita Devi',
      relation: 'Mother',
      age: 50,
      gender: 'FEMALE',
      category: (primaryCategory as any) || 'OBC',
      annualIncome: 120000,
      purpose: 'MICRO_FINANCE',
      loanAmountRequested: 140000,
      matchedSchemeName: 'Mahila Samriddhi Yojana (Micro-Credit for Women)',
      matchedSchemeCode: 'NBC-MSY-04',
      matchedAgency: 'NBCFDC',
      matchedInterestRate: '4.0%',
      matchedMaxLoan: '₹1.40 Lakh',
      matchScore: 100,
      highlightTag: isHindi ? 'महिला रियायती दर: 4.0%' : '100% Women Concession: 4.0%',
      stage: 'ELIGIBLE'
    }
  ]);

  // Keep primary member name in sync with signed-in user
  React.useEffect(() => {
    if (primaryCitizenName) {
      setMembers(prev => prev.map(m => m.id === 'mem-1' ? { ...m, name: primaryCitizenName } : m));
    }
  }, [primaryCitizenName]);

  // Modal States
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState(false);
  const [activeOpportunityModal, setActiveOpportunityModal] = useState<FamilyOpportunityPreset | null>(null);
  const [modalTab, setModalTab] = useState<'details' | 'routing_slip'>('details');

  // Opportunity Application Form State
  const [applicantMemberName, setApplicantMemberName] = useState('');
  const [applicantMemberRelation, setApplicantMemberRelation] = useState<'Mother' | 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Sibling'>('Mother');
  const [applicantMemberAge, setApplicantMemberAge] = useState(50);
  const [applicantMemberLoanAmount, setApplicantMemberLoanAmount] = useState(140000);

  // New Member Modal Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<'Mother' | 'Father' | 'Spouse' | 'Son' | 'Daughter' | 'Sibling'>('Spouse');
  const [newMemberAge, setNewMemberAge] = useState(28);
  const [newMemberGender, setNewMemberGender] = useState<'FEMALE' | 'MALE'>('FEMALE');
  const [newMemberPurpose, setNewMemberPurpose] = useState('MICRO_FINANCE');

  // Aggregated calculations
  const totalHouseholdCredit = members.reduce((sum, m) => sum + m.loanAmountRequested, 0);

  // Open "Take Loan in Family Member's Name" modal prefilled with preset
  const handleOpenOpportunity = (preset: FamilyOpportunityPreset) => {
    setActiveOpportunityModal(preset);
    setApplicantMemberName(preset.defaultName);
    setApplicantMemberRelation(preset.relation);
    setApplicantMemberAge(preset.age);
    setApplicantMemberLoanAmount(preset.maxAmountNum);
    setModalTab('details');
  };

  // Add / Activate member from opportunity modal into roster
  const handleConfirmOpportunity = () => {
    if (!activeOpportunityModal) return;

    // Check if member with this relation already exists
    const existingIndex = members.findIndex(m => m.relation === applicantMemberRelation);
    const newMemberItem: HouseholdMember = {
      id: existingIndex >= 0 ? members[existingIndex].id : `mem-${Date.now()}`,
      name: applicantMemberName.trim() || activeOpportunityModal.defaultName,
      relation: applicantMemberRelation,
      age: applicantMemberAge,
      gender: activeOpportunityModal.gender,
      category: (primaryCategory as any) || 'OBC',
      annualIncome: 120000,
      purpose: activeOpportunityModal.id.includes('student') ? 'EDUCATION_HIGHER' : activeOpportunityModal.id.includes('farmer') ? 'AGRI_ALLIED' : 'MICRO_FINANCE',
      loanAmountRequested: applicantMemberLoanAmount,
      matchedSchemeName: activeOpportunityModal.schemeNameEn,
      matchedSchemeCode: activeOpportunityModal.schemeCode,
      matchedAgency: activeOpportunityModal.agency,
      matchedInterestRate: activeOpportunityModal.interestRate,
      matchedMaxLoan: activeOpportunityModal.maxAmountStr,
      matchScore: 99,
      highlightTag: isHindi ? activeOpportunityModal.highlightTagHi : activeOpportunityModal.highlightTagEn,
      stage: 'ELIGIBLE'
    };

    if (existingIndex >= 0) {
      setMembers(prev => {
        const next = [...prev];
        next[existingIndex] = newMemberItem;
        return next;
      });
    } else {
      setMembers(prev => [...prev, newMemberItem]);
    }

    // Switch to routing slip or close
    setModalTab('routing_slip');
  };

  const handleCustomAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const isFemale = newMemberGender === 'FEMALE';
    const isStudent = newMemberPurpose === 'EDUCATION_HIGHER';

    const schemeInfo = isFemale
      ? {
          name: 'Mahila Samriddhi Yojana (Micro-Credit for Women)',
          code: 'NBC-MSY-04',
          agency: 'NBCFDC' as const,
          rate: '4.0%',
          max: '₹1.40 Lakh',
          tag: isHindi ? '4.0% महिला रियायत' : '4.0% Women Concession'
        }
      : isStudent
      ? {
          name: 'Higher Professional Education Loan Scheme',
          code: 'NBC-EDU-02',
          agency: 'NBCFDC' as const,
          rate: '3.5%',
          max: '₹20.0 Lakh',
          tag: isHindi ? '3.5% छात्र रियायत + मोराटोरियम' : '3.5% Student Concession'
        }
      : {
          name: 'General Term Loan Scheme (Micro-Enterprise)',
          code: 'NBC-TL-01',
          agency: 'NBCFDC' as const,
          rate: '5.0%',
          max: '₹15.0 Lakh',
          tag: isHindi ? 'रियायती कार्यशील पूंजी' : 'Concessional Working Capital'
        };

    setMembers(prev => [
      ...prev,
      {
        id: `mem-${Date.now()}`,
        name: newMemberName,
        relation: newMemberRelation,
        age: Number(newMemberAge),
        gender: newMemberGender,
        category: (primaryCategory as any) || 'OBC',
        annualIncome: 130000,
        purpose: newMemberPurpose,
        loanAmountRequested: isFemale ? 140000 : isStudent ? 300000 : 250000,
        matchedSchemeName: schemeInfo.name,
        matchedSchemeCode: schemeInfo.code,
        matchedAgency: schemeInfo.agency,
        matchedInterestRate: schemeInfo.rate,
        matchedMaxLoan: schemeInfo.max,
        matchScore: 97,
        highlightTag: schemeInfo.tag,
        stage: 'ELIGIBLE'
      }
    ]);

    setNewMemberName('');
    setIsAddCustomModalOpen(false);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const renderOpportunityIcon = (type: FamilyOpportunityPreset['iconType']) => {
    switch (type) {
      case 'mother':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
        );
      case 'student':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        );
      case 'farmer':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Tractor className="w-6 h-6" />
          </div>
        );
      case 'youth':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-xl space-y-8">
      
      {/* 1. HEADER ROW: Overall Household Metric */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-indigo-100">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isHindi ? '★ परिवार के सदस्य के नाम पर ऋण' : "★ Take the Loan in a Family Member's Name"}</span>
            </span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Family ID: <span className="font-mono text-slate-700 font-bold">HH-MOSJE-8821</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-sans">
            {isHindi ? 'परिवार के सदस्य के नाम पर ऋण लें' : "Take the Loan in a Family Member's Name"}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            {isHindi 
              ? 'यदि आप अपने नाम पर किसी योजना के लिए पात्र नहीं हैं, या कम ब्याज (जैसे महिलाओं हेतु 4.0%) चाहते हैं, तो आप परिवार के अन्य सदस्य (माता, पत्नी, छात्र, पिता) के नाम पर ऋण लेकर स्वयं सह-आवेदक बन सकते हैं।' 
              : "If you do not qualify personally, or desire lower interest rates (such as 4.0% for women vs 6.0% general), you can take the loan in your eligible family member's name (Mother, Wife, Student Child, Father) while you act as co-borrower."}
          </p>
        </div>

        {/* Aggregated Household Metrics Card */}
        <div className="flex items-center space-x-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100/60 p-4 sm:p-5 rounded-2xl border border-indigo-200/80 shrink-0 shadow-sm">
          <div className="text-right">
            <span className="text-[10px] uppercase font-black text-indigo-600 tracking-wider block">
              {isHindi ? 'कुल परिवार ऋण क्षमता' : 'Household Credit Capacity'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-950 font-sans tracking-tight">
              ₹{(totalHouseholdCredit / 100000).toFixed(2)} Lakh
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center justify-end space-x-1 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{members.length} {isHindi ? 'पात्र सदस्य जुड़े हैं' : 'Active Member Credits'}</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. PROMOTIONAL CALLOUT: Compare Schemes & Family Member Options in Dedicated Tab */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-lg relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
              {isHindi ? 'योजना तुलना एवं पारिवारिक ऋण विकल्प' : 'Compare Schemes & Family Loans'}
            </span>
            <span className="text-xs text-emerald-400 font-bold">3.5% – 4.0%</span>
          </div>
          <h4 className="text-lg font-black text-white tracking-tight">
            {isHindi ? 'परिवार के सदस्य के नाम पर ऋण लें एवं योजना तुलना' : "Take the Loan in a Family Member's Name & Compare Schemes"}
          </h4>
          <p className="text-xs text-indigo-200/90 max-w-2xl leading-relaxed">
            {isHindi 
              ? 'क्या आपके परिवार में माता, पत्नी, छात्र पुत्र/पुत्री या पिता हैं? योजना तुलना टैब में जाकर सीधी तुलना देखें और कम ब्याज (3.5% - 4.0%) वाली योजनाओं का लाभ उठाएं।' 
              : 'Do you have a Mother, Wife, Student Child, or Father in your household? Explore the dedicated Scheme Comparison tab to view side-by-side rates and save thousands in annual interest.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('compare')}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 shrink-0 self-start sm:self-center cursor-pointer hover:scale-105"
        >
          <Scale className="w-4 h-4 text-white" />
          <span>{isHindi ? 'योजना तुलना टैब खोलें →' : 'Open Compare Schemes Tab →'}</span>
        </button>
      </div>

      {/* 3. HOUSEHOLD MEMBERS ROSTER: Multi-Member Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsAddCustomModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 transition flex items-center space-x-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isHindi ? '+ नया सदस्य' : '+ Add Member'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const isSelf = member.relation === 'Self';

            return (
              <div 
                key={member.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                  isSelf 
                    ? 'bg-slate-50/90 border-slate-300 ring-2 ring-slate-400/20 shadow-sm' 
                    : 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-lg'
                }`}
              >
                <div className="space-y-3">
                  {/* Identity Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isSelf 
                            ? 'bg-slate-200 text-slate-800 font-mono' 
                            : member.gender === 'FEMALE'
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isSelf ? (isHindi ? 'स्वयं (मुख्य खाता)' : 'Self (Primary)') : `${member.relation} (${member.age}y)`}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {member.matchScore}% {isHindi ? 'पात्रता' : 'Match'}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 mt-1.5">
                        {member.name}
                      </h4>
                    </div>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title={isHindi ? 'सदस्य हटाएं' : 'Remove member'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Highlight Tag */}
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200/80 inline-block">
                      ★ {member.highlightTag}
                    </span>
                  </div>

                  {/* Matched Scheme Summary */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        {member.matchedAgency} Mandate
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {member.matchedSchemeCode}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {member.matchedSchemeName}
                    </p>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">
                        {isHindi ? 'ऋण आवश्यकता' : 'Loan Goal'}
                      </span>
                      <strong className="text-slate-900 font-sans text-sm">
                        ₹{(member.loanAmountRequested / 100000).toFixed(2)} Lakh
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">
                        {isHindi ? 'रियायती ब्याज' : 'Interest Rate'}
                      </span>
                      <strong className="text-emerald-700 font-sans text-sm">
                        {member.matchedInterestRate}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {!isSelf ? (
                    <button
                      type="button"
                      onClick={() => {
                        const matchingOpp = FAMILY_OPPORTUNITIES.find(o => o.relation === member.relation) || FAMILY_OPPORTUNITIES[0];
                        setActiveOpportunityModal(matchingOpp);
                        setApplicantMemberName(member.name);
                        setApplicantMemberRelation(member.relation as any);
                        setApplicantMemberAge(member.age);
                        setApplicantMemberLoanAmount(member.loanAmountRequested);
                        setModalTab('details');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'इनके नाम पर आवेदन प्रबंधित करें' : `Apply as ${member.relation}`}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('calculator')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'स्वयं की ईएमआई देखें' : 'View Self EMI Calculator'}</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isHindi ? 'पात्रता प्रमाणित' : 'Pre-Qualified'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectMemberScheme) {
                          onSelectMemberScheme(member.matchedSchemeCode);
                        }
                        onNavigateToTab('recommendations');
                      }}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-1 transition cursor-pointer"
                    >
                      <span>{isHindi ? 'योजना विवरण' : 'Scheme Details'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MODAL: "Take Loan in Family Member's Name" Interactive Workflow */}
      {activeOpportunityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                {renderOpportunityIcon(activeOpportunityModal.iconType)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                      {isHindi ? 'सह-आवेदक ऋण सुविधा' : 'Family Member Loan Route'}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {activeOpportunityModal.interestRate} Concessional Rate
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                    {isHindi 
                      ? `${activeOpportunityModal.titleHi} के नाम पर ऋण लें` 
                      : `Apply in ${activeOpportunityModal.titleEn}'s Name`}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveOpportunityModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs: Application Config vs Official Pre-filled Routing Slip */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setModalTab('details')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  modalTab === 'details'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {isHindi ? '1. सदस्य एवं सह-ऋणी विवरण' : '1. Member & Co-Borrower Details'}
              </button>
              <button
                type="button"
                onClick={() => setModalTab('routing_slip')}
                className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                  modalTab === 'routing_slip'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isHindi ? '2. आधिकारिक आवेदन पर्ची (Routing Slip)' : '2. Official Routing Slip'}</span>
              </button>
            </div>

            {/* TAB 1: Member Setup & Benefit Explanation */}
            {modalTab === 'details' && (
              <div className="space-y-5">
                
                {/* Why this is smarter than taking in user's own name */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-indigo-950 font-black">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>{isHindi ? 'आपको यह ऋण सदस्य के नाम पर क्यों लेना चाहिए?' : 'Why apply in this family member\'s name?'}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {isHindi ? activeOpportunityModal.whyInMemberNameHi : activeOpportunityModal.whyInMemberNameEn}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="px-2 py-0.5 rounded bg-white text-indigo-900 font-bold border border-indigo-200">
                      ★ {isHindi ? activeOpportunityModal.savingEstimateHi : activeOpportunityModal.savingEstimateEn}
                    </span>
                  </div>
                </div>

                {/* Application Form */}
                <div className="space-y-4 text-xs">
                  
                  {/* Co-Borrower Structure Banner */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {isHindi ? 'मुख्य ऋणधारक (लाभार्थी)' : 'Primary Borrower (Member)'}
                      </span>
                      <strong className="text-slate-900 text-sm font-sans block mt-0.5">
                        {applicantMemberName || activeOpportunityModal.defaultName} ({applicantMemberRelation})
                      </strong>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        {isHindi ? 'सरकारी सब्सिडी सीधे इनके खाते में' : 'DBT Subsidy credited to Member'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {isHindi ? 'सह-आवेदक / गारंटर' : 'Co-Applicant / Guarantor'}
                      </span>
                      <strong className="text-slate-900 text-sm font-sans block mt-0.5">
                        {primaryName} ({isHindi ? 'आप - सत्यापित' : 'You - Authenticated'})
                      </strong>
                      <span className="text-[10px] text-indigo-700 font-medium">
                        {isHindi ? 'बैंक सत्यापन हेतु आप जिम्मेदार रहेंगे' : 'Primary Account Holder'}
                      </span>
                    </div>
                  </div>

                  {/* Form Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isHindi ? 'सदस्य का पूरा कानूनी नाम' : 'Member Legal Name'}
                      </label>
                      <input
                        type="text"
                        value={applicantMemberName}
                        onChange={(e) => setApplicantMemberName(e.target.value)}
                        placeholder="e.g. Sunita Devi"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isHindi ? 'पारिवारिक संबंध' : 'Relationship'}
                      </label>
                      <select
                        value={applicantMemberRelation}
                        onChange={(e) => setApplicantMemberRelation(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="Mother">Mother (माता)</option>
                        <option value="Spouse">Spouse (पति/पत्नी)</option>
                        <option value="Son">Son (पुत्र)</option>
                        <option value="Daughter">Daughter (पुत्री)</option>
                        <option value="Father">Father (पिता)</option>
                        <option value="Sibling">Sibling (भाई/बहन)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isHindi ? 'सदस्य की आयु (वर्ष)' : 'Member Age (Years)'}
                      </label>
                      <input
                        type="number"
                        min="18"
                        max="75"
                        value={applicantMemberAge}
                        onChange={(e) => setApplicantMemberAge(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {isHindi ? 'ऋण राशि लक्ष्य' : 'Requested Loan Amount'}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="10000"
                          value={applicantMemberLoanAmount}
                          onChange={(e) => setApplicantMemberLoanAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-sans font-bold"
                        />
                        <span className="text-xs font-bold text-slate-500 shrink-0">
                          (Max {activeOpportunityModal.maxAmountStr})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectMemberScheme) {
                          onSelectMemberScheme(activeOpportunityModal.schemeCode);
                        }
                        setActiveOpportunityModal(null);
                        onNavigateToTab('calculator');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isHindi ? 'ईएमआई कैलकुलेटर' : 'EMI Calculator'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectMemberScheme) {
                          onSelectMemberScheme(activeOpportunityModal.schemeCode);
                        }
                        setActiveOpportunityModal(null);
                        onNavigateToTab('checklist');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{isHindi ? 'आवश्यक दस्तावेज़' : 'Documents'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmOpportunity}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>{isHindi ? 'रोस्टर में जोड़ें व पर्ची देखें' : 'Confirm & View Routing Slip'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Official Pre-filled Routing Slip */}
            {modalTab === 'routing_slip' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 space-y-4 font-sans text-xs">
                  
                  {/* Official Slip Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase text-indigo-900">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        <span>Ministry of Social Justice & Empowerment (MoSJE) · Apex Corporation</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        Pre-Sanction Application Routing Slip (सह-आवेदक पर्ची)
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold text-slate-500 block">
                        Slip Ref: MOSJE-PROXY-{(Math.random() * 10000).toFixed(0).padStart(5, '0')}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        Verified via SAHAYAK
                      </span>
                    </div>
                  </div>

                  {/* Dual Beneficiary Matrix */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-slate-200">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">
                        Main Borrower (सदस्य)
                      </span>
                      <strong className="text-sm font-bold text-slate-900 block">
                        {applicantMemberName || activeOpportunityModal.defaultName}
                      </strong>
                      <div className="text-[11px] text-slate-600">
                        Relation: <strong>{applicantMemberRelation}</strong> · Age: {applicantMemberAge}y
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        Category: {primaryCategory} · Direct Beneficiary
                      </div>
                    </div>

                    <div className="space-y-1 border-l border-slate-100 pl-4">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">
                        Nominee / Co-Applicant (आप)
                      </span>
                      <strong className="text-sm font-bold text-slate-900 block">
                        {primaryName}
                      </strong>
                      <div className="text-[11px] text-slate-600">
                        Authenticated Citizen · Mobile Session
                      </div>
                      <div className="text-[10px] text-indigo-700 font-semibold mt-1">
                        Status: Primary Co-Signatory
                      </div>
                    </div>
                  </div>

                  {/* Scheme & Financials */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Sanction Target</span>
                      <strong className="text-slate-900 text-xs sm:text-sm font-sans">
                        ₹{(applicantMemberLoanAmount / 100000).toFixed(2)} Lakh
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Concessional Rate</span>
                      <strong className="text-emerald-700 text-xs sm:text-sm font-sans font-black">
                        {activeOpportunityModal.interestRate} p.a.
                      </strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold block">Agency</span>
                      <strong className="text-indigo-900 text-xs sm:text-sm font-sans">
                        {activeOpportunityModal.agency}
                      </strong>
                    </div>
                  </div>

                  {/* Barcode & Security Stamp Simulation */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div className="font-mono text-[9px] text-slate-400 tracking-widest">
                      ||| ||||| || |||||||| |||| ||| |||||
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      Submit this slip at nearest State Channelizing Agency (SCA)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setModalTab('details')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    ← {isHindi ? 'विवरण संशोधित करें' : 'Back to Edit Details'}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'पर्ची प्रिंट करें' : 'Print Slip'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOpportunityModal(null);
                        if (onSelectMemberScheme) {
                          onSelectMemberScheme(activeOpportunityModal.schemeCode);
                        }
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                    >
                      {isHindi ? 'स्वीकार करें एवं आगे बढ़ें' : 'Done'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL: Custom Member Add Modal */}
      {isAddCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">
                  {isHindi ? 'परिवार का नया सदस्य जोड़ें' : 'Add Household Member'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCustomModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCustomAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHindi ? 'सदस्य का पूरा नाम' : 'Full Legal Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamla Devi"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isHindi ? 'संबंध' : 'Relationship'}
                  </label>
                  <select
                    value={newMemberRelation}
                    onChange={(e) => setNewMemberRelation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Mother">Mother (माता)</option>
                    <option value="Spouse">Spouse (पति/पत्नी)</option>
                    <option value="Son">Son (पुत्र)</option>
                    <option value="Daughter">Daughter (पुत्री)</option>
                    <option value="Father">Father (पिता)</option>
                    <option value="Sibling">Sibling (भाई/बहन)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isHindi ? 'आयु (वर्ष)' : 'Age'}
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="75"
                    value={newMemberAge}
                    onChange={(e) => setNewMemberAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isHindi ? 'लिंग' : 'Gender'}
                  </label>
                  <select
                    value={newMemberGender}
                    onChange={(e) => setNewMemberGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="FEMALE">Female (महिला)</option>
                    <option value="MALE">Male (पुरुष)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isHindi ? 'ऋण प्रयोजन' : 'Loan Purpose'}
                  </label>
                  <select
                    value={newMemberPurpose}
                    onChange={(e) => setNewMemberPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="MICRO_FINANCE">Micro-Credit / Self Help Group</option>
                    <option value="EDUCATION_HIGHER">Higher Professional Education</option>
                    <option value="DAIRY_FARMING">Dairy / Animal Husbandry</option>
                    <option value="VOCATIONAL_TRAINING">Vocational Skill Development</option>
                    <option value="ARTISAN_EQUIPMENT">Artisan & Craft Machinery</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
                ✨ <strong>{isHindi ? 'स्वतः योजना मिलान' : 'Instant Rule Match'}:</strong>{' '}
                {isHindi 
                  ? 'इस सदस्य को जोड़ने से उनकी पात्रता का तुरंत मूल्यांकन किया जाएगा और परिवार की कुल ऋण क्षमता अपडेट होगी।' 
                  : 'Adding this member will evaluate statutory MoSJE guidelines for them and expand your total household potential.'}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {isHindi ? 'सदस्य जोड़ें व योजना खोजें' : 'Save & Match Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
