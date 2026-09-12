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
        <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
          {t.partnersTitle}
        </h2>
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
        <div className="relative w-full min-h-[16rem] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-between p-5">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Top Bar inside Map */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/90 text-orange-400 text-xs font-bold border border-slate-700 shadow-md">
              <Navigation className="w-3.5 h-3.5 animate-pulse text-orange-400" />
              <span>{activeDistrict} Sector Hub Map: {filteredPartners.length} {isHindi ? 'कार्यालय सक्रिय' : 'Offices Active'}</span>
            </div>
            
            {/* Direct Google Maps link for the whole district */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeDistrict + ' State Channelizing Agency MoSJE Apex Banks')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white text-[11px] font-bold border border-blue-500 shadow-sm transition hover:scale-105"
              title={isHindi ? "गूगल मैप्स में सभी कार्यालय देखें" : "View all offices on Google Maps"}
            >
              <MapPin className="w-3 h-3" />
              <span>{isHindi ? 'गूगल मैप्स में खोलें' : 'Open in Google Maps'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Center Info */}
          <div className="text-center z-10 space-y-1.5 my-3">
            <p className="text-[12px] text-slate-300 max-w-lg font-medium">
              {isHindi 
                ? '📍 निकटतम राज्य चैनललाइजिंग एजेंसी (SCA) व बैंक शाखाओं पर क्लिक करके गूगल मैप्स पर सीधा नेविगेशन (turn-by-turn directions) प्राप्त करें।' 
                : '📍 Click any office pin or partner card below to launch live turn-by-turn Google Maps driving navigation.'}
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              ● {isHindi ? 'लाइव जीपीएस निर्देशांक एवं दिशा-निर्देश उपलब्ध' : 'Live GPS Geolocation Coordinates & Driving Directions Active'}
            </span>
          </div>

          {/* Interactive Dynamic Coordinate Pins based on top partners */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 z-10 pt-2">
            {filteredPartners.slice(0, 3).map((partner) => (
              <a
                key={partner.id}
                href={`https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white text-xs transition group shadow-sm hover:border-blue-400"
                title={`${partner.name} - Open directions in Google Maps`}
              >
                <div className="flex items-center space-x-2 truncate mr-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${partner.rank === 1 ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`}></span>
                  <div className="truncate text-left">
                    <span className="font-bold text-[11px] block truncate group-hover:text-blue-300 transition">
                      #{partner.rank} {partner.type === 'SCA' ? 'SCA Nodal' : partner.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      {partner.distanceKm} km · {partner.lat.toFixed(2)}°N, {partner.lng.toFixed(2)}°E
                    </span>
                  </div>
                </div>
                <div className="p-1 rounded bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition shrink-0">
                  <Navigation className="w-3 h-3" />
                </div>
              </a>
            ))}
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
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                    {partner.type === 'SCA' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Apex Nodal SCA
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {isHindi ? partner.hindiName : partner.name}
                  </h3>
                  
                  {/* Clickable address with Google Maps directions link */}
                  <div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center space-x-1.5 transition group pt-0.5"
                      title={isHindi ? "गूगल मैप्स पर रास्ता देखें" : "Get directions on Google Maps"}
                    >
                      <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 group-hover:scale-110 transition" />
                      <span className="font-medium text-slate-700 group-hover:text-blue-700">
                        {partner.address}, PIN {partner.pinCode}
                      </span>
                      <ExternalLink className="w-3 h-3 text-blue-500 shrink-0 opacity-70 group-hover:opacity-100" />
                    </a>
                  </div>
                </div>

                {/* Actions: Navigation & Select Button */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Google Maps Directions Navigation Button */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 shadow-xs hover:border-blue-300"
                    title={isHindi ? "गूगल मैप्स में दिशा-निर्देश व नेविगेशन खोलें" : "Open Google Maps turn-by-turn directions"}
                  >
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span>{isHindi ? 'दिशा-निर्देश (Maps)' : 'Directions (Maps)'}</span>
                    <ExternalLink className="w-3 h-3 text-blue-400" />
                  </a>

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

              </div>

              {/* Reliability & Load Balancing Signal */}
              <div className="mt-4">
                <ReliabilityBadge partner={partner} language={language} />
              </div>

              {/* Contact, Nodal Officer Details & GPS Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                    <Building2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.nodalOfficer}</span>
                    <span className="font-semibold text-slate-800 block truncate">{partner.contactPerson}</span>
                    <span className="text-[10px] text-slate-500 block truncate">({partner.designation})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Direct Phone</span>
                    <a href={`tel:${partner.phone}`} className="font-semibold text-emerald-700 hover:underline">
                      {partner.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Working Hours</span>
                    <span className="font-semibold text-slate-700">{partner.workingHours}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <Navigation className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      {isHindi ? 'GPS एवं नेविगेशन' : 'GPS & Navigation'}
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 hover:underline text-[11px]"
                      title="Open turn-by-turn driving directions in Google Maps"
                    >
                      <span>{partner.lat.toFixed(4)}°N, {partner.lng.toFixed(4)}°E</span>
                      <ExternalLink className="w-3 h-3 text-blue-500" />
                    </a>
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
