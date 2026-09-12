import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Sparkles, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  Globe,
  Mic,
  Award,
  PhoneCall,
  Landmark
} from 'lucide-react';
import { WidgetConfig, Language } from '../../data/languages';
import { ChatMessage } from '../../services/chatbotService';

interface EmbedSiteSimulatorProps {
  onClose: () => void;
  config: WidgetConfig;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isListening: boolean;
  transcript: string;
  onStartListening: (callback?: (text: string) => void) => void;
  onStopListening: () => void;
  onSpeakMessage: (id: string, text: string) => void;
  onStopSpeaking: () => void;
  isSpeaking: boolean;
  speakingMessageId: string | null;
}

export const EmbedSiteSimulator: React.FC<EmbedSiteSimulatorProps> = ({
  onClose,
  config,
  currentLanguage,
  onSelectLanguage,
  messages,
  onSendMessage,
  isLoading,
  isListening,
  transcript,
  onStartListening,
  onStopListening,
  onSpeakMessage,
  onStopSpeaking,
  isSpeaking,
  speakingMessageId,
}) => {
  const [activePortalType, setActivePortalType] = useState<'state-welfare' | 'collectorate' | 'bank'>('state-welfare');
  const [isWidgetOpen, setIsWidgetOpen] = useState(true);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-200">
      {/* Simulator Control Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
            <span>External Government Portal Embed Simulator</span>
          </div>
          <span className="text-slate-400 text-xs hidden md:inline">
            Previewing how SAHAYAK AI floats and operates when embedded on any State or Bank portal
          </span>
        </div>

        {/* Portal template switcher */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-slate-950 rounded-xl p-1 text-xs border border-slate-800">
            <button
              onClick={() => setActivePortalType('state-welfare')}
              className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                activePortalType === 'state-welfare' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              State Welfare Dept
            </button>
            <button
              onClick={() => setActivePortalType('collectorate')}
              className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                activePortalType === 'collectorate' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              District Collectorate
            </button>
            <button
              onClick={() => setActivePortalType('bank')}
              className={`px-3 py-1 rounded-lg transition-colors font-semibold ${
                activePortalType === 'bank' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lead Bank Portal
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white transition-colors shadow-xs"
          >
            <span>Exit Simulator</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulated Browser Viewport */}
      <div className="flex-1 overflow-y-auto bg-slate-100 text-slate-800 relative">
        {/* Mock Official Portal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {activePortalType === 'state-welfare' ? '🏛️' : activePortalType === 'collectorate' ? '🇮🇳' : '🏦'}
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base leading-tight block">
                {activePortalType === 'state-welfare' && 'Department of Social Justice & Empowerment'}
                {activePortalType === 'collectorate' && 'Office of the District Magistrate & Collector'}
                {activePortalType === 'bank' && 'State Level Bankers\' Committee (SLBC)'}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {activePortalType === 'state-welfare' && 'Government of Madhya Pradesh • Integrated Welfare Services'}
                {activePortalType === 'collectorate' && 'District Administration, Indore • Citizen Services Desk'}
                {activePortalType === 'bank' && 'Concessional Credit Channel Partner Network (Lead Bank)'}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <span className="hover:text-orange-600 cursor-pointer">Welfare Schemes</span>
            <span className="hover:text-orange-600 cursor-pointer">SCA Offices</span>
            <span className="hover:text-orange-600 cursor-pointer">Loan Subsidies</span>
            <span className="hover:text-orange-600 cursor-pointer">Helpline</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              ● Official Portal
            </span>
          </div>
        </div>

        {/* Mock Hero Section */}
        <div className="max-w-5xl mx-auto px-6 py-12 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Integrated MoSJE Concessional Credit Facilitation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-snug">
            {activePortalType === 'state-welfare' && 'Empowering Marginalized Communities with Direct Concessional Loans'}
            {activePortalType === 'collectorate' && 'District One-Stop Welfare & Financial Rehabilitation Desk'}
            {activePortalType === 'bank' && 'Priority Sector Concessional Lending & Capital Subsidy Linkage'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {activePortalType === 'state-welfare' && 'Beneficiaries from SC, OBC, and Safai Karamchari communities can now consult the SAHAYAK AI chatbot directly in the bottom-right corner for instant scheme matching, document checklists, and EMI modeling.'}
            {activePortalType === 'collectorate' && 'Access certified welfare schemes without queues. Speak with SAHAYAK AI in Hindi, Marathi, or English to verify your eligibility and find designated SCA branches.'}
            {activePortalType === 'bank' && 'Explore subsidized 4% - 6% p.a. interest rates with setup moratorium grace periods up to 6 months. Live loan modeling powered by SAHAYAK AI.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button 
              onClick={() => setIsWidgetOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-orange-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Launch SAHAYAK AI Assistant (Live)</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold px-3 py-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>National Toll-Free: 1800-11-2001</span>
            </div>
          </div>
        </div>

        {/* Mock Feature Highlights */}
        <div className="max-w-5xl mx-auto px-6 pb-28 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">4% Concessional Credit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Subsidized credit rates via NSFDC, NBCFDC, and NSKFDC, saving over 50% interest compared to commercial banks.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">DigiLocker Verified</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instant digital verification of Aadhaar, caste, and income certificates eliminating physical documentation queues.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">12+ Indian Languages</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Native voice recognition and audio playback in Hindi, Marathi, Bengali, Telugu, Gujarati, and English.
            </p>
          </div>
        </div>

        {/* Floating Simulated SAHAYAK Trigger / Frame Container */}
        {isWidgetOpen ? (
          <div className="fixed bottom-6 right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[580px] max-h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Widget Mini Header */}
            <div 
              style={{ backgroundColor: config.primaryColor }}
              className="px-4 py-3.5 text-white flex items-center justify-between shadow-xs flex-shrink-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm tracking-tight truncate">{config.title}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-white/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Online • MoSJE Grounded AI</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsWidgetOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                  title="Minimize"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Widget Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70 text-xs">
              {messages.length === 0 ? (
                <div className="text-center py-6 px-2 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 text-sm">
                      Namaste! How may I assist you?
                    </p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      I am your official MoSJE welfare companion. Ask me anything about loans, eligibility, or local partner offices.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 text-left">
                    <button
                      onClick={() => onSendMessage('What concessional loan schemes are available for OBC applicants?')}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-400 text-slate-700 transition flex items-center justify-between text-xs font-medium"
                    >
                      <span>OBC Concessional Schemes</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
                    </button>
                    <button
                      onClick={() => onSendMessage('What documents are required for loan approval?')}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-400 text-slate-700 transition flex items-center justify-between text-xs font-medium"
                    >
                      <span>Mandatory Documents Checklist</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isBot = msg.sender === 'bot';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      {isBot && (
                        <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                          isBot
                            ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                            : 'bg-orange-600 text-white rounded-br-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })
              )}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Widget Input Form */}
            <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem('simMsg') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    onSendMessage(input.value.trim());
                    input.value = '';
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  name="simMsg"
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ backgroundColor: config.primaryColor }}
                  className="px-3 py-2 rounded-xl text-white font-bold text-xs disabled:opacity-40 transition-opacity"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsWidgetOpen(true)}
            style={{ backgroundColor: config.primaryColor }}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-40"
            aria-label="Open AI Chat Widget"
          >
            <Bot className="w-7 h-7" />
          </button>
        )}
      </div>
    </div>
  );
};
