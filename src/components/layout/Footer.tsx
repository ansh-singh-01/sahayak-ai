import React from 'react';
import { PhoneCall, ExternalLink, Scale } from 'lucide-react';
import { Language } from '../../services/i18nService';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20 no-print">
      {/* Top Banner Notice */}
      <div className="bg-slate-950/80 border-b border-slate-800 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center text-center md:text-left">
          <div className="flex items-center space-x-2 text-slate-300">
            <Scale className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              <strong>Official MoSJE Data Note:</strong> All scheme parameters, interest slabs, and eligibility ceilings are illustrative demo figures modeled on authentic NSFDC, NBCFDC, and NSKFDC public guidelines. Beneficiaries must confirm active guidelines with their local State Channelizing Agency (SCA) upon submission.
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: MoSJE Corporations */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase text-[11px]">
              Apex Corporations
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <a href="https://nsfdc.nic.in" target="_blank" rel="noreferrer" className="hover:text-orange-400 transition flex items-center space-x-1">
                  <span>NSFDC (Scheduled Castes)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://nbcfdc.gov.in" target="_blank" rel="noreferrer" className="hover:text-orange-400 transition flex items-center space-x-1">
                  <span>NBCFDC (Backward Classes)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://nskfdc.nic.in" target="_blank" rel="noreferrer" className="hover:text-orange-400 transition flex items-center space-x-1">
                  <span>NSKFDC (Safai Karamcharis)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://socialjustice.gov.in" target="_blank" rel="noreferrer" className="hover:text-orange-400 transition flex items-center space-x-1">
                  <span>Ministry of Social Justice & Empowerment</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: National Citizen Helplines */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase text-[11px]">
              Citizen Helplines
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
                <span>MoSJE Welfare Toll-Free: <strong>1800-11-2001</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
                <span>Elder Line (Senior Citizens): <strong>14567</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
                <span>Transgender National Helpline: <strong>8882133897</strong></span>
              </div>
            </div>
          </div>

          {/* Col 3: Statutory Privacy & DPDP */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase text-[11px]">
              Privacy & Safeguards
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              SAHAYAK operates on strict data minimization principles under India's Digital Personal Data Protection (DPDP) Act, 2023. Demographic category and family income inputs are evaluated in-session on client-side memory and never retained or traded.
            </p>
          </div>

          {/* Col 4: Hackathon Attribution */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wide uppercase text-[11px]">
              Smart India Hackathon 2024
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Developed for <strong>SIH Problem Statement SIH26092</strong>.<br />
              Theme: Smart Automation & Citizen Inclusion.<br />
              Target Beneficiaries: SC, OBC, Safai Karamcharis, Women Entrepreneurs, and Divyangjan.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs gap-4">
          <p>© {new Date().getFullYear()} SAHAYAK — Government Decision-Support & Channel Partner Routing Platform.</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Deterministic Engine v2.4</span>
            <span>•</span>
            <span className="text-slate-400">Zero Hallucination Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
