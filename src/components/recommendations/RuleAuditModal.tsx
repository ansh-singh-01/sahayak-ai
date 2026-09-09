import React from 'react';
import { X, CheckCircle, XCircle, ShieldCheck, Scale, Cpu } from 'lucide-react';
import { SchemeRecommendation } from '../../types/recommendation';
import { Language } from '../../services/i18nService';

interface RuleAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: SchemeRecommendation | null;
  language: Language;
}

export const RuleAuditModal: React.FC<RuleAuditModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  language
}) => {
  if (!isOpen || !recommendation) return null;

  const isHindi = language === 'hi';
  const scheme = recommendation.scheme;

  const allEvaluated = [
    ...recommendation.passedRules,
    ...recommendation.failedRules
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Cpu className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {isHindi ? 'नियम ऑडिट ट्रेस एवं पारदर्शिता लॉग' : 'Deterministic Rule Audit Trace'}
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  100% Auditable
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {scheme.code} · {scheme.agency} · {scheme.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Disclaimer */}
        <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
          <Scale className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <span>
            {isHindi
              ? 'यह निर्णय विशुद्ध रूप से सामाजिक न्याय मंत्रालय (MoSJE) की वैधानिक शर्तों पर आधारित है। इसमें किसी भी एआई द्वारा अनुमान या संख्यात्मक संशोधन नहीं किया गया है।'
              : 'This decision trace proves deterministic rule execution against official MoSJE guidelines. The AI layer is strictly prohibited from altering eligibility logic.'}
          </span>
        </div>

        {/* Rules Table */}
        <div className="max-h-[50vh] overflow-y-auto pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 uppercase text-[10px] font-bold">
                <th className="p-2.5 rounded-l-lg">Rule ID & Criteria</th>
                <th className="p-2.5">Required Condition</th>
                <th className="p-2.5">Citizen Profile</th>
                <th className="p-2.5 text-right rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allEvaluated.map((r) => (
                <tr key={r.ruleId} className="hover:bg-slate-50/80 transition">
                  <td className="p-2.5 font-medium text-slate-800">
                    <div className="font-mono text-[10px] text-slate-500">{r.ruleId}</div>
                    <div className="text-[11px] text-slate-700">{r.explanation}</div>
                  </td>
                  <td className="p-2.5 text-slate-600 font-mono text-[11px]">
                    {Array.isArray(r.requiredValue) ? r.requiredValue.join(', ') : String(r.requiredValue)}
                  </td>
                  <td className="p-2.5 text-slate-700 font-semibold font-mono text-[11px]">
                    {String(r.userValue)}
                  </td>
                  <td className="p-2.5 text-right">
                    {r.passed ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>PASSED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>FAILED</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="text-slate-400 text-[11px]">
            Overall Match: <strong className="text-slate-800">{recommendation.matchScore}%</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition"
          >
            {isHindi ? 'बंद करें' : 'Close Trace'}
          </button>
        </div>

      </div>
    </div>
  );
};
