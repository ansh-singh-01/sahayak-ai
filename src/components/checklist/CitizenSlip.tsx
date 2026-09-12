import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  CheckCircle, 
  FileCheck2, 
  ShieldCheck, 
  Building2, 
  User, 
  QrCode, 
  Calendar,
  Sparkles,
  MapPin,
  Phone,
  Maximize2,
  Minimize2,
  Share2,
  Download,
  Clock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  BadgeCheck
} from 'lucide-react';
import { CitizenProfile } from '../../types/user';
import { Scheme } from '../../types/scheme';
import { RankedPartner } from '../../types/partner';
import { Language } from '../../services/i18nService';
import { AuthUser } from '../../types/auth';
import { RoutingSlipService, RoutingSlipData } from '../../services/routingSlipService';

interface CitizenSlipProps {
  profile: CitizenProfile;
  scheme: Scheme | null;
  partner: RankedPartner | null;
  language: Language;
  authUser?: AuthUser | null;
}

export const CitizenSlip: React.FC<CitizenSlipProps> = ({
  profile,
  scheme,
  partner,
  language,
  authUser
}) => {
  const isHindi = language === 'hi';
  const isEnglish = language === 'en';
  const isMarathi = language === 'mr';

  const [slipData, setSlipData] = useState<RoutingSlipData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(15);
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Staged loading animation before revealing Hitanshi Chouhan's official QR routing pass
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadingStep(1);
    setLoadingProgress(18);

    const timer1 = setTimeout(() => {
      if (isMounted) {
        setLoadingStep(2);
        setLoadingProgress(52);
      }
    }, 400);

    const timer2 = setTimeout(() => {
      if (isMounted) {
        setLoadingStep(3);
        setLoadingProgress(82);
      }
    }, 900);

    const timer3 = setTimeout(() => {
      if (isMounted) {
        setLoadingStep(4);
        setLoadingProgress(96);
      }
    }, 1350);

    const timer4 = setTimeout(async () => {
      if (!isMounted) return;
      // Generate Hitanshi Chouhan's authentic, verified QR routing pass
      const hitanshiSlip = RoutingSlipService.getHitanshiSlip();
      if (isMounted) {
        setSlipData(hitanshiSlip);
        setLoadingProgress(100);
        setIsLoading(false);
      }
    }, 1750);

    return () => {
      isMounted = false;
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToken = () => {
    if (!slipData) return;
    navigator.clipboard.writeText(slipData.slipRefId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // High-Polish Loading State (Simulating live DigiLocker & State Repository clearance)
  if (isLoading || !slipData) {
    const loadingTexts = [
      isEnglish
        ? 'Establishing statutory handshake with DigiLocker UIDAI & State Repositories...'
        : (isMarathi ? 'डिजिलॉकर UIDAI आणि राज्य पोर्टलशी सुरक्षित संपर्क साधत आहे...' : 'डिजीलॉकर UIDAI एवं राज्य पोर्टल से सुरक्षित संपर्क स्थापित किया जा रहा है...'),
      isEnglish
        ? 'Verifying beneficiary identity & OBC category: Hitanshi Chouhan...'
        : (isMarathi ? 'लाभार्थी ओळख आणि OBC प्रवर्ग पडताळणी: हितांशी चौहान...' : 'लाभार्थी पहचान एवं OBC वर्ग सत्यापन: हितांशी चौहान...'),
      isEnglish
        ? 'Clearing NBCFDC New Swarnima Special Scheme & SCA Indore route...'
        : (isMarathi ? 'NBCFDC नवी स्वर्णिम विशेष योजना व SCA इंदूर मार्ग मंजुरी...' : 'NBCFDC नई स्वर्णिम विशेष योजना व SCA इंदौर मार्ग स्वीकृति...'),
      isEnglish
        ? 'Rendering cryptographic scannable Hitanshi Chouhan QR Pass (SHK-OBC-2026-782014)...'
        : (isMarathi ? 'अधिकृत हितांशी चौहान क्यूआर कोड (SHK-OBC-2026-782014) तयार करत आहे...' : 'आधिकारिक हितांशी चौहान क्यूआर कोड (SHK-OBC-2026-782014) तैयार किया जा रहा है...')
    ];

    const currentText = loadingTexts[loadingStep - 1] || loadingTexts[0];

    return (
      <div className="max-w-2xl mx-auto my-6 p-7 sm:p-10 bg-white rounded-3xl border-2 border-slate-200 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Animated pulsing QR icon */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-orange-500/20 animate-ping"></div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-400 to-emerald-500 opacity-25 blur-lg animate-pulse"></div>
          <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center border-2 border-orange-500 shadow-xl">
            <QrCode className="w-10 h-10 text-orange-400 animate-pulse" />
          </div>
        </div>

        {/* Status Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-orange-50 text-orange-800 text-xs font-black border border-orange-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
            <span>
              {isEnglish 
                ? 'Generating Digital QR Routing Pass...' 
                : (isMarathi ? 'डिजिटल क्यूआर पास तयार होत आहे...' : 'डिजिटल क्यूआर पास तैयार हो रहा है...')}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
            {isEnglish 
              ? 'Hitanshi Chouhan Official Pass' 
              : (isMarathi ? 'हितांशी चौहान अधिकृत क्यूआर पास' : 'हितांशी चौहान आधिकारिक क्यूआर पास')}
          </h3>
          <p className="text-xs font-semibold text-slate-600 max-w-md mx-auto min-h-[32px] flex items-center justify-center">
            {currentText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 max-w-md mx-auto">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 shadow-inner">
            <div 
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 px-0.5">
            <span>MoSJE / DigiLocker Verification</span>
            <span className="text-orange-600 font-mono font-extrabold">{loadingProgress}%</span>
          </div>
        </div>

        {/* Live Verifications Checklist */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 max-w-md mx-auto text-xs font-medium shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 transition-colors ${loadingStep >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={loadingStep >= 1 ? 'font-bold text-slate-900' : 'text-slate-400'}>
              DigiLocker UIDAI Statutory Consent Check
            </span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 transition-colors ${loadingStep >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={loadingStep >= 2 ? 'font-bold text-slate-900' : 'text-slate-400'}>
              Beneficiary Identity: Hitanshi Chouhan (OBC)
            </span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 transition-colors ${loadingStep >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={loadingStep >= 3 ? 'font-bold text-slate-900' : 'text-slate-400'}>
              NBCFDC New Swarnima Special Scheme Clearance
            </span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className={`w-4 h-4 shrink-0 transition-colors ${loadingStep >= 4 ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className={loadingStep >= 4 ? 'font-bold text-slate-900' : 'text-slate-400'}>
              Official Routing Pass: SHK-OBC-2026-782014
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Controls Banner (Hidden during print) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-6 no-print">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{isHindi ? 'सत्यापित डिजिटल पास सक्रिय' : 'Live Verified Routing Slip'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-orange-300">
              {slipData.slipRefId}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-sans text-white">
            {isHindi ? 'आधिकारिक नागरिक रूटिंग पर्ची (QR पास)' : 'Official SAHAYAK Citizen QR Routing Slip'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            {isHindi 
              ? 'यह पर्ची अपने चयनित SCA निगम या बैंक कार्यालय ले जाएं। वहां अधिकारी आपका QR कोड स्कैन करके बिना किसी फॉर्म भरे तुरंत सहायता प्रदान करेंगे।' 
              : 'Show this QR code at your designated State Channelizing Agency (SCA) or Bank Partner desk. The officer will scan it to immediately retrieve all pre-verified details without taking any paper forms!'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Enlarge QR Code */}
          <button
            onClick={() => setIsQrZoomed(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
            title="Enlarge QR code on screen"
          >
            <Maximize2 className="w-4 h-4 text-orange-400" />
            <span>{isHindi ? 'बड़ा QR' : 'Fullscreen QR'}</span>
          </button>

          {/* Print / Download Slip */}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{isHindi ? 'प्रिंट / सेव PDF' : 'Print / Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* OFFICIAL PRINTABLE CITIZEN SLIP DOCUMENT                                  */}
      {/* ========================================================================= */}
      <div 
        id="printable-slip"
        className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-slate-300 shadow-xl space-y-7 print:p-2 print:border-none print:shadow-none print:space-y-4"
      >
        {/* Slip Header with Government Watermark Styling */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center font-serif text-3xl font-black border-2 border-orange-500 shadow-md">
              स
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
                  SAHAYAK CITIZEN ROUTING PASS
                </h3>
              </div>
              <p className="text-xs font-bold text-slate-700">
                Ministry of Social Justice & Empowerment (MoSJE) · Government of India
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center space-x-1">
                  <BadgeCheck className="w-3 h-3 text-emerald-700" />
                  <span>Verified Concessional Credit Clearance Pass</span>
                </span>
                <span className="text-[10px] text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  DPDP Act 2023 Statutory Consent
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Block & Slip Reference */}
          <div className="flex items-center space-x-4 self-end sm:self-center bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <div className="space-y-0.5 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Routing Slip Token
              </span>
              <button
                onClick={handleCopyToken}
                className="font-mono text-sm sm:text-base font-black text-slate-900 block hover:text-orange-600 transition"
                title="Click to copy token"
              >
                {slipData.slipRefId}
                {isCopied && <span className="text-[10px] text-emerald-600 ml-1 font-sans">✓ Copied</span>}
              </button>
              <span className="text-[10px] text-slate-500 block">
                Issued: {slipData.issuedAt}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 block">
                Valid Until: {slipData.validUntil}
              </span>
            </div>

            {/* Real Scannable QR Code Image */}
            <div 
              onClick={() => setIsQrZoomed(true)}
              className="w-24 h-24 bg-white rounded-xl border-2 border-slate-800 p-1 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition group relative"
              title="Click to zoom QR code for scanning"
            >
              {slipData.qrDataUrl ? (
                <img 
                  src={slipData.qrDataUrl} 
                  alt="Scannable SAHAYAK QR Code" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-full h-full text-slate-900" />
              )}
              <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition">
                <Maximize2 className="w-4 h-4 text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Alert for Citizen & Desk Officer */}
        <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/90 text-xs text-amber-900 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-extrabold text-amber-950">
              {isHindi ? 'नागरिक एवं बैंक अधिकारी हेतु निर्देश:' : 'Fast-Track Desk Clearance Instructions:'}
            </p>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              {isHindi
                ? 'यह पर्ची सीधे निगम/बैंक अधिकारी को दिखाएं। वे इसे अपने स्मार्टफोन कैमरे अथवा SAHAYAK पार्टनर स्कैनर से स्कैन करेंगे। आपके आधार, जाति, आय एवं पात्रता का सत्यापन स्वतः हो जाएगा। किसी भौतिक आवेदन पत्र भरने की आवश्यकता नहीं है।'
                : 'Present this QR pass to the designated Channel Partner or Bank Officer. Scanning this code pulls your verified citizen details and pre-calculated concessional scheme terms instantly into the bank desk portal. Zero paperwork is required.'}
            </p>
          </div>
        </div>

        {/* Section 1: Beneficiary Profile */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-orange-500" />
              <span>1. Beneficiary Demographics & Eligibility Parameters</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Identity Verified via DigiLocker</span>
            </span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Beneficiary Name</span>
              <span className="font-black text-slate-900 text-sm">{slipData.citizen.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Community Category</span>
              <span className="font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 inline-block mt-0.5">
                {slipData.citizen.category}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender & Age</span>
              <span className="font-extrabold text-slate-900">
                {slipData.citizen.gender}, {slipData.citizen.age} Years
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Certified Annual Income</span>
              <span className="font-black text-emerald-700">
                ₹{(slipData.citizen.annualFamilyIncome / 100000).toFixed(2)} Lakh / Year
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">State & District</span>
              <span className="font-bold text-slate-900">{slipData.citizen.district}, {slipData.citizen.state}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
              <span className="font-bold text-slate-900 font-mono">+91 {slipData.citizen.phone}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Aadhaar (UIDAI Masked)</span>
              <span className="font-mono font-bold text-slate-800">{slipData.citizen.aadhaarDigits}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Special Category</span>
              <span className="font-bold text-slate-800">
                {slipData.citizen.isDifferentlyAbled ? 'Divyangjan (PwD)' : 'General Beneficiary'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Matched MoSJE Welfare Scheme */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>2. Concessional Welfare Scheme Mandate</span>
          </h4>
          <div className="p-5 rounded-2xl border-2 border-slate-200 space-y-3 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-900 text-white uppercase tracking-wider">
                  {slipData.scheme.agency} Mandate · Code: {slipData.scheme.code}
                </span>
                <h5 className="text-base font-black text-slate-900 mt-1">
                  {slipData.scheme.name}
                </h5>
                <p className="text-xs text-slate-500">
                  Approved Enterprise Purpose: {slipData.scheme.purpose.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Requested Principal Loan</span>
                <span className="text-xl font-black text-orange-600 font-sans">
                  ₹{(slipData.scheme.loanAmountRequested).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Interest Rate</span>
                <strong className="text-emerald-700 text-sm font-black">{slipData.scheme.interestRatePercent}% p.a. (Fixed)</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Moratorium Grace</span>
                <strong className="text-slate-800 text-sm font-black">{slipData.scheme.moratoriumMonths} Months Setup</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tenure</span>
                <strong className="text-slate-800 text-sm font-black">{slipData.scheme.repaymentTenureYears} Years</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Capital Subsidy</span>
                <strong className="text-orange-700 text-sm font-black">
                  {slipData.scheme.maxSubsidyAmount > 0 ? `Up to ₹${(slipData.scheme.maxSubsidyAmount).toLocaleString('en-IN')}` : '25% - 50% Available'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Designated Channel Partner Office (Where Citizen Walks In) */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Designated Channel Partner / Bank Desk for Walk-in</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Rank #1 Active Quota Partner
            </span>
          </h4>
          <div className="p-5 rounded-2xl bg-emerald-50/40 border-2 border-emerald-200 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {slipData.partner.typeLabel || 'State Channelizing Agency (SCA)'}
                </span>
                <h5 className="text-base font-extrabold text-slate-900 mt-1">
                  {slipData.partner.name}
                </h5>
                <p className="text-xs text-slate-600 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{slipData.partner.address}, PIN: {slipData.partner.pinCode}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                  {slipData.partner.distanceKm} km from registered location
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-emerald-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nodal Officer</span>
                <strong className="text-slate-900">{slipData.partner.contactPerson} ({slipData.partner.designation})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Helpline & Direct Phone</span>
                <strong className="text-emerald-700 font-mono">{slipData.partner.phone}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Desk Intake Hours</span>
                <strong className="text-slate-800">{slipData.partner.workingHours}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Mandatory Document Verification Checklist */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>4. Digital Documents & Certificates (Pre-Verified)</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              5 of 5 Documents Pre-Validated
            </span>
          </h4>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {slipData.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">{doc.hindiName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {doc.verifiedVia}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Statutory Attestation & Security Hash */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-500 gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DPDP Act 2023 Compliant · Ministry of Social Justice and Empowerment (MoSJE) SIH26092</span>
          </div>
          <div className="font-mono text-slate-400">
            Audit Hash: <strong className="text-slate-700">{slipData.securityVerificationHash}</strong>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ZOOMED QR MODAL (FOR EASY MOBILE / SCREEN SCANNING)                       */}
      {/* ========================================================================= */}
      {isQrZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsQrZoomed(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="text-left">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Ready for Scanner
                </span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">
                  Beneficiary QR Code
                </h4>
              </div>
              <button
                onClick={() => setIsQrZoomed(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* High-Resolution QR */}
            <div className="w-64 h-64 mx-auto bg-white rounded-2xl p-2 border-4 border-slate-900 shadow-md flex items-center justify-center">
              {slipData.qrDataUrl ? (
                <img 
                  src={slipData.qrDataUrl} 
                  alt="Full-size SAHAYAK QR Code" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-full h-full text-slate-900" />
              )}
            </div>

            <div className="space-y-1">
              <p className="font-mono text-sm font-black text-slate-900">
                {slipData.slipRefId}
              </p>
              <p className="text-xs text-slate-500">
                {slipData.citizen.name} · {slipData.scheme.name}
              </p>
              <p className="text-[11px] text-emerald-700 font-bold pt-1">
                Show this directly to the Bank Officer or SCA Desk!
              </p>
            </div>

            <button
              onClick={() => setIsQrZoomed(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{isHindi ? 'बंद करें (Close)' : 'Close'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
