import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Calculator, 
  MapPin, 
  UserCheck, 
  Mic, 
  CheckCircle2, 
  Building2, 
  Scale, 
  Coins, 
  Percent, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Zap,
  BarChart3,
  FileCheck2,
  Tractor,
  Store,
  Truck,
  Scissors
} from 'lucide-react';
import { Scheme, MinistryAgency } from '../../types/scheme';
import { CitizenProfile, DemoProfile } from '../../types/user';
import { REAL_MOSJE_SCHEMES } from '../../data/schemesData';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface LandingPageProps {
  language: Language;
  onStartWizard: () => void;
  onOpenVoiceModal: () => void;
  onSelectSchemeForCalculator: (scheme: Scheme) => void;
  onSelectDemoProfile: (profile: CitizenProfile) => void;
  onNavigateToTab: (tab: 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onStartWizard,
  onOpenVoiceModal,
  onSelectSchemeForCalculator,
  onSelectDemoProfile,
  onNavigateToTab
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState<string>('ALL');

  const filteredSchemes = selectedAgencyFilter === 'ALL'
    ? REAL_MOSJE_SCHEMES
    : REAL_MOSJE_SCHEMES.filter(s => s.agency === selectedAgencyFilter);

  return (
    <div className="space-y-16 sm:space-y-24">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-4 sm:pt-8 pb-10 sm:pb-16 overflow-hidden">
        {/* Subtle background decorative gradient circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-200/40 via-amber-100/30 to-emerald-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Official Ministry Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 border border-slate-200/80 backdrop-blur-xs text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.heroBadge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] font-sans">
            {t.heroTitlePrefix}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600">
              {t.heroTitleHighlight}
            </span>{' '}
            {t.heroTitleSuffix}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            
            {/* Primary CTA */}
            <button
              onClick={onStartWizard}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-orange-600/25 flex items-center justify-center space-x-2"
            >
              <span>{t.checkEligibilityNow}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Voice-First CTA (Low-literacy accessibility) */}
            <button
              onClick={onOpenVoiceModal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 font-bold text-sm sm:text-base border-2 border-slate-200 transition-all flex items-center justify-center space-x-2 shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <span>{t.preferToSpeak}</span>
            </button>

            {/* Explore Schemes */}
            <a
              href="#schemes"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-slate-600 hover:text-slate-900 font-semibold text-sm transition text-center"
            >
              {t.exploreSchemes} ↓
            </a>

          </div>

          {/* Trust & Statutory Compliance Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
            <div className="flex items-center space-x-1.5 bg-white/70 px-3 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              <Scale className="w-4 h-4 text-orange-600" />
              <span>{isHindi ? '100% सटीक नियम इंजन (ज़ीरो एआई अनुमान)' : 'Deterministic Rule Engine (No AI Math)'}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/70 px-3 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>NSFDC · NBCFDC · NSKFDC</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. NATIONAL IMPACT & STATUTORY METRICS TICKER */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Coins className="w-3.5 h-3.5" />
              <span>{t.statMaxLoan}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans">₹50 Lakh</div>
            <div className="text-[11px] text-slate-400">
              {isHindi ? 'मियादी ऋण एवं यंत्रीकरण' : 'General Term & Mechanization'}
            </div>
          </div>

          <div className="space-y-1 pt-4 lg:pt-0 lg:pl-6">
            <div className="flex items-center space-x-1 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5" />
              <span>{t.statInterest}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans">4.0% – 8.0%</div>
            <div className="text-[11px] text-slate-400">
              {isHindi ? 'महिला व सूक्ष्म ऋण हेतु रियायती' : 'Subsidized & Concessional Slabs'}
            </div>
          </div>

          <div className="space-y-1 pt-4 lg:pt-0 lg:pl-6">
            <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>{isHindi ? 'छूट अवधि' : 'Moratorium Period'}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans">3 to 6 Mo.</div>
            <div className="text-[11px] text-slate-400">
              {isHindi ? 'व्यवसाय आरंभ के दौरान मूलधन छूट' : 'Principal Deferred During Setup'}
            </div>
          </div>

          <div className="space-y-1 pt-4 lg:pt-0 lg:pl-6">
            <div className="flex items-center space-x-1 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.statCorporations}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans">3 Apex PSUs</div>
            <div className="text-[11px] text-slate-400">
              NSFDC · NBCFDC · NSKFDC
            </div>
          </div>

          <div className="space-y-1 pt-4 lg:pt-0 lg:pl-6">
            <div className="flex items-center space-x-1 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>{t.statTatReduction}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-sans">~85% Faster</div>
            <div className="text-[11px] text-slate-400">
              {isHindi ? 'सत्यापित लोड-संतुलित आवंटन' : 'Pre-vetted Partner Routing'}
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE 3-STEP CITIZEN PATHWAY */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
            {isHindi ? 'सहज प्रक्रिया' : 'Simple 3-Step Process'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
            {t.howItWorksHeading}
          </h2>
          <p className="text-sm text-slate-500">
            {t.howItWorksSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-orange-400 hover:shadow-md transition group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t.step1Name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.step1Desc}
            </p>
            <div className="pt-2 text-xs font-bold text-orange-600 flex items-center space-x-1 cursor-pointer" onClick={onStartWizard}>
              <span>{isHindi ? 'पात्रता फॉर्म शुरू करें' : 'Start Form'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-amber-400 hover:shadow-md transition group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t.step2Name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.step2Desc}
            </p>
            <div className="pt-2 text-xs font-bold text-amber-600 flex items-center space-x-1">
              <span>{isHindi ? 'निकटतम चूक अंतर विश्लेषण' : 'PRD §16 Gap-to-Eligibility'}</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-7 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-md transition group space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
              <Calculator className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t.step3Name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.step3Desc}
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center space-x-1 cursor-pointer" onClick={() => onNavigateToTab('calculator')}>
              <span>{isHindi ? 'ईएमआई कैलकुलेटर खोलें' : 'Open EMI Modeler'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. APEX CORPORATIONS & SCHEME SHOWCASE */}
      {/* ========================================================================= */}
      <section id="schemes" className="space-y-8 scroll-mt-24">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              {isHindi ? 'आधिकारिक योजना सूची' : 'Official Scheme Catalog'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans mt-2">
              {t.corporationsHeading}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t.corporationsSub}
            </p>
          </div>

          {/* Corporation Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto max-w-full">
            {[
              { key: 'ALL', label: isHindi ? 'सभी योजनाएं (10)' : 'All Schemes (10)' },
              { key: 'NSFDC', label: 'NSFDC (SC)' },
              { key: 'NBCFDC', label: 'NBCFDC (OBC)' },
              { key: 'NSKFDC', label: isHindi ? 'NSKFDC (सफाई)' : 'NSKFDC (Safai)' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setSelectedAgencyFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedAgencyFilter === tab.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scheme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.slice(0, 6).map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-orange-400 hover:shadow-md transition flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
                    {scheme.agency}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{scheme.code}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {isHindi ? scheme.hindiName : scheme.name}
                </h3>
                
                <p className="text-xs text-slate-500 line-clamp-2">
                  {isHindi ? scheme.hindiDescription : scheme.description}
                </p>

                {/* Scheme Key Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isHindi ? 'अधिकतम ऋण' : 'Max Loan'}
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{(scheme.maxLoanAmount / 100000).toFixed(1)} Lakh
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isHindi ? 'ब्याज दर' : 'Interest Rate'}
                    </span>
                    <span className="font-extrabold text-emerald-600">
                      {scheme.interestSlabs[0]?.ratePercent}% p.a.
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {scheme.moratoriumMonths > 0 
                      ? `${scheme.moratoriumMonths} Mo. Moratorium + ${scheme.maxTenureYears} Yr Tenure`
                      : `Up to ${scheme.maxTenureYears} Years Repayment`}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectSchemeForCalculator(scheme)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  {isHindi ? 'किस्त देखें' : 'Model EMI'}
                </button>

                <button
                  onClick={onStartWizard}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition flex items-center space-x-1"
                >
                  <span>{isHindi ? 'पात्रता जांचें' : 'Check Fit'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>



      {/* ========================================================================= */}
      {/* 6. WHY SAHAYAK WINS OVER GENERIC PORTALS (PRD §2 DIFFERENTIATION) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            PRD §2 Benchmarking
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
            {t.comparisonHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t.comparisonSub}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="p-4 sm:p-5">Capability / Axis</th>
                  <th className="p-4 sm:p-5 text-slate-400">myScheme.gov.in</th>
                  <th className="p-4 sm:p-5 text-slate-400">Jan Samarth</th>
                  <th className="p-4 sm:p-5 bg-orange-600 text-white">SAHAYAK (This Platform)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">Scheme Matching</td>
                  <td className="p-4">Keyword/Tag filter</td>
                  <td className="p-4">Loan category filter</td>
                  <td className="p-4 bg-orange-50/40 font-bold text-orange-950">
                    Deterministic % match with weighted purpose & headroom scoring
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">Ineligibility Explanation</td>
                  <td className="p-4 text-rose-500 font-bold">✗ Hidden completely</td>
                  <td className="p-4 text-amber-600 font-semibold">Partial generic note</td>
                  <td className="p-4 bg-orange-50/40 font-bold text-emerald-700">
                    ✓ Full Gap-to-Eligibility report with numerical remediation advice
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">Financial Modeling</td>
                  <td className="p-4 text-rose-500 font-bold">✗ None</td>
                  <td className="p-4">Basic EMI only</td>
                  <td className="p-4 bg-orange-50/40 font-bold text-orange-950">
                    Moratorium-aware amortization, slab interest & capital subsidy
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">Channel Partner Routing</td>
                  <td className="p-4">Static agency directory</td>
                  <td className="p-4">Unranked bank list</td>
                  <td className="p-4 bg-orange-50/40 font-bold text-emerald-700">
                    ✓ Load-balanced ranking (quota availability, TAT & proximity)
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">Low-Literacy Inclusion</td>
                  <td className="p-4 text-rose-500 font-bold">✗ Text-only</td>
                  <td className="p-4 text-rose-500 font-bold">✗ Text-only</td>
                  <td className="p-4 bg-orange-50/40 font-bold text-orange-950">
                    Bilingual Voice Assistant (Web Speech API) & icon-first flow
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-900">Data Privacy Standard</td>
                  <td className="p-4">Standard cookie banner</td>
                  <td className="p-4">Standard privacy policy</td>
                  <td className="p-4 bg-orange-50/40 font-bold text-emerald-700">
                    ✓ DPDP Act 2023 enforced with zero-persistence memory audit
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DUAL ACTION: MINISTRY DASHBOARD & CITIZEN PASS */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Ministry Persona Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-7 flex flex-col justify-between space-y-5 border border-slate-800 shadow-md">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-400">
              <BarChart3 className="w-4 h-4" />
              <span>{isHindi ? 'मंत्रालय प्रशासन दृश्य' : 'Ministry Executive Portal'}</span>
            </div>
            <h3 className="text-xl font-bold font-sans">
              {isHindi ? 'समता एवं समावेशन लाइव डैशबोर्ड' : 'Equity & Inclusion Analytics Dashboard'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isHindi 
                ? 'अनुसूचित जाति, पिछड़ा वर्ग, सफाई कर्मचारियों और महिला उद्यमियों तक फंड वितरण, रूपांतरण फनल और जिला स्तरीय क्षमता का संपूर्ण दृश्य।'
                : 'Monitor beneficiary outreach across SC, OBC, Safai Karamcharis, and women entrepreneurs. Track district-level fund quota exhaustion and processing TAT.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('admin')}
            className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center justify-between w-full sm:w-auto self-start cursor-pointer"
          >
            <span>{isHindi ? 'मंत्रालय डैशबोर्ड खोलें' : 'Open Ministry Dashboard'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </button>
        </div>

        {/* Citizen Verification Card */}
        <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-3xl p-7 flex flex-col justify-between space-y-5 shadow-md">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
              <span>{isHindi ? 'नागरिक सत्यापन पर्ची' : 'Verified Routing Pass'}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 font-sans">
              {isHindi ? 'दस्तावेज़ चेकलिस्ट एवं संदर्भ टोकन' : 'Document Checklist & Cryptographic Pass'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isHindi
                ? 'योजना-विशिष्ट आवश्यक दस्तावेज़ों की सूची और चैनल पार्टनर कार्यालय के लिए आधिकारिक डिजिटल संदर्भ पास (SHK-XXXXXX) प्राप्त करें।'
                : 'Zero desk rejections: Generate scheme-configured document checklists and a cryptographic routing pass for immediate intake at the designated SCA desk.'}
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('checklist')}
            className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-between w-full sm:w-auto self-start cursor-pointer"
          >
            <span>{isHindi ? 'चेकलिस्ट एवं पर्ची देखें' : 'View Checklist & Pass'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </button>
        </div>

      </section>

    </div>
  );
};
