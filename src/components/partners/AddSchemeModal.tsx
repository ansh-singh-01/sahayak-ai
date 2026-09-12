import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  Percent, 
  Coins, 
  Calendar, 
  FileText, 
  Users, 
  ShieldCheck, 
  HelpCircle,
  FileCheck2,
  Trash2,
  Layers,
  ArrowRight,
  Landmark
} from 'lucide-react';
import { Scheme, MinistryAgency, BeneficiaryCategory, ProjectPurpose, InterestSlab } from '../../types/scheme';
import { SchemeRegistryService } from '../../services/schemeRegistry';
import { Language } from '../../services/i18nService';

interface AddSchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchemeAdded: (newScheme: Scheme) => void;
  language: Language;
  defaultChannelPartnerName?: string;
  defaultChannelPartnerType?: 'SCA' | 'PSU_BANK' | 'RRB' | 'COOPERATIVE_BANK';
  defaultState?: string;
  defaultDistrict?: string;
}

export const AddSchemeModal: React.FC<AddSchemeModalProps> = ({
  isOpen,
  onClose,
  onSchemeAdded,
  language,
  defaultChannelPartnerName = 'MP State Cooperative Scheduled Castes Finance & Dev Corp (SCA)',
  defaultChannelPartnerType = 'SCA',
  defaultState = 'Madhya Pradesh',
  defaultDistrict = 'Indore'
}) => {
  const isHindi = language === 'hi';

  // Form State
  const [partnerName, setPartnerName] = useState(defaultChannelPartnerName);
  const [partnerType, setPartnerType] = useState<'SCA' | 'PSU_BANK' | 'RRB' | 'COOPERATIVE_BANK'>(defaultChannelPartnerType);
  const [stateName, setStateName] = useState(defaultState);
  const [districtName, setDistrictName] = useState(defaultDistrict);
  
  const [agency, setAgency] = useState<MinistryAgency>('NSFDC');
  const [schemeName, setSchemeName] = useState('');
  const [hindiSchemeName, setHindiSchemeName] = useState('');
  const [schemeCode, setSchemeCode] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [hindiDescription, setHindiDescription] = useState('');

  const [targetCommunity, setTargetCommunity] = useState<BeneficiaryCategory[]>(['SC']);
  const [genderRestriction, setGenderRestriction] = useState<'ALL' | 'FEMALE_ONLY'>('ALL');
  const [eligiblePurposes, setEligiblePurposes] = useState<ProjectPurpose[]>(['SMALL_BUSINESS', 'AGRICULTURE']);

  const [maxProjectCost, setMaxProjectCost] = useState<number>(1000000);
  const [maxLoanAmount, setMaxLoanAmount] = useState<number>(900000);
  const [interestRate, setInterestRate] = useState<number>(4.5);
  const [subsidyPercentage, setSubsidyPercentage] = useState<number>(20);
  const [maxSubsidyAmount, setMaxSubsidyAmount] = useState<number>(150000);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(6);
  const [maxTenureYears, setMaxTenureYears] = useState<number>(7);
  const [incomeCeiling, setIncomeCeiling] = useState<number>(300000);

  const [requiredDocs, setRequiredDocs] = useState<string[]>([
    'Aadhaar Card / Voter ID',
    'Caste Certificate issued by Competent Authority',
    'Annual Family Income Certificate',
    'Detailed Project Report (DPR) / Cost Quotation',
    'Bank Account Passbook (Aadhaar linked)'
  ]);
  const [newDocInput, setNewDocInput] = useState('');

  const [keyBenefits, setKeyBenefits] = useState<string[]>([
    'Subsidized interest rate lower than commercial banks',
    'Deferred moratorium period during business gestation',
    'Direct DBT subsidy credit upon project completion'
  ]);
  const [newBenefitInput, setNewBenefitInput] = useState('');

  const [submittedScheme, setSubmittedScheme] = useState<Scheme | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Preset quick fill templates for rapid judge testing
  const applyPreset = (presetId: 'mpscdc' | 'sbi' | 'pnb' | 'mahapreet') => {
    setErrorMsg('');
    if (presetId === 'mpscdc') {
      setPartnerName('MP State Cooperative Scheduled Castes Finance & Dev Corp (SCA)');
      setPartnerType('SCA');
      setAgency('NSFDC');
      setSchemeName('Mukhyamantri Anusuchit Jati Swarojgar Yojana (SCA Credit-Link)');
      setHindiSchemeName('मुख्यमंत्री अनुसूचित जाति स्वरोजगार योजना (SCA क्रेडिट-लिंक)');
      setSchemeCode('SCA-MP-SWAR-26');
      setTagline('State concessional credit up to ₹10 Lakh with 20% capital subsidy for SC entrepreneurs.');
      setDescription('Flagship MP-SCDC channel scheme co-funded with NSFDC to support manufacturing, service shops, and agro-allied enterprises with 4.5% interest and upfront capital subsidy.');
      setHindiDescription('एनएसएफडीसी के सहयोग से म.प्र. राज्य सहकारी अ.जा. निगम द्वारा 4.5% रियायती ब्याज और 20% पूंजीगत अनुदान के साथ स्वरोजगार हेतु विशेष ऋण योजना।');
      setTargetCommunity(['SC']);
      setGenderRestriction('ALL');
      setEligiblePurposes(['SMALL_BUSINESS', 'AGRICULTURE', 'TRANSPORT_VEHICLE']);
      setMaxProjectCost(1000000);
      setMaxLoanAmount(800000);
      setInterestRate(4.5);
      setSubsidyPercentage(20);
      setMaxSubsidyAmount(200000);
      setMoratoriumMonths(6);
      setMaxTenureYears(7);
      setIncomeCeiling(350000);
    } else if (presetId === 'sbi') {
      setPartnerName('State Bank of India (Indore Main SME & Social Banking Hub)');
      setPartnerType('PSU_BANK');
      setAgency('NBCFDC');
      setSchemeName('SBI Sanjeevani Green Energy & Solar Micro-Enterprise Loan');
      setHindiSchemeName('एसबीआई संजीवनी हरित ऊर्जा एवं सौर सूक्ष्म उद्यम ऋण');
      setSchemeCode('SBI-NBC-SOLAR-08');
      setTagline('Concessional 4.0% credit for rooftop solar, EV cargo, and rural cold chain units.');
      setDescription('Specialized green channel loan by State Bank of India linked with NBCFDC refinance, offering competitive 4.0% interest for OBC rural entrepreneurs and green micro-enterprises.');
      setHindiDescription('ओबीसी उद्यमियों और हरित सूक्ष्म उद्यमों हेतु एसबीआई और एनबीसीएफडीसी द्वारा 4% ब्याज पर सोलर रूफटॉप व ई-वाहन वित्तपोषण।');
      setTargetCommunity(['OBC']);
      setGenderRestriction('ALL');
      setEligiblePurposes(['GREEN_BUSINESS', 'SMALL_BUSINESS']);
      setMaxProjectCost(1500000);
      setMaxLoanAmount(1350000);
      setInterestRate(4.0);
      setSubsidyPercentage(25);
      setMaxSubsidyAmount(250000);
      setMoratoriumMonths(6);
      setMaxTenureYears(8);
      setIncomeCeiling(300000);
    } else if (presetId === 'pnb') {
      setPartnerName('Punjab National Bank (Agriculture & Social Credit Division)');
      setPartnerType('PSU_BANK');
      setAgency('NBCFDC');
      setSchemeName('PNB Mahila Udyami Swavlamban Micro-Credit Scheme');
      setHindiSchemeName('पीएनबी महिला उद्यमी स्वावलंबन सूक्ष्म ऋण योजना');
      setSchemeCode('PNB-NBC-MAHILA-12');
      setTagline('Exclusive 3.8% p.a. micro-credit for women artisans, tailoring units, and retail shops.');
      setDescription('PNB social banking product dedicated to backward class women micro-entrepreneurs. Zero collateral required up to ₹3 Lakh with hassle-free 3.8% interest.');
      setHindiDescription('पिछड़ा वर्ग की महिला उद्यमियों, सिलाई व खुदरा दुकानों हेतु 3.8% वार्षिक दर पर शून्य गारंटी युक्त विशेष ऋण।');
      setTargetCommunity(['OBC']);
      setGenderRestriction('FEMALE_ONLY');
      setEligiblePurposes(['WOMEN_MICROCREDIT', 'SMALL_BUSINESS']);
      setMaxProjectCost(350000);
      setMaxLoanAmount(300000);
      setInterestRate(3.8);
      setSubsidyPercentage(30);
      setMaxSubsidyAmount(75000);
      setMoratoriumMonths(3);
      setMaxTenureYears(5);
      setIncomeCeiling(300000);
    } else if (presetId === 'mahapreet') {
      setPartnerName('Mahatma Phule Renewable Energy & Infra Tech Ltd (MAHAPREET)');
      setPartnerType('SCA');
      setAgency('NSKFDC');
      setSchemeName('Swachhata Udyami Mechanized Sanitation Fleet Loan');
      setHindiSchemeName('स्वच्छता उद्यमी यंत्रीकृत स्वच्छता वाहन योजना');
      setSchemeCode('SCA-MAHA-SWAC-01');
      setTagline('100% mechanized suction machines and jetting vehicles for Safai Karamcharis at 4.0% rate.');
      setDescription('Flagship channel initiative to eliminate manual scavenging by providing automated sewage cleaning vehicles and tractors to sanitation workers with 50% capital subsidy.');
      setHindiDescription('सफाई कर्मचारियों को 50% सरकारी अनुदान और मात्र 4% ब्याज पर आधुनिक सीवर सफाई मशीनें व वाहन उपलब्ध कराने की योजना।');
      setTargetCommunity(['SAFAI_KARAMCHARI']);
      setGenderRestriction('ALL');
      setEligiblePurposes(['SANITATION_REHAB', 'TRANSPORT_VEHICLE']);
      setMaxProjectCost(2000000);
      setMaxLoanAmount(1800000);
      setInterestRate(4.0);
      setSubsidyPercentage(50);
      setMaxSubsidyAmount(500000);
      setMoratoriumMonths(6);
      setMaxTenureYears(10);
      setIncomeCeiling(350000);
    }
  };

  const handleAddDocument = () => {
    if (newDocInput.trim() && !requiredDocs.includes(newDocInput.trim())) {
      setRequiredDocs([...requiredDocs, newDocInput.trim()]);
      setNewDocInput('');
    }
  };

  const handleRemoveDoc = (doc: string) => {
    setRequiredDocs(requiredDocs.filter(d => d !== doc));
  };

  const handleAddBenefit = () => {
    if (newBenefitInput.trim() && !keyBenefits.includes(newBenefitInput.trim())) {
      setKeyBenefits([...keyBenefits, newBenefitInput.trim()]);
      setNewBenefitInput('');
    }
  };

  const handleRemoveBenefit = (b: string) => {
    setKeyBenefits(keyBenefits.filter(x => x !== b));
  };

  const toggleCommunity = (cat: BeneficiaryCategory) => {
    if (targetCommunity.includes(cat)) {
      if (targetCommunity.length > 1) {
        setTargetCommunity(targetCommunity.filter(c => c !== cat));
      }
    } else {
      setTargetCommunity([...targetCommunity, cat]);
    }
  };

  const togglePurpose = (pur: ProjectPurpose) => {
    if (eligiblePurposes.includes(pur)) {
      if (eligiblePurposes.length > 1) {
        setEligiblePurposes(eligiblePurposes.filter(p => p !== pur));
      }
    } else {
      setEligiblePurposes([...eligiblePurposes, pur]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!schemeName.trim()) {
      setErrorMsg(isHindi ? 'कृपया योजना का नाम दर्ज करें' : 'Please enter the scheme name');
      return;
    }

    if (!partnerName.trim()) {
      setErrorMsg(isHindi ? 'कृपया चैनल पार्टनर / बैंक का नाम दर्ज करें' : 'Please specify the Channel Partner / Bank name');
      return;
    }

    const code = schemeCode.trim() || `SCA-${Date.now().toString().slice(-5)}`;
    const id = `scheme-channel-${Date.now()}`;

    const interestSlabs: InterestSlab[] = [
      {
        minAmount: 0,
        maxAmount: maxLoanAmount,
        ratePercent: interestRate,
        description: `Flat ${interestRate}% p.a. concessional rate under ${partnerName}`
      }
    ];

    const agencyFullNameMap: Record<MinistryAgency, string> = {
      NSFDC: 'National Scheduled Castes Finance & Development Corporation',
      NBCFDC: 'National Backward Classes Finance & Development Corporation',
      NSKFDC: 'National Safai Karamcharis Finance & Development Corporation'
    };

    const newScheme: Scheme = {
      id,
      code,
      name: schemeName.trim(),
      hindiName: hindiSchemeName.trim() || schemeName.trim(),
      agency,
      agencyFullName: agencyFullNameMap[agency],
      targetCommunity,
      tagline: tagline.trim() || `Channel loan scheme administered by ${partnerName}`,
      description: description.trim() || `Concessional credit scheme provided by ${partnerName} in partnership with ${agency}.`,
      hindiDescription: hindiDescription.trim() || description.trim() || 'चैनल पार्टनर द्वारा संचालित रियायती ऋण योजना।',
      maxProjectCost: Number(maxProjectCost),
      maxLoanAmount: Number(maxLoanAmount),
      subsidyPercentage: Number(subsidyPercentage),
      maxSubsidyAmount: Number(maxSubsidyAmount),
      interestSlabs,
      maxTenureYears: Number(maxTenureYears),
      moratoriumMonths: Number(moratoriumMonths),
      eligiblePurposes,
      genderRestriction,
      incomeCeiling: Number(incomeCeiling),
      keyBenefits,
      requiredDocuments: requiredDocs,
      officialPortalUrl: 'https://socialjustice.gov.in',
      rules: [
        {
          ruleId: `RULE-${code}-CAT`,
          field: 'category',
          condition: 'in',
          expectedValue: targetCommunity,
          explanation: `Beneficiary must belong to ${targetCommunity.join(', ')} community.`,
          weight: 35
        },
        {
          ruleId: `RULE-${code}-INC`,
          field: 'annualFamilyIncome',
          condition: 'lte',
          expectedValue: Number(incomeCeiling),
          explanation: `Annual family income must not exceed ₹${Number(incomeCeiling).toLocaleString('en-IN')}.`,
          weight: 30
        }
      ],
      // Channel Provider Metadata
      channelProviderName: partnerName.trim(),
      channelProviderType: partnerType,
      channelProviderDistrict: districtName.trim(),
      channelProviderState: stateName.trim(),
      isCustomChannelScheme: true,
      createdAt: new Date().toISOString()
    };

    // Register into SchemeRegistry
    SchemeRegistryService.addScheme(newScheme);
    setSubmittedScheme(newScheme);
    onSchemeAdded(newScheme);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white px-6 py-5 flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {isHindi ? 'एसडीए / बैंक चैनल पार्टनर डेस्क' : 'SCA / Bank Channel Desk'}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{isHindi ? 'पोर्टल पर लाइव परिनियोजन' : 'Instant Portal Deployment'}</span>
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                {isHindi ? 'नई सामाजिक ऋण योजना जोड़ें' : 'Add New Credit Scheme to Portal'}
              </h3>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {submittedScheme ? (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            
            <div className="space-y-2 max-w-lg mx-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {isHindi ? 'योजना सफलतापूर्वक सक्रिय की गई!' : 'Scheme Successfully Deployed Live!'}
              </span>
              <h4 className="text-xl font-black text-slate-900">
                {submittedScheme.name}
              </h4>
              <p className="text-xs text-slate-600">
                {isHindi 
                  ? `यह योजना अब सहायक पोर्टल पर पंजीकृत है। नागरिक इस योजना को 'योजना तुलना' (Compare Schemes) और ऋण कैलकुलेटर में तुरंत देख सकते हैं।`
                  : `This scheme is now live on the SAHAYAK portal under ${submittedScheme.channelProviderName}. Citizens can view, compare, and calculate EMIs immediately.`}
              </p>
            </div>

            {/* Scheme Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-xl mx-auto text-left grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">{isHindi ? 'कोड' : 'Scheme Code'}</span>
                <span className="font-mono font-bold text-slate-800">{submittedScheme.code}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">{isHindi ? 'ब्याज दर' : 'Interest Rate'}</span>
                <span className="font-black text-emerald-700">{submittedScheme.interestSlabs[0]?.ratePercent}% p.a.</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">{isHindi ? 'अधिकतम ऋण' : 'Max Loan'}</span>
                <span className="font-bold text-slate-800">₹{(submittedScheme.maxLoanAmount / 100000).toFixed(1)} Lakh</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">{isHindi ? 'अनुदान (Subsidy)' : 'Subsidy'}</span>
                <span className="font-bold text-indigo-700">{submittedScheme.subsidyPercentage}% (Max ₹{(submittedScheme.maxSubsidyAmount || 0) / 1000}k)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedScheme(null);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {isHindi ? 'पोर्टल पर देखें' : 'View on Portal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedScheme(null);
                  setSchemeName('');
                  setHindiSchemeName('');
                  setSchemeCode('');
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition cursor-pointer"
              >
                {isHindi ? '+ एक और योजना जोड़ें' : '+ Add Another Scheme'}
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Quick Presets Bar */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-xs font-black text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isHindi ? 'त्वरित डेमो टेम्पलेट्स (न्यायाधीशों के परीक्षण हेतु):' : '1-Click Presets for Quick Testing & Demonstration:'}</span>
                </div>
                <span className="text-[10px] text-amber-700 font-semibold">{isHindi ? 'क्लिक करके तुरंत भरें' : 'Auto-fills all fields'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('mpscdc')}
                  className="p-2 text-left rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 transition text-[11px] font-bold text-slate-800 shadow-xs cursor-pointer"
                >
                  <span className="block text-amber-800 text-[10px] font-black uppercase">MP-SCDC (SCA)</span>
                  Mukhyamantri Swarojgar (4.5% - ₹10L)
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('sbi')}
                  className="p-2 text-left rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 transition text-[11px] font-bold text-slate-800 shadow-xs cursor-pointer"
                >
                  <span className="block text-blue-800 text-[10px] font-black uppercase">State Bank of India</span>
                  SBI Sanjeevani Green Solar (4.0% - ₹15L)
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('pnb')}
                  className="p-2 text-left rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 transition text-[11px] font-bold text-slate-800 shadow-xs cursor-pointer"
                >
                  <span className="block text-rose-800 text-[10px] font-black uppercase">Punjab National Bank</span>
                  PNB Mahila Swavlamban (3.8% - ₹3L)
                </button>

                <button
                  type="button"
                  onClick={() => applyPreset('mahapreet')}
                  className="p-2 text-left rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 transition text-[11px] font-bold text-slate-800 shadow-xs cursor-pointer"
                >
                  <span className="block text-emerald-800 text-[10px] font-black uppercase">MAHAPREET (SCA)</span>
                  Sanitation Fleet Mechanization (4.0%)
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* SECTION 1: Channel Provider & Sponsoring Agency */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {isHindi ? '1. चैनल प्रदाता एवं नोडल एजेंसी विवरण' : '1. Channel Provider & Nodal Agency Details'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'चैनल प्रदाता संस्था का नाम (SCA / बैंक)' : 'Channel Provider Organization (SCA / Bank Name)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. MP State Cooperative Scheduled Castes Finance & Dev Corp (SCA)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'प्रदाता का प्रकार' : 'Provider Type'}
                  </label>
                  <select
                    value={partnerType}
                    onChange={(e) => setPartnerType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SCA">State Channelizing Agency (SCA)</option>
                    <option value="PSU_BANK">Public Sector Bank (PSU Bank)</option>
                    <option value="RRB">Regional Rural Bank (RRB)</option>
                    <option value="COOPERATIVE_BANK">Cooperative Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'शीर्ष निगम संबद्धता (Apex Corp)' : 'Affiliated Apex Corporation'}
                  </label>
                  <select
                    value={agency}
                    onChange={(e) => setAgency(e.target.value as MinistryAgency)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NSFDC">NSFDC (Scheduled Castes)</option>
                    <option value="NBCFDC">NBCFDC (Backward Classes)</option>
                    <option value="NSKFDC">NSKFDC (Safai Karamcharis)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'राज्य' : 'State'}
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Madhya Pradesh"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'जिला / परिचालन क्षेत्र' : 'District / Jurisdiction'}
                  </label>
                  <input
                    type="text"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    placeholder="Indore"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Scheme Identity */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {isHindi ? '2. योजना का नाम एवं उद्देश्य' : '2. Scheme Identity & Objectives'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'योजना का नाम (English)' : 'Scheme Name (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={schemeName}
                    onChange={(e) => setSchemeName(e.target.value)}
                    placeholder="e.g. Mukhyamantri Anusuchit Jati Swarojgar Yojana"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'योजना कोड' : 'Scheme Code'}
                  </label>
                  <input
                    type="text"
                    value={schemeCode}
                    onChange={(e) => setSchemeCode(e.target.value)}
                    placeholder="e.g. SCA-MP-2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'योजना का नाम (हिंदी)' : 'Scheme Name (Hindi)'}
                  </label>
                  <input
                    type="text"
                    value={hindiSchemeName}
                    onChange={(e) => setHindiSchemeName(e.target.value)}
                    placeholder="e.g. मुख्यमंत्री अनुसूचित जाति स्वरोजगार योजना"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'लिंग पात्रता' : 'Gender Eligibility'}
                  </label>
                  <select
                    value={genderRestriction}
                    onChange={(e) => setGenderRestriction(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50"
                  >
                    <option value="ALL">All Genders (सभी)</option>
                    <option value="FEMALE_ONLY">Women Only (केवल महिलाएं - Special Concession)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHindi ? 'टैगलाइन / मुख्य आकर्षण' : 'Tagline / Key Highlight'}
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Low-interest credit up to ₹10 Lakh with 20% capital subsidy"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
                  />
                </div>

                {/* Target Community Badges */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHindi ? 'लक्षित समुदाय (Target Community):' : 'Eligible Beneficiary Communities:'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['SC', 'ST', 'OBC', 'SAFAI_KARAMCHARI', 'OPEN'] as BeneficiaryCategory[]).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCommunity(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                          targetCommunity.includes(cat)
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {targetCommunity.includes(cat) && <CheckCircle2 className="w-3 h-3" />}
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project Purposes */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHindi ? 'पात्र परियोजना क्षेत्र (Eligible Sectors):' : 'Eligible Project Sectors:'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['SMALL_BUSINESS', 'AGRICULTURE', 'GREEN_BUSINESS', 'SANITATION_REHAB', 'WOMEN_MICROCREDIT', 'TRANSPORT_VEHICLE', 'EDUCATION'] as ProjectPurpose[]).map(pur => (
                      <button
                        key={pur}
                        type="button"
                        onClick={() => togglePurpose(pur)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                          eligiblePurposes.includes(pur)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {pur.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Financial Slabs & Subsidies */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {isHindi ? '3. वित्तीय सीमाएं एवं रियायती ब्याज दर' : '3. Financial Limits & Concessional Rate'}
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isHindi ? 'ब्याज दर (% प्रति वर्ष)' : 'Interest Rate (% p.a.)'} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="15"
                      required
                      value={interestRate}
                      onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-emerald-700 pr-7"
                    />
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isHindi ? 'अधिकतम ऋण (INR)' : 'Max Loan Amount (₹)'} *
                  </label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={maxLoanAmount}
                    onChange={(e) => setMaxLoanAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isHindi ? 'पूंजीगत अनुदान (%)' : 'Capital Subsidy (%)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={subsidyPercentage}
                    onChange={(e) => setSubsidyPercentage(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isHindi ? 'अधिकतम अनुदान सीमा (₹)' : 'Max Subsidy Cap (₹)'}
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={maxSubsidyAmount}
                    onChange={(e) => setMaxSubsidyAmount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isHindi ? 'मोरेटोरियम (माह)' : 'Moratorium (Months)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={moratoriumMonths}
                    onChange={(e) => setMoratoriumMonths(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isHindi ? 'पुनर्भुगतान अवधि (वर्ष)' : 'Repayment (Years)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={maxTenureYears}
                    onChange={(e) => setMaxTenureYears(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isHindi ? 'अधिकतम पारिवारिक आय सीमा (₹ प्रति वर्ष)' : 'Annual Family Income Limit (₹ p.a.)'}
                  </label>
                  <input
                    type="number"
                    step="50000"
                    value={incomeCeiling}
                    onChange={(e) => setIncomeCeiling(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Required Documents Checklist */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <FileCheck2 className="w-4 h-4 text-orange-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  {isHindi ? '4. आवश्यक दस्तावेज चेकलिस्ट' : '4. Required Documents Checklist'}
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {requiredDocs.map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 text-[11px] font-semibold flex items-center space-x-1.5 border border-slate-200"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{doc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc)}
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={newDocInput}
                    onChange={(e) => setNewDocInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDocument();
                      }
                    }}
                    placeholder={isHindi ? 'नया दस्तावेज जोड़ें (उदा. दुकान किराया अनुबंध)...' : 'Add custom required document (e.g. Shop lease agreement)...'}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {isHindi ? 'योजना तुरन्त तुलना और सिमुलेटर में उपलब्ध होगी।' : 'Scheme will be instantly visible in Compare Schemes & Loan Calculator.'}
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isHindi ? 'योजना पोर्टल पर जारी करें' : 'Deploy Scheme to Portal'}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
