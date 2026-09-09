import React from 'react';
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
  MapPin
} from 'lucide-react';
import { CitizenProfile } from '../../types/user';
import { Scheme } from '../../types/scheme';
import { RankedPartner } from '../../types/partner';
import { Language } from '../../services/i18nService';

interface CitizenSlipProps {
  profile: CitizenProfile;
  scheme: Scheme | null;
  partner: RankedPartner | null;
  language: Language;
}

export const CitizenSlip: React.FC<CitizenSlipProps> = ({
  profile,
  scheme,
  partner,
  language
}) => {
  const isHindi = language === 'hi';

  const slipRefId = `SHK-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Top Controls (Hidden during print) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 no-print">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
            {isHindi ? 'नागरिक आवेदन एवं रूटिंग पर्ची (Citizen Slip)' : 'Official SAHAYAK Citizen Routing Slip'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isHindi 
              ? 'यह पर्ची अपने निकटतम निगम/बैंक कार्यालय ले जाएं और आवश्यक दस्तावेज़ साथ रखें' 
              : 'Print or save this routing pass to present at your designated channel partner office'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>{isHindi ? 'पर्ची प्रिंट / डाउनलोड करें' : 'Print / Download Slip'}</span>
        </button>
      </div>

      {/* Official Printable Citizen Slip Document */}
      <div 
        id="printable-slip"
        className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-slate-300 shadow-xl space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Slip Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-900 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-serif text-2xl font-bold border-2 border-orange-500">
              स
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                SAHAYAK CITIZEN ROUTING PASS
              </h3>
              <p className="text-xs font-semibold text-slate-600">
                Ministry of Social Justice & Empowerment (MoSJE) · Government of India
              </p>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Official Government Verified Citizen Pass
              </span>
            </div>
          </div>

          {/* QR & Ref Details */}
          <div className="flex items-center space-x-3 self-end sm:self-center text-right">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Slip Reference ID
              </span>
              <span className="font-mono text-sm font-black text-slate-900 block">
                {slipRefId}
              </span>
              <span className="text-[10px] text-slate-500 block">
                Date: {currentDate}
              </span>
            </div>
            <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-center text-slate-800 p-1">
              <QrCode className="w-full h-full text-slate-900" />
            </div>
          </div>
        </div>

        {/* Section 1: Beneficiary Profile */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-orange-500" />
            <span>1. Beneficiary Demographics</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
              <span className="font-extrabold text-slate-900">{profile.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender & Age</span>
              <span className="font-extrabold text-slate-900">
                {profile.gender === 'OTHER' || profile.gender === 'TRANSGENDER' ? 'Others' : profile.gender}, {profile.age} Yrs
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Family Income</span>
              <span className="font-extrabold text-slate-900">₹{(profile.annualFamilyIncome / 100000).toFixed(2)} Lakh</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">District / State</span>
              <span className="font-extrabold text-slate-900">{profile.district}, {profile.state}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Matched MoSJE Scheme */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>2. Recommended MoSJE Scheme</span>
          </h4>
          {scheme ? (
            <div className="p-5 rounded-2xl border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {scheme.agency} · {scheme.code}
                  </span>
                  <h5 className="text-base font-bold text-slate-900 mt-1">
                    {scheme.name}
                  </h5>
                  <p className="text-xs text-slate-500">{scheme.tagline}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Max Loan Band</span>
                  <span className="text-base font-black text-orange-600">
                    ₹{(scheme.maxLoanAmount / 100000).toFixed(2)} Lakh
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <div>Tenure: <strong>Up to {scheme.maxTenureYears} Years</strong></div>
                <div>Moratorium: <strong>{scheme.moratoriumMonths} Months Grace</strong></div>
                <div>Subsidy: <strong>{scheme.maxSubsidyAmount ? `Up to ₹${(scheme.maxSubsidyAmount / 1000).toFixed(0)}k` : 'None'}</strong></div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 italic">
              No specific scheme pre-selected. General MoSJE Credit Channel pass.
            </div>
          )}
        </div>

        {/* Section 3: Designated Channel Partner (Where to Walk In) */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Designated Channel Partner / Office to Walk Into</span>
          </h4>
          {partner ? (
            <div className="p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Rank #1 Preferred Nodal Partner
                  </span>
                  <h5 className="text-base font-bold text-slate-900 mt-1">
                    {partner.name}
                  </h5>
                  <p className="text-xs text-slate-600">{partner.address}, PIN {partner.pinCode}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    {partner.distanceKm} km away
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Nodal Officer</span>
                  <strong className="text-slate-800">{partner.contactPerson}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Direct Helpline</span>
                  <strong className="text-emerald-700">{partner.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Working Hours</span>
                  <strong className="text-slate-800">{partner.workingHours}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 italic">
              Please choose a partner on the Channel Partners tab to route to a specific office.
            </div>
          )}
        </div>

        {/* Section 4: Mandatory Document Checklist */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
            <span>4. Required Document Checklist for Submission</span>
          </h4>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {(scheme?.requiredDocuments || [
                'Aadhaar Card / Voter ID Card',
                'Community Caste Certificate (SC/OBC/Safai Karamchari)',
                'Income Certificate issued by Competent Authority (SDM/Tehsildar)',
                'Detailed Project Report (DPR) / Machinery Quotation',
                'Bank Passbook (Aadhaar linked)'
              ]).map((doc, i) => (
                <div key={i} className="flex items-center space-x-2 py-1">
                  <div className="w-4 h-4 rounded border border-slate-400 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-slate-700">✓</span>
                  </div>
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slip Footer Statutory Attestation */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Official MoSJE SIH26092 Prototype Platform · SAHAYAK Decision Support</span>
          <span>Verified Government Citizen Application Routing</span>
        </div>

      </div>

    </div>
  );
};
