import React, { useState, useEffect, useRef, useCallback } from 'react';
import Markdown from 'react-markdown';
import { 
  Bot, 
  User, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  X, 
  Minimize2, 
  Maximize2,
  RotateCcw, 
  ShieldCheck, 
  ArrowRight,
  Copy,
  Check,
  Minus,
  ChevronUp
} from 'lucide-react';
import { CitizenProfile } from '../../types/user';
import { Scheme } from '../../types/scheme';
import { RankedPartner } from '../../types/partner';
import { BeneficiaryApplicationItem } from '../../types/beneficiary';
import { Language, Persona, LANGUAGES, PERSONAS, WidgetConfig } from '../../data/languages';
import { SUGGESTIONS } from '../../data/suggestions';
import { ChatMessage, ChatContext, ChatbotService } from '../../services/chatbotService';
import { ApiClient } from '../../services/apiClient';
import { GeminiClientService } from '../../services/geminiClientService';
import { useSpeech } from '../../hooks/useSpeech';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { WidgetEmbedModal } from './WidgetEmbedModal';
import { EmbedSiteSimulator } from './EmbedSiteSimulator';
import { GeminiKeyModal } from './GeminiKeyModal';

interface SahayakChatbotProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  profile: CitizenProfile;
  selectedScheme: Scheme | null;
  selectedPartner: RankedPartner | null;
  activeApplication?: BeneficiaryApplicationItem | null;
  language: string;
  onSelectLanguage: (lang: any) => void;
  onNavigateTab: (tab: 'landing' | 'dashboard' | 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'admin' | 'auth') => void;
}

// Helper to generate the standard Namaste greeting based on active language
const createWelcomeGreeting = (langCode: string, citizenName?: string): ChatMessage => {
  const isHindi = langCode === 'hi';
  const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const text = isHindi
    ? `**नमस्ते! मैं आज आपकी क्या सहायता कर सकता हूँ?**\n\nमैं **सहायक (SAHAYAK) AI** हूँ—सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE), भारत सरकार का आधिकारिक डिजिटल कल्याणकारी सलाहकार।\n\nमैं आपकी निम्नलिखित में सहायता कर सकता हूँ:\n- **रियायती ब्याज दर पर ऋण**: 4% से 6% ब्याज दर, ₹50 लाख तक ऋण, 6 माह की किस्त छूट (मोराटोरियम)\n- **अनुसूचित जाति/जनजाति (SC/ST) व OBC योजनाएं**: विशेष ऋण व पूंजीगत सब्सिडी\n- **महिला व सफाई कर्मचारी योजनाएं**: महिला समृद्धि योजना (4%), स्वच्छता उद्यमी योजना (SUY - 50% सब्सिडी)\n- **कौशल व छात्रवृत्ति**: PM-DAKSH नि:शुल्क प्रशिक्षण व स्टाइपेंड, PM-YASASVI छात्रवृत्ति\n- **दस्तावेज़ एवं कार्यालय**: आवश्यक प्रमाण पत्र, डिजिलॉकर त्वरित सत्यापन व निकटतम SCA कार्यालय\n\nआप मुझसे हिंदी या अंग्रेज़ी में लिख सकते हैं या माइक दबाकर सीधे बोल सकते हैं!`
    : `**Namaste! How can I assist you today?**\n\nI am **SAHAYAK AI**, the official digital welfare advisor for the Ministry of Social Justice and Empowerment (MoSJE), Government of India.\n\nI can assist you with:\n- **Concessional Credit**: Low interest loans (4%–6% p.a.) with up to 6 months setup moratorium\n- **Affirmative Programs**: Dedicated schemes for SC/ST, OBC, Safai Karamcharis, and Women Entrepreneurs\n- **Free Skilling & Scholarships**: PM-DAKSH training with monthly stipends, PM-YASASVI scholarships\n- **Documents & Partner Desks**: DigiLocker instant verification and finding your district SCA office\n\nYou can ask your question in English or Hindi, type below, or tap the microphone to speak!`;

  return {
    id: `msg-welcome-${Date.now()}`,
    sender: 'bot',
    text,
    timestamp,
    quickReplies: isHindi
      ? ['महिला योजनाएं', 'सफाई कर्मचारी योजना (SUY)', 'ऋण ईएमआई कैलकुलेटर', 'दस्तावेज़ चेकलिस्ट', 'मेरी पात्रता जांचें']
      : ['Women Welfare Schemes', 'Sanitation (SUY)', 'Calculate Loan EMI', 'Document Checklist', 'Check My Eligibility']
  };
};

export const SahayakChatbot: React.FC<SahayakChatbotProps> = ({
  isOpen,
  onOpen,
  onClose,
  profile,
  selectedScheme,
  selectedPartner,
  activeApplication,
  language: initialLanguageCode,
  onSelectLanguage,
  onNavigateTab
}) => {
  // Languages & Persona state
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const matched = LANGUAGES.find(l => l.code === initialLanguageCode);
    return matched || LANGUAGES[1]; // default Hindi or found
  });
  const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS[0]);

  // Messages State: discard stale previous convo information on start and begin with Namaste greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      localStorage.removeItem('sahayak_chat_history');
    } catch (e) {}
    const lang = LANGUAGES.find(l => l.code === initialLanguageCode) || LANGUAGES[1];
    return [createWelcomeGreeting(lang.code, profile?.name)];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);


  // Modals
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Active Gemini Model indicator
  const [activeModelName, setActiveModelName] = useState('Gemini 3.8 Flash');

  // Widget Embed Config
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(() => {
    try {
      const saved = localStorage.getItem('sahayak_widget_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      title: 'SAHAYAK AI Assistant',
      subtitle: 'MoSJE Concessional Welfare & Voice AI',
      primaryColor: '#ea580c',
      position: 'bottom-right',
      welcomeMessage: 'Namaste! How may I assist you with MoSJE welfare schemes?',
      defaultLanguage: 'hi',
      theme: 'system',
      enableVoice: true,
      avatarIcon: 'Bot',
    };
  });

  // Speech Hook (STT & TTS)
  const {
    isListening,
    transcript,
    isSpeaking,
    voices,
    speechSupported,
    settings: speechSettings,
    setSettings: setSpeechSettings,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  } = useSpeech(currentLang.speechCode);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external language change
  useEffect(() => {
    const matched = LANGUAGES.find(l => l.code === initialLanguageCode);
    if (matched && matched.code !== currentLang.code) {
      setCurrentLang(matched);
      setMessages(prev => {
        if (prev.length <= 1) {
          return [createWelcomeGreeting(matched.code, profile?.name)];
        }
        return prev;
      });
    }
  }, [initialLanguageCode, currentLang.code, profile?.name]);

  // Sync voice typing transcript to input
  useEffect(() => {
    if (transcript && isListening) {
      setInputMessage(transcript);
    }
  }, [transcript, isListening]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Persist widget config only (do not persist stale chat history across conversations)
  useEffect(() => {
    try {
      localStorage.setItem('sahayak_widget_config', JSON.stringify(widgetConfig));
    } catch (e) {}
  }, [widgetConfig]);

  // Reset active speaking ID when TTS stops
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageId(null);
    }
  }, [isSpeaking]);

  // Whenever someone starts a new conversation by opening the chatbot, remove previous conversation info
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
    }
    if (isOpen && !prevIsOpenRef.current) {
      try {
        localStorage.removeItem('sahayak_chat_history');
      } catch (e) {}
      setMessages([createWelcomeGreeting(currentLang.code, profile?.name)]);
      setInputMessage('');
      stopSpeaking();
      setSpeakingMessageId(null);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentLang.code, profile?.name, stopSpeaking]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 200);
    }
  }, [isOpen, isMinimized]);

  // Handle Send Message
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || inputMessage).trim();
      if (!text || isTyping) return;

      if (isListening) {
        stopListening();
      }

      stopSpeaking();
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

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      const context: ChatContext = {
        profile,
        selectedScheme,
        selectedPartner,
        activeApplication,
        language: (currentLang.code === 'auto' ? 'hi' : currentLang.code) as any
      };

      try {
        const botReply = await ApiClient.sendChatMessage(text, newHistory, {
          ...context,
          persona: currentPersona.id,
          language: currentLang.code
        } as any);

        if (botReply) {
          setMessages(prev => [...prev, botReply]);

          // Auto-read aloud if enabled in settings
          if (speechSettings.autoSpeak && botReply?.text) {
            setSpeakingMessageId(botReply.id);
            speakText(botReply.text, currentLang.speechCode);
          }
        }
      } catch (err) {
        console.warn('Chat processing failed, falling back to local reasoning:', err);
        const fallbackReply = await ChatbotService.processMessage(text, newHistory, context);
        setMessages(prev => [...prev, fallbackReply]);

        if (speechSettings.autoSpeak && fallbackReply?.text) {
          setSpeakingMessageId(fallbackReply.id);
          speakText(fallbackReply.text, currentLang.speechCode);
        }
      } finally {
        setIsTyping(false);
      }
    },
    [inputMessage, isTyping, isListening, messages, profile, selectedScheme, selectedPartner, activeApplication, currentLang, currentPersona, speechSettings, speakText, stopListening, stopSpeaking]
  );

  // Regenerate last response
  const handleRegenerate = useCallback(() => {
    if (messages.length === 0 || isTyping) return;

    let lastUserMessage: ChatMessage | null = null;
    let messageIndex = -1;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        lastUserMessage = messages[i];
        messageIndex = i;
        break;
      }
    }

    if (!lastUserMessage) return;

    const trimmedHistory = messages.slice(0, messageIndex);
    setMessages(trimmedHistory);
    handleSendMessage(lastUserMessage.text);
  }, [messages, isTyping, handleSendMessage]);

  // Voice Typing (STT) Toggle
  const handleToggleVoiceTyping = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      setSpeakingMessageId(null);
      startListening((finalText) => {
        if (finalText.trim()) {
          setInputMessage(finalText);
          setTimeout(() => {
            handleSendMessage(finalText);
          }, 300);
        }
      });
    }
  };

  // Speak / Stop Bot message
  const handleSpeakBotMessage = (id: string, text: string) => {
    if (speakingMessageId === id && isSpeaking) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      speakText(text, currentLang.speechCode, () => {
        setSpeakingMessageId(null);
      });
    }
  };

  // Copy text to clipboard
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy code block to clipboard
  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  // Clear Chat History & Start Fresh Conversation
  const handleClearHistory = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
    setInputMessage('');
    try {
      localStorage.removeItem('sahayak_chat_history');
    } catch (e) {}
    setMessages([createWelcomeGreeting(currentLang.code, profile?.name)]);
  };

  // Export Chat Transcript
  const handleExportChat = () => {
    if (messages.length === 0) {
      alert('No messages to export yet.');
      return;
    }
    const lines = messages.map(m => `[${m.timestamp}] ${m.sender === 'user' ? 'Citizen' : 'SAHAYAK AI'}:\n${m.text}\n`);
    const blob = new Blob([lines.join('\n---\n\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAHAYAK_Chat_Transcript_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle select language
  const handleSelectLanguageInternal = (lang: Language) => {
    setCurrentLang(lang);
    onSelectLanguage(lang.code);
    setMessages(prev => {
      if (prev.length <= 1) {
        return [createWelcomeGreeting(lang.code, profile?.name)];
      }
      return prev;
    });
  };

  // If closed, render Floating Trigger Button Pill
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 group">
        <button
          onClick={() => {
            setIsMinimized(false);
            onOpen();
          }}
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
            <div className="text-[10px] text-white/90 font-medium">
              Gemini 3.8 Flash • Real-time Voice STT/TTS
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
    <>
      <div 
        className={`fixed z-50 transition-all duration-300 ${
          isFullScreen
            ? 'inset-2 sm:inset-6 w-auto h-auto'
            : isMinimized 
            ? 'bottom-6 right-6 w-72 sm:w-80' 
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[480px] max-w-xl h-[680px] max-h-[calc(100vh-2rem)]'
        }`}
      >
        {isMinimized ? (
          /* Minimized Compact Bar - Clicking anywhere opens the chatbot */
          <div 
            onClick={() => setIsMinimized(false)}
            className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-3 flex items-center justify-between cursor-pointer rounded-2xl border border-orange-500/60 hover:border-orange-400 shadow-2xl group transition-all"
            title={currentLang.code === 'hi' ? 'खोलने के लिए क्लिक करें' : 'Click to open SAHAYAK AI'}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-amber-400 to-emerald-600 p-0.5 flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-white">
                    <Bot className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  SAHAYAK <span className="text-orange-400">सहायक AI</span>
                </div>
                <div className="text-[10px] text-orange-300 font-medium group-hover:underline truncate flex items-center gap-1">
                  <span>{currentLang.code === 'hi' ? 'खोलने के लिए क्लिक करें' : 'Click to expand'}</span>
                  <ChevronUp className="w-3 h-3 text-orange-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="p-1.5 rounded-lg text-orange-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={currentLang.code === 'hi' ? 'खोलें' : 'Expand Chat'}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsMinimized(false);
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-950/60 hover:text-red-400 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden backdrop-blur-xl">
          
          {/* ===================================================================== */}
          {/* HEADER                                                                */}
          {/* ===================================================================== */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-slate-800 relative shadow-xs">
            
            <div className="flex items-center space-x-3">
              {/* Bot Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-400 to-emerald-600 p-0.5 shadow-md shadow-orange-500/30 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white">
                    <Bot className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Gemini AI Active" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    SAHAYAK <span className="text-orange-400 text-xs">सहायक AI</span>
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center space-x-1 truncate max-w-[190px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline shrink-0" />
                  <span className="truncate">{currentPersona.name}</span>
                </p>
              </div>
            </div>

            {/* Header Controls Bar */}
            <div className="flex items-center space-x-1.5">
              
              {/* Language Switch: English & Hindi */}
              <div className="flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleSelectLanguageInternal(LANGUAGES.find(l => l.code === 'en') || LANGUAGES[2])}
                  className={`px-2.5 py-1 rounded-md transition-all text-xs font-semibold cursor-pointer ${
                    currentLang.code === 'en'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                  title="Switch to English"
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLanguageInternal(LANGUAGES.find(l => l.code === 'hi') || LANGUAGES[1])}
                  className={`px-2.5 py-1 rounded-md transition-all text-xs font-semibold cursor-pointer ${
                    currentLang.code === 'hi'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                  title="हिंदी में बदलें"
                >
                  हिंदी
                </button>
              </div>

              {/* Stop Speaking / Mute Button */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-950/60 transition animate-pulse"
                  title="Stop audio playback"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Start New Conversation / Clear History */}
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition text-[11px] font-semibold cursor-pointer"
                title={currentLang.code === 'hi' ? 'नई बातचीत शुरू करें (पिछली जानकारी हटाएं)' : 'Start New Chat (Remove previous conversation)'}
              >
                <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">{currentLang.code === 'hi' ? 'नई बातचीत' : 'New Chat'}</span>
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden sm:inline-flex"
                title={isFullScreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Minimize / Collapse to compact bar */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Minimize chat"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsMinimized(false);
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-red-950/60 hover:text-red-400 transition cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* ===================================================================== */}
          {/* MESSAGES FEED / WELCOME HERO                                          */}
          {/* ===================================================================== */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 scrollbar-thin">
                
                {/* Grounding & Model Badge */}
                <div className="flex items-center justify-center my-1">
                  <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 px-3 py-1 rounded-full text-[11px] font-medium shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Gemini Grounded MoSJE Welfare Catalog (NSFDC, NBCFDC, NSKFDC)</span>
                  </div>
                </div>

                {/* If messages somehow empty, allow starting conversation */}
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <button
                      onClick={() => setMessages([createWelcomeGreeting(currentLang.code, profile?.name)])}
                      className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-orange-700 hover:to-amber-700 transition"
                    >
                      {currentLang.code === 'hi' ? 'नमस्ते! बातचीत शुरू करें' : 'Namaste! Start Conversation'}
                    </button>
                  </div>
                )}

                    {messages.map((msg, index) => {
                      const isBot = msg.sender === 'bot';
                      const isSpeakingThis = isSpeaking && speakingMessageId === msg.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end space-x-2 ${
                            isBot ? 'justify-start' : 'justify-end'
                          } animate-in fade-in duration-150`}
                        >
                          {isBot && (
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs mb-1">
                              <Bot className="w-4 h-4" />
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-[82%] rounded-2xl p-3.5 transition shadow-xs text-xs sm:text-sm leading-relaxed ${
                              isBot
                                ? 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                                : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-xs shadow-orange-600/10'
                            }`}
                          >
                            {/* Message Content with Markdown rendering */}
                            {isBot ? (
                              <div className="space-y-2 prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed">
                                <Markdown
                                  components={{
                                    code(props) {
                                      const { children, className, node, ...rest } = props;
                                      const match = /language-(\w+)/.exec(className || '');
                                      const codeString = String(children).replace(/\n$/, '');
                                      const isInline = !match && !String(children).includes('\n');
                                      const codeKey = `${msg.id}-${codeString.slice(0, 15)}`;

                                      if (isInline) {
                                        return (
                                          <code className="px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-700 font-mono text-xs border border-orange-200" {...rest}>
                                            {children}
                                          </code>
                                        );
                                      }

                                      return (
                                        <div className="my-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 text-xs font-mono shadow-sm">
                                          <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-slate-800 text-slate-400">
                                            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-orange-400">
                                              {match ? match[1] : 'code'}
                                            </span>
                                            <button
                                              onClick={() => handleCopyCode(codeString, codeKey)}
                                              className="flex items-center gap-1 text-[10px] hover:text-white transition-colors py-0.5 px-1.5 rounded hover:bg-slate-800"
                                            >
                                              {copiedCodeKey === codeKey ? (
                                                <>
                                                  <Check className="w-3 h-3 text-emerald-400" />
                                                  <span className="text-emerald-400 font-sans">Copied</span>
                                                </>
                                              ) : (
                                                <>
                                                  <Copy className="w-3 h-3" />
                                                  <span className="font-sans">Copy</span>
                                                </>
                                              )}
                                            </button>
                                          </div>
                                          <div className="p-2.5 overflow-x-auto">
                                            <code className="text-slate-200" {...rest}>
                                              {children}
                                            </code>
                                          </div>
                                        </div>
                                      );
                                    }
                                  }}
                                >
                                  {msg.text}
                                </Markdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}

                            {/* Rule citation badge if available */}
                            {isBot && (msg.citedSchemeCode || msg.citedRuleId) && (
                              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                {msg.citedSchemeCode && (
                                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                                    Scheme: {msg.citedSchemeCode}
                                  </span>
                                )}
                                {msg.citedRuleId && (
                                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg">
                                    Rule: {msg.citedRuleId}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Interactive Action Tab Chip */}
                            {isBot && msg.actionTab && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100">
                                <button
                                  onClick={() => {
                                    onNavigateTab(msg.actionTab!);
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

                            {/* Metadata & Actions Row */}
                            {isBot && (
                              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[10px]">
                                <div className="flex items-center gap-2">
                                  {/* Listen Aloud Button with animated equalizer waves */}
                                  <button
                                    onClick={() => handleSpeakBotMessage(msg.id, msg.text)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                                      isSpeakingThis
                                        ? 'bg-orange-100 text-orange-700 font-bold'
                                        : 'hover:bg-slate-100 text-slate-500'
                                    }`}
                                    title={isSpeakingThis ? 'Stop speaking' : 'Read aloud with voice'}
                                  >
                                    {isSpeakingThis ? (
                                      <>
                                        <VolumeX className="w-3 h-3 text-orange-600" />
                                        <span className="flex gap-0.5 items-end h-2.5">
                                          <span className="w-0.5 bg-orange-600 animate-pulse h-1.5"></span>
                                          <span className="w-0.5 bg-orange-600 animate-pulse h-2.5"></span>
                                          <span className="w-0.5 bg-orange-600 animate-pulse h-1"></span>
                                        </span>
                                        <span className="text-[10px]">Stop</span>
                                      </>
                                    ) : (
                                      <>
                                        <Volume2 className="w-3 h-3" />
                                        <span className="text-[10px]">Listen</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Copy Message Button */}
                                  <button
                                    onClick={() => handleCopyText(msg.text, msg.id)}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                                    title="Copy message"
                                  >
                                    {copiedId === msg.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[10px] text-emerald-600 font-semibold">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span className="text-[10px]">Copy</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Regenerate if last bot message */}
                                  {index === messages.length - 1 && (
                                    <button
                                      onClick={handleRegenerate}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                                      title="Regenerate response"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span className="text-[10px]">Retry</span>
                                    </button>
                                  )}
                                </div>

                                <span>{msg.timestamp}</span>
                              </div>
                            )}

                            {/* User Timestamp */}
                            {!isBot && (
                              <div className="text-right mt-1 text-[10px] text-orange-200">
                                {msg.timestamp}
                              </div>
                            )}

                            {/* Quick Replies below bot message */}
                            {isBot && msg.quickReplies && msg.quickReplies.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                                {msg.quickReplies.map((reply: string, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleSendMessage(reply)}
                                    className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-slate-200 text-slate-700 transition shadow-2xs"
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

                {/* Quick Category Discovery Cards & Suggested Queries (shown when starting a conversation / messages.length === 1) */}
                {messages.length === 1 && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-300">
                    {/* 4 Feature Domain Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
                      <div 
                        onClick={() => handleSendMessage(currentLang.code === 'hi' 
                          ? 'महिला समृद्धि और नई स्वर्णिमा जैसी महिला कल्याणकारी ऋण योजनाओं के बारे में बताएं' 
                          : 'Tell me about women welfare loan schemes like Mahila Samriddhi and New Swarnima')}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-orange-400 hover:shadow-sm transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-1 text-orange-600 font-bold text-[11px] group-hover:text-orange-700">
                          <span>🌸</span>
                          <span>{currentLang.code === 'hi' ? 'महिला योजनाएं' : 'Women Schemes'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                          {currentLang.code === 'hi' ? '₹1.4L ऋण, 4% ब्याज व 25% सब्सिडी' : '₹1.4L at 4% p.a. + 25% subsidy for enterprise.'}
                        </p>
                      </div>

                      <div 
                        onClick={() => handleSendMessage(currentLang.code === 'hi'
                          ? 'स्वच्छता उद्यमी योजना और एनएसकेएफडीसी की सफाई कर्मचारी योजनाओं के बारे में बताएं'
                          : 'Tell me about Swachhta Udyami Yojana and sanitation worker schemes under NSKFDC')}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-sm transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-[11px] group-hover:text-emerald-700">
                          <span>🛡️</span>
                          <span>{currentLang.code === 'hi' ? 'सफाई (SUY)' : 'Sanitation (SUY)'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                          {currentLang.code === 'hi' ? 'सफाई वाहनों पर 50% तक पूंजीगत सब्सिडी' : 'Up to 50% capital subsidy for cleaning trucks.'}
                        </p>
                      </div>

                      <div 
                        onClick={() => handleSendMessage(currentLang.code === 'hi'
                          ? '4% से 6% ब्याज दर पर कौन से बिजनेस लोन उपलब्ध हैं?'
                          : 'What business loan schemes are available with 4% to 6% interest rate?')}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-sm transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-1 text-amber-600 font-bold text-[11px] group-hover:text-amber-700">
                          <span>💼</span>
                          <span>{currentLang.code === 'hi' ? 'व्यापार ऋण' : 'Business Loans'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                          {currentLang.code === 'hi' ? '₹50 लाख तक ऋण, 6 माह मोराटोरियम' : 'Up to ₹50 Lakh with 6-month moratorium.'}
                        </p>
                      </div>

                      <div 
                        onClick={() => handleSendMessage(currentLang.code === 'hi'
                          ? 'पीएम-दक्ष मुफ्त कौशल प्रशिक्षण और पीएम-यशस्वी छात्रवृत्ति के बारे में बताएं'
                          : 'Tell me about PM-DAKSH free skill training and PM-YASASVI scholarship')}
                        className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-sm transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-1 text-blue-600 font-bold text-[11px] group-hover:text-blue-700">
                          <span>🎓</span>
                          <span>{currentLang.code === 'hi' ? 'कौशल व शिक्षा' : 'Skilling & Edu'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                          {currentLang.code === 'hi' ? 'पीएम-दक्ष मुफ्त कौशल व मासिक स्टाइपेंड' : 'PM-DAKSH free skilling with monthly stipend.'}
                        </p>
                      </div>
                    </div>

                    {/* Suggestion Prompts */}
                    <div className="space-y-2 pt-1 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>{currentLang.code === 'hi' ? 'सुझाए गए प्रश्न' : 'Recommended Queries'}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        {(currentLang.code === 'hi'
                          ? [
                              {
                                title: 'मेरी श्रेणी व आय अनुसार पात्रता',
                                description: 'ओबीसी व सफाई कर्मचारी योजनाओं की पात्रता नियम।',
                                prompt: 'नमस्ते, मेरी श्रेणी OBC है और वार्षिक आय 2 लाख है। मुझे कौन सी योजना के तहत ऋण मिल सकता है?'
                              },
                              {
                                title: 'मोराटोरियम अवधि में ब्याज नियम',
                                description: 'शुरुआती 6 महीनों में कितना भुगतान करना होगा?',
                                prompt: 'लोन लेने पर पहले 6 महीने मोराटोरियम में कितना ब्याज और किश्त देनी होगी? कृपया स्पष्ट करें।'
                              },
                              {
                                title: 'सफाई कर्मचारी स्वच्छता उद्यमी योजना (SUY)',
                                description: 'सफाई वाहनों हेतु 50% पूंजीगत सब्सिडी और 4% ब्याज दर।',
                                prompt: 'सफाई कर्मचारी स्वच्छता उद्यमी योजना (SUY) के तहत सीवर सफाई वाहनों पर क्या सब्सिडी और शर्तें हैं?'
                              }
                            ]
                          : [
                              {
                                title: 'SC/ST Beneficiary Scheme Eligibility',
                                description: 'Concessional loans for Scheduled Caste and Scheduled Tribe beneficiaries under NSFDC.',
                                prompt: 'Which concessional loan and skill schemes are available for Scheduled Caste / Scheduled Tribe (SC/ST) applicants under NSFDC?'
                              },
                              {
                                title: 'Women Entrepreneurship (Mahila Samriddhi)',
                                description: 'Special 1% to 2% interest rebates for women micro-entrepreneurs.',
                                prompt: 'Tell me about Mahila Samriddhi Yojana and the special interest rebate for female entrepreneurs under NBCFDC/NSFDC.'
                              },
                              {
                                title: 'PM-DAKSH Free Skill Training',
                                description: '100% free government vocational training with ₹1,500/month stipend.',
                                prompt: 'What are the benefits, stipend rules, and eligibility criteria for PM-DAKSH skill training?'
                              }
                            ]
                        ).map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(item.prompt)}
                            className="p-2.5 text-left rounded-xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-xs transition-all group flex items-center justify-between"
                          >
                            <div className="space-y-0.5 pr-2">
                              <p className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bot typing bouncing indicator */}
                {isTyping && (
                  <div className="flex items-end space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-xs text-slate-500 ml-2 font-semibold">SAHAYAK Gemini is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ===================================================================== */}
              {/* VOICE LISTENING ACTIVE BANNER                                         */}
              {/* ===================================================================== */}
              {isListening && (
                <div className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-between text-xs animate-in fade-in duration-150">
                  <div className="flex items-center space-x-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    <span className="font-bold">
                      Listening in {currentLang.name}... Speak now!
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim()}
                      className="px-3 py-1 rounded-lg bg-white text-orange-700 font-bold text-[11px] hover:bg-slate-100 disabled:opacity-50"
                    >
                      Send Voice
                    </button>
                    <button
                      onClick={stopListening}
                      className="px-2.5 py-1 rounded-lg bg-black/20 text-white hover:bg-black/30 font-semibold text-[11px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* INPUT BAR                                                             */}
              {/* ===================================================================== */}
              <div className="p-3 bg-white border-t border-slate-200 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="relative flex items-end gap-2"
                >
                  <div className="relative flex-1 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={
                        isListening
                          ? 'Listening to speech...'
                          : currentLang.code === 'hi'
                          ? 'अपना प्रश्न यहाँ लिखें या माइक दबाकर बोलें...'
                          : `Ask anything in ${currentLang.name} or tap mic to speak...`
                      }
                      rows={1}
                      className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none max-h-32 min-h-[40px]"
                    />

                    {/* Language and Enter key indicator inside textarea */}
                    <div className="flex items-center justify-between px-3 pb-2 pt-0.5 text-[10px] text-slate-400 border-t border-slate-200/50">
                      <div className="flex items-center gap-1 font-semibold text-slate-500">
                        <span>{currentLang.flag}</span>
                        <span>{currentLang.code === 'auto' ? 'Auto Detect' : currentLang.nativeName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[9px] text-orange-600 uppercase font-mono">{currentPersona.name.split(' ')[0]}</span>
                      </div>
                      <span className="hidden sm:inline text-slate-400 font-mono">
                        Enter ↵ to send
                      </span>
                    </div>
                  </div>

                  {/* Microphone STT Button */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceTyping}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 shadow-xs ${
                      isListening
                        ? 'bg-red-600 text-white hover:bg-red-700 ring-4 ring-red-500/30 animate-pulse'
                        : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                    }`}
                    title={isListening ? 'Stop recording voice' : 'Speak with Voice (Speech to Text)'}
                  >
                    {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-orange-600" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:bg-slate-100 disabled:from-slate-200 disabled:to-slate-200 text-white flex items-center justify-center transition-all flex-shrink-0 shadow-xs disabled:cursor-not-allowed"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Bottom DPDP Act & Statutory Footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-0.5">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>DPDP Act 2023 Compliant • Statutory MoSJE Directives</span>
                  </span>
                  <span className="text-slate-400">
                    Toll-Free: 1800-11-2001
                  </span>
                </div>
              </div>
          </div>
        )}
      </div>

      {/* Voice & Speech Settings Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        settings={speechSettings}
        onUpdateSettings={setSpeechSettings}
        voices={voices}
        onTestVoice={(sample) => speakText(sample, currentLang.speechCode)}
        speechSupported={speechSupported}
      />

      {/* Gemini API Key Configuration Modal */}
      <GeminiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeyUpdated={(newKey) => {
          setActiveModelName('Gemini Active');
        }}
      />

      {/* Widget Embed Code Modal */}
      <WidgetEmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        config={widgetConfig}
        onUpdateConfig={setWidgetConfig}
      />

      {/* External Portal Simulator Modal */}
      {isSimulatorOpen && (
        <EmbedSiteSimulator
          onClose={() => setIsSimulatorOpen(false)}
          config={widgetConfig}
          currentLanguage={currentLang}
          onSelectLanguage={setCurrentLang}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isTyping}
          isListening={isListening}
          transcript={transcript}
          onStartListening={startListening}
          onStopListening={stopListening}
          onSpeakMessage={handleSpeakBotMessage}
          onStopSpeaking={stopSpeaking}
          isSpeaking={isSpeaking}
          speakingMessageId={speakingMessageId}
        />
      )}
    </>
  );
};
