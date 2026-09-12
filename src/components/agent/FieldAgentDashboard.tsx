import React, { useState } from 'react';
import { 
  Users, 
  PlusCircle, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Wifi, 
  UserCheck, 
  IndianRupee, 
  Sparkles,
  ArrowRight,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { AuthUser } from '../../types/auth';
import { CitizenProfile } from '../../types/user';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface FieldAgentDashboardProps {
  authUser: AuthUser;
  language: Language;
  onStartAssistedApplication: (initialProfile?: Partial<CitizenProfile>) => void;
}

interface AssistedRecord {
  id: string;
  beneficiaryName: string;
  category: string;
  relation: string;
  matchedScheme: string;
  loanAmount: number;
  status: 'MATCHED' | 'DOCUMENT_PENDING' | 'SUBMITTED';
  submittedAt: string;
  agentId: string;
  syncStatus: 'SYNCED' | 'LOCAL_CACHED';
}

export const FieldAgentDashboard: React.FC<FieldAgentDashboardProps> = ({
  authUser,
  language,
  onStartAssistedApplication,
}) => {
  const isHindi = language === 'hi';
  const agentId = authUser.agentId || 'CSC-MP-IND-042';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Realistic mock data of assisted submissions at this CSC center
  const [records, setRecords] = useState<AssistedRecord[]>([
    {
      id: 'APP-CSC-9041',
      beneficiaryName: 'Rameshwar Ahirwar',
      category: 'SC',
      relation: 'Applicant in-person',
      matchedScheme: 'NSFDC Term Loan (Small Business)',
      loanAmount: 250000,
      status: 'MATCHED',
      submittedAt: 'Today, 11:20 AM',
      agentId: agentId,
      syncStatus: 'SYNCED'
    },
    {
      id: 'APP-CSC-9038',
      beneficiaryName: 'Sunita Devi Vishwakarma',
      category: 'OBC',
      relation: 'Daughter (Assisted proxy)',
      matchedScheme: 'NBCFDC Mahila Samriddhi Yojana',
      loanAmount: 140000,
      status: 'SUBMITTED',
      submittedAt: 'Today, 10:05 AM',
      agentId: agentId,
      syncStatus: 'SYNCED'
    },
    {
      id: 'APP-CSC-9029',
      beneficiaryName: 'Kallu Ram Valmiki',
      category: 'SAFAI_KARAMCHARI',
      relation: 'Self',
      matchedScheme: 'NSKFDC Sanitation Mechanization',
      loanAmount: 480000,
      status: 'MATCHED',
      submittedAt: 'Yesterday, 04:30 PM',
      agentId: agentId,
      syncStatus: 'SYNCED'
    },
    {
      id: 'APP-CSC-9014',
      beneficiaryName: 'Meena Malviya',
      category: 'SC',
      relation: 'Husband (Assisted proxy)',
      matchedScheme: 'NSFDC Mahila Samriddhi (Tailoring)',
      loanAmount: 80000,
      status: 'DOCUMENT_PENDING',
      submittedAt: 'Yesterday, 02:15 PM',
      agentId: agentId,
      syncStatus: 'SYNCED'
    }
  ]);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.matchedScheme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || r.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* CSC Center & Operator Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>CSC VLE Center Live</span>
            </span>
            <span className="text-xs font-mono text-indigo-300">MoSJE Authorized Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isHindi ? 'फील्ड एजेंट एवं सीएससी ऑपरेटर डैशबोर्ड' : 'CSC Field Operator Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {isHindi 
              ? `ऑपरेटर आईडी: ${agentId} | ग्राम पंचायत: सांवरिया खेड़ा, जिला: इंदौर (म.प्र.)। डिजिटल रूप से अक्षम लाभार्थियों हेतु सहायक आवेदन सत्र।` 
              : `VLE ID: ${agentId} | Center: Sanwer Ward 4, Indore (M.P.). Empowering digitally marginalized citizens through verified assisted onboarding.`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => onStartAssistedApplication()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHindi ? '+ नया सहायक आवेदन शुरू करें' : '+ Start Assisted Application'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHindi ? 'आज के आवेदन' : 'Assisted Today'}
            </span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">4 <span className="text-xs font-semibold text-emerald-600">+100% target</span></div>
          <span className="text-[11px] text-slate-400 mt-1 block">All with DPDP consent</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHindi ? 'सफल योजना मिलान' : 'Match Rate'}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">100%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Zero rejection at intake</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHindi ? 'कुल स्वीकृत सहायता' : 'Credit Facilitated'}
            </span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹9.50 L</div>
          <span className="text-[11px] text-slate-400 mt-1 block">NSFDC & NBCFDC schemes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {isHindi ? 'ऑडिट ट्रेल टैग' : 'Audit Security'}
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm font-mono font-bold text-slate-800 truncate">VLE-8842-MP</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">✓ Cryptographically signed</span>
        </div>
      </div>

      {/* Assisted Entries Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {isHindi ? 'केंद्र से पंजीकृत लाभार्थी सूची' : 'Assisted Beneficiary Submissions'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi ? 'सभी आवेदनों में फील्ड एजेंट पहचान और डिजिटल सहमति स्वतः दर्ज है' : 'All applications carry verified operator token and DPDP section 7(g) audit trail'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? 'नाम या आवेदन क्रमांक खोजें...' : 'Search by name or ID...'}
                className="pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-3 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="ALL">{isHindi ? 'सभी वर्ग' : 'All Categories'}</option>
              <option value="SC">SC (NSFDC)</option>
              <option value="OBC">OBC (NBCFDC)</option>
              <option value="SAFAI_KARAMCHARI">Safai Karamchari</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assisted Scheme Matched</th>
                <th className="py-3 px-4">Loan Amount</th>
                <th className="py-3 px-4">Operator Audit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{rec.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{rec.beneficiaryName}</div>
                    <span className="text-[10px] text-slate-500">{rec.relation}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700">
                      {rec.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-900">{rec.matchedScheme}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">₹{(rec.loanAmount / 100000).toFixed(2)} L</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{rec.agentId}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {rec.status === 'MATCHED' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ✓ Matched
                      </span>
                    )}
                    {rec.status === 'SUBMITTED' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        ✓ In Review
                      </span>
                    )}
                    {rec.status === 'DOCUMENT_PENDING' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        ⏳ Doc Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Printing official MoSJE receipt for ${rec.beneficiaryName} (${rec.id}) with QR verification.`)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition inline-flex items-center space-x-1"
                    >
                      <Printer className="w-3 h-3 text-slate-500" />
                      <span>{isHindi ? 'रसीद' : 'Print'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredRecords.length} assisted applications</span>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>CSC Cloud Sync: Up to date</span>
          </div>
        </div>

      </div>

    </div>
  );
};
