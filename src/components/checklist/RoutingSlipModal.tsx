import React from 'react';
import { X, QrCode, Printer } from 'lucide-react';
import { CitizenSlip } from './CitizenSlip';
import { CitizenProfile } from '../../types/user';
import { Scheme } from '../../types/scheme';
import { RankedPartner } from '../../types/partner';
import { Language } from '../../services/i18nService';
import { AuthUser } from '../../types/auth';

interface RoutingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CitizenProfile;
  scheme: Scheme | null;
  partner: RankedPartner | null;
  language: Language;
  authUser?: AuthUser | null;
}

export const RoutingSlipModal: React.FC<RoutingSlipModalProps> = ({
  isOpen,
  onClose,
  profile,
  scheme,
  partner,
  language,
  authUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 max-w-5xl w-full my-8 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 no-print">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-black text-white">
                {language === 'hi' ? 'नागरिक रूटिंग पास (QR कोड)' : 'Official Citizen Routing Pass (QR Code)'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Ministry of Social Justice & Empowerment (MoSJE)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin">
          <CitizenSlip
            profile={profile}
            scheme={scheme}
            partner={partner}
            language={language}
            authUser={authUser}
          />
        </div>
      </div>
    </div>
  );
};
