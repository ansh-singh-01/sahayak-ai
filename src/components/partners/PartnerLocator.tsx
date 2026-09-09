import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Building2, 
  CheckCircle2, 
  Navigation, 
  Filter, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ChannelPartner, RankedPartner } from '../../types/partner';
import { MinistryAgency, Scheme } from '../../types/scheme';
import { PartnerRouterService } from '../../services/partnerRouter';
import { ReliabilityBadge } from './ReliabilityBadge';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface PartnerLocatorProps {
  userDistrict: string;
  selectedScheme: Scheme | null;
  selectedPartner: RankedPartner | null;
  onSelectPartner: (partner: RankedPartner) => void;
  language: Language;
}

export const PartnerLocator: React.FC<PartnerLocatorProps> = ({
  userDistrict,
  selectedScheme,
  selectedPartner,
  onSelectPartner,
  language
}) => {
  const t = TRANSLATIONS[language];
  const isHindi = language === 'hi';

  const [activeDistrict, setActiveDistrict] = useState<string>(userDistrict || 'Indore');
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>('ALL');

  // Compute ranked partners
  const rankedPartners = useMemo(() => {
    const agency = selectedScheme ? selectedScheme.agency : undefined;
    return PartnerRouterService.rankPartners(
      22.7196, // default to Indore coordinates
      75.8577,
      agency,
      activeDistrict
    );
  }, [activeDistrict, selectedScheme]);

  const filteredPartners = useMemo(() => {
    if (partnerTypeFilter === 'ALL') return rankedPartners;
    return rankedPartners.filter(p => p.type === partnerTypeFilter);
  }, [rankedPartners, partnerTypeFilter]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
            PRD §21-24 Novelty Feature
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
            {t.partnersTitle}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {t.partnersSubtitle}
        </p>
      </div>

      {/* Interactive Map & District Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isHindi ? 'जिला चुनें:' : 'Select District:'}
            </span>
            <select
              value={activeDistrict}
              onChange={(e) => setActiveDistrict(e.target.value)}
              className="p-2 border border-slate-300 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Indore">Indore (मध्य प्रदेश - मुख्य डेमो)</option>
              <option value="Bhopal">Bhopal (मध्य प्रदेश - राज्य मुख्यालय)</option>
              <option value="Lucknow">Lucknow (उत्तर प्रदेश)</option>
              <option value="Nagpur">Nagpur (महाराष्ट्र)</option>
              <option value="New Delhi">New Delhi (दिल्ली)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            {['ALL', 'SCA', 'PSU_BANK', 'RRB'].map((type) => (
              <button
                key={type}
                onClick={() => setPartnerTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  partnerTypeFilter === type
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {type === 'ALL' && (isHindi ? 'सभी पार्टनर' : 'All Partners')}
                {type === 'SCA' && (isHindi ? 'निगम (SCAs)' : 'SCAs (Apex)')}
                {type === 'PSU_BANK' && (isHindi ? 'सरकारी बैंक' : 'PSU Banks')}
                {type === 'RRB' && (isHindi ? 'ग्रामीण बैंक' : 'RRBs')}
              </button>
            ))}
          </div>

        </div>

        {/* Visual Simulated Map Display */}
        <div className="relative w-full h-56 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="text-center z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/90 text-orange-400 text-xs font-bold border border-slate-700">
              <Navigation className="w-3.5 h-3.5 animate-pulse" />
              <span>{activeDistrict} Sector Hub Map: {filteredPartners.length} {isHindi ? 'कार्यालय सक्रिय' : 'Offices Active'}</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-md">
              {isHindi 
                ? 'नक्शे पर निकटतम राज्य चैनललाइजिंग एजेंसी (SCA) एवं बैंक शाखाएं सक्रिय फंड उपलब्धता के आधार पर चिन्हित हैं।' 
                : 'Interactive geolocation nodes with live fund capacity load-balancing tags.'}
            </p>
          </div>

          {/* Simulated Coordinate Node Pins */}
          <div className="absolute top-6 left-12 flex items-center space-x-1 text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SCA Nodal (Rank #1)</span>
          </div>

          <div className="absolute bottom-8 right-16 flex items-center space-x-1 text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
            <span>SBI SME Center (Rank #2)</span>
          </div>

          <div className="absolute top-12 right-24 flex items-center space-x-1 text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
            <span>MP Gramin Bank (Rank #3)</span>
          </div>
        </div>

      </div>

      {/* Ranked Partner Cards List */}
      <div className="space-y-4">
        {filteredPartners.map((partner) => {
          const isSelected = selectedPartner?.id === partner.id;
          const isRankOne = partner.rank === 1;

          return (
            <div
              key={partner.id}
              className={`bg-white rounded-3xl p-6 sm:p-7 border-2 transition shadow-sm ${
                isSelected
                  ? 'border-emerald-500 ring-4 ring-emerald-100'
                  : isRankOne
                  ? 'border-orange-300 hover:border-orange-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                
                {/* Title & Rank Badge */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 text-xs font-black rounded-full ${
                      isRankOne 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      RANK #{partner.rank}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {partner.typeLabel}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {partner.distanceKm} km away
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {isHindi ? partner.hindiName : partner.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{partner.address}, PIN {partner.pinCode}</span>
                  </p>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => onSelectPartner(partner)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSelected 
                      ? (isHindi ? 'चयनित कार्यालय' : 'Selected Partner') 
                      : (isHindi ? 'रूटिंग स्लिप हेतु चुनें' : 'Select for Routing Slip')}
                  </span>
                </button>

              </div>

              {/* Reliability & Load Balancing Signal */}
              <div className="mt-4">
                <ReliabilityBadge partner={partner} language={language} />
              </div>

              {/* Contact and Nodal Officer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.nodalOfficer}</span>
                    <span className="font-semibold text-slate-800">{partner.contactPerson}</span>
                    <span className="text-[10px] text-slate-500 block">({partner.designation})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Direct Phone</span>
                    <a href={`tel:${partner.phone}`} className="font-semibold text-emerald-700 hover:underline">
                      {partner.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Working Hours</span>
                    <span className="font-semibold text-slate-700">{partner.workingHours}</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
