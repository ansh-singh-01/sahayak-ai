import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Minimize2, 
  RotateCcw, 
  ExternalLink, 
  ShieldCheck, 
  Bot, 
  User, 
  Languages, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { CitizenProfile } from '../../types/user';
import { Scheme } from '../../types/scheme';
import { RankedPartner } from '../../types/partner';
import { BeneficiaryApplicationItem } from '../../types/beneficiary';
import { Language, LanguageMeta, INDIAN_LANGUAGES, getSpeechCode } from '../../services/i18nService';
import { ChatMessage, ChatContext, ChatbotService } from '../../services/chatbotService';
import { ApiClient } from '../../services/apiClient';
import { VoiceService } from '../../services/voiceService';

interface SahayakChatbotProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  profile: CitizenProfile;
  selectedScheme: Scheme | null;
  selectedPartner: RankedPartner | null;
  activeApplication?: BeneficiaryApplicationItem | null;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onNavigateTab: (tab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth') => void;
}

export const SahayakChatbot: React.FC<SahayakChatbotProps> = ({
  isOpen,
  onOpen,
  onClose,
  profile,
  selectedScheme,
  selectedPartner,
  activeApplication,
  language,
  onSelectLanguage,
  onNavigateTab
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('sahayak_chat_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listeningTranscript, setListeningTranscript] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoReadout, setAutoReadout] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);

  const speechCode = getSpeechCode(language);
  const currentLangObj = INDIAN_LANGUAGES.find((l: LanguageMeta) => l.code === language) || INDIAN_LANGUAGES[0];

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Persist message history
  useEffect(() => {
    try {
      localStorage.setItem('sahayak_chat_history', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  // If chat is empty upon first opening, seed initial personalized greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const isHindi = language === 'hi';
      const initialGreeting: ChatMessage = {
        id: 'msg-welcome-0',
        sender: 'bot',
        text: isHindi
          ? `नमस्ते ${profile.name || 'नागरिक'}! मैं सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) का सहायक AI चैटबॉट हूँ। मैं आपको ऋण योजनाओं, ब्याज अनुदान, आवश्यक दस्तावेज़ों, और निकटतम राज्य चैनल पार्टनर की सहायता के लिए तैयार हूँ। आप मुझसे बोलकर या लिखकर प्रश्न पूछ सकते हैं।`
          : `Namaste ${profile.name || 'Citizen'}! I am Sahayak AI, your official MoSJE welfare advisor. I can answer questions regarding concessional credit schemes, eligibility, document checklists, and local channel partner offices. You can type or tap the mic to speak!`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        quickReplies: isHindi
          ? ['मेरी पात्रता बताएं', 'दस्तावेज़ चेकलिस्ट', 'ऋण ईएमआई गणना', 'पार्टनर कार्यालय खोजें', 'आवेदन स्थिति ट्रैक करें']
          : ['Check My Eligibility', 'Document Checklist', 'Calculate Loan EMI', 'Find Partner Office', 'Track Application']
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen, language, profile.name]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, isMinimized]);

  // Cleanup speech and voice on unmount or close
  useEffect(() => {
    return () => {
      VoiceService.stopSpeaking();
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
    };
  }, []);

  // Send message to AI engine
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    // Stop ongoing speech
    VoiceService.stopSpeaking();
    setSpeakingMessageId(null);

    const userTimestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: userTimestamp
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsTyping(true);

    const context: ChatContext = {
      profile,
      selectedScheme,
      selectedPartner,
      activeApplication,
      language
    };

    try {
      // Call ApiClient which hits POST /api/ai/chat with local fallback to ChatbotService
      const botReply = await ApiClient.sendChatMessage(text, newHistory, context);
      
      setMessages(prev => [...prev, botReply]);

      // If auto-readout is enabled, read response aloud
      if (autoReadout && botReply?.text) {
        speakBotMessage(botReply.id, botReply.text);
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback local response
      const fallbackReply = await ChatbotService.processMessage(text, newHistory, context);
      setMessages(prev => [...prev, fallbackReply]);
      if (autoReadout && fallbackReply?.text) {
        speakBotMessage(fallbackReply.id, fallbackReply.text);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Voice Typing (STT) Trigger
  const handleToggleVoiceTyping = () => {
    if (isListening) {
      // Stop listening
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      setIsListening(false);
      return;
    }

    VoiceService.stopSpeaking();
    setSpeakingMessageId(null);
    setListeningTranscript('');
    setIsListening(true);

    const stopFn = VoiceService.listen(
      speechCode,
      (transcript) => {
        setListeningTranscript(transcript);
        setInputMessage(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        // Automatically send voice query for a frictionless voice-first experience
        setTimeout(() => {
          handleSendMessage(transcript);
        }, 300);
      },
      (error) => {
        console.warn('Voice typing error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    stopListeningRef.current = stopFn;
  };

  // Text-To-Speech for individual message
  const speakBotMessage = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      VoiceService.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    VoiceService.stopSpeaking();
    setSpeakingMessageId(messageId);

    VoiceService.speak(text, speechCode, () => {
      setSpeakingMessageId(null);
    });
  };

  // Clear Chat History
  const handleClearHistory = () => {
    VoiceService.stopSpeaking();
    setSpeakingMessageId(null);
    setMessages([]);
    localStorage.removeItem('sahayak_chat_history');
    // Seed new greeting
    const isHindi = language === 'hi';
    const welcome: ChatMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'bot',
      text: isHindi
        ? `चैट इतिहास साफ़ कर दिया गया है। आप MoSJE योजनाओं और ऋण सहायता से संबंधित कोई भी नया प्रश्न पूछ सकते हैं।`
        : `Chat history cleared. How may I assist you with MoSJE concessional schemes and loan facilitation?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      quickReplies: isHindi
        ? ['मेरी पात्रता बताएं', 'दस्तावेज़ चेकलिस्ट', 'ईएमआई कैलकुलेटर']
        : ['Check My Eligibility', 'Document Checklist', 'Calculate Loan EMI']
    };
    setMessages([welcome]);
  };

  // If closed, render Floating Trigger Button Pill
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={onOpen}
          className="flex items-center space-x-3 bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 text-white px-5 py-3.5 rounded-full shadow-xl shadow-orange-600/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white/40"
          aria-label="Open Sahayak Multilingual AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>

          <div className="text-left leading-tight hidden sm:block">
            <div className="text-sm font-extrabold flex items-center space-x-1">
              <span>Ask Sahayak</span>
              <span className="text-orange-200">| सहायक AI</span>
            </div>
            <div className="text-[10px] text-white/80 font-medium">
              11 Indian Languages • Voice Enabled
            </div>
          </div>

          <div className="sm:hidden font-bold text-sm">
            AI Assistant
          </div>
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized 
          ? 'bottom-6 right-6 w-80' 
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] max-w-lg h-[640px] max-h-[calc(100vh-2rem)]'
      }`}
    >
      <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden backdrop-blur-xl">
        
        {/* ===================================================================== */}
        {/* HEADER                                                                */}
        {/* ===================================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-slate-700/80 relative">
          
          <div className="flex items-center space-x-3">
            {/* Tricolor-accent Bot Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-emerald-600 p-0.5 shadow-md shadow-orange-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
                  <Bot className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online & Ready" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  SAHAYAK AI <span className="text-orange-400 text-xs">सहायक</span>
                </h3>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.2 rounded font-mono font-bold">
                  MoSJE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
                <span>Statutory & Grounded Rule Engine</span>
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-1">
            
            {/* Multilingual Selector Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1 text-xs font-semibold"
                title="Switch Language"
              >
                <Languages className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px]">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl py-1 z-50 max-h-60 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    Select Language (11 Languages)
                  </div>
                  {INDIAN_LANGUAGES.map((lang: LanguageMeta) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                        language === lang.code ? 'text-orange-400 font-bold bg-slate-800/50' : 'text-slate-300'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-500">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto Readout Toggle */}
            <button
              onClick={() => {
                const next = !autoReadout;
                setAutoReadout(next);
                if (!next) VoiceService.stopSpeaking();
              }}
              className={`p-1.5 rounded-lg transition ${
                autoReadout 
                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={autoReadout ? 'Auto-Voice Readout: ON' : 'Auto-Voice Readout: OFF'}
            >
              {autoReadout ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Clear History */}
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={() => {
                VoiceService.stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-950/60 hover:text-red-400 transition"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* If minimized, show compact header bar only */}
        {!isMinimized && (
          <>
            {/* ===================================================================== */}
            {/* MESSAGES FEED                                                         */}
            {/* ===================================================================== */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin">
              
              {/* MoSJE Grounding Badge Pill */}
              <div className="flex items-center justify-center my-1">
                <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full text-[11px] font-medium shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>Grounded in MoSJE Guidelines (NSFDC, NBCFDC, NSKFDC)</span>
                </div>
              </div>

              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                const isSpeakingThis = speakingMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end space-x-2 ${
                      isBot ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isBot && (
                      <div className="w-7 h-7 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs mb-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 transition shadow-xs text-xs sm:text-sm leading-relaxed ${
                        isBot
                          ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                          : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-sm shadow-orange-600/10'
                      }`}
                    >
                      {/* Message Content */}
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Rule citation badge if available */}
                      {isBot && (msg.citedSchemeCode || msg.citedRuleId) && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          {msg.citedSchemeCode && (
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              Scheme: {msg.citedSchemeCode}
                            </span>
                          )}
                          {msg.citedRuleId && (
                            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Rule: {msg.citedRuleId}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bot Interactive Action Tab Chip (Botpress style interactive component) */}
                      {isBot && msg.actionTab && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              onNavigateTab(msg.actionTab!);
                              // On mobile, minimize chat to show target screen
                              if (window.innerWidth < 640) {
                                setIsMinimized(true);
                              }
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer group"
                          >
                            <span>{msg.actionLabel || 'Go to Section'}</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      )}

                      {/* Metadata Row: Timestamp & Speaker playback */}
                      <div className={`mt-1.5 flex items-center justify-between text-[10px] ${
                        isBot ? 'text-slate-400' : 'text-orange-200'
                      }`}>
                        <span>{msg.timestamp}</span>

                        {isBot && (
                          <button
                            onClick={() => speakBotMessage(msg.id, msg.text)}
                            className={`p-1 rounded-md transition flex items-center space-x-1 ${
                              isSpeakingThis
                                ? 'text-emerald-600 font-bold bg-emerald-50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                            title={isSpeakingThis ? 'Stop voice readout' : 'Read aloud in your language'}
                          >
                            {isSpeakingThis ? (
                              <>
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-0.5" />
                                <Volume2 className="w-3 h-3 text-emerald-600 animate-pulse" />
                                <span className="text-[9px]">Speaking...</span>
                              </>
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Quick Replies below bot message */}
                      {isBot && msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {msg.quickReplies.map((reply: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(reply)}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-slate-200 text-slate-700 transition"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}

                    </div>

                    {!isBot && (
                      <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mb-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bot typing bouncing dots indicator */}
              {isTyping && (
                <div className="flex items-end space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-slate-400 ml-2 font-medium">Sahayak is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ===================================================================== */}
            {/* VOICE TYPING ACTIVE STATUS OVERLAY                                    */}
            {/* ===================================================================== */}
            {isListening && (
              <div className="px-4 py-2 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-white animate-ping shrink-0" />
                  <span className="font-bold">
                    Listening in {currentLangObj.name} ({currentLangObj.nativeName})... Speak now!
                  </span>
                </div>
                <button
                  onClick={handleToggleVoiceTyping}
                  className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 font-semibold text-[11px]"
                >
                  Done
                </button>
              </div>
            )}

            {/* ===================================================================== */}
            {/* INPUT CONTROLS BAR                                                    */}
            {/* ===================================================================== */}
            <div className="p-3 bg-white border-t border-slate-200 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                {/* Voice Typing Microphone Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceTyping}
                  className={`p-2.5 rounded-2xl transition shadow-xs flex items-center justify-center shrink-0 ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                  }`}
                  title={isListening ? 'Click to stop listening' : `Voice Type in ${currentLangObj.name}`}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Text Input Box */}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    language === 'hi' 
                      ? 'अपना प्रश्न यहाँ लिखें या माइक दबाकर बोलें...' 
                      : `Ask your query in ${currentLangObj.name} or type here...`
                  }
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                  disabled={isTyping}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isTyping}
                  className={`p-2.5 rounded-2xl transition shadow-xs flex items-center justify-center shrink-0 ${
                    inputMessage.trim() && !isTyping
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-orange-600/20 hover:scale-105 active:scale-95'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Bottom DPDP Act and Statutory Badge */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>DPDP Act 2023 Compliant • Zero PII retention</span>
                </span>
                <span className="hidden sm:inline text-slate-400">
                  Press Enter ↵ to send
                </span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
