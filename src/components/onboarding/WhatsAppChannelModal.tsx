import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  CheckCheck, 
  Sparkles, 
  Volume2, 
  VolumeX,
  ExternalLink, 
  ShieldCheck, 
  ChevronRight,
  RefreshCw,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Share2,
  Navigation,
  MapPin,
  MessageCircle,
  Calculator,
  FileCheck2,
  Check,
  Building2,
  Copy
} from 'lucide-react';
import { EligibilityEngine } from '../../services/eligibilityEngine';
import { CitizenProfile, Gender } from '../../types/user';
import { BeneficiaryCategory, ProjectPurpose, Scheme } from '../../types/scheme';
import { RankedPartner } from '../../types/partner';
import { BeneficiaryApplicationItem } from '../../types/beneficiary';
import { AuthUser } from '../../types/auth';
import { ChatbotService, ChatMessage as ServiceChatMessage, ChatContext } from '../../services/chatbotService';
import { REAL_MOSJE_SCHEMES } from '../../data/schemesData';
import { CHANNEL_PARTNERS_DATABASE } from '../../data/partnersData';
import { PartnerRouterService } from '../../services/partnerRouter';
import { VoiceService } from '../../services/voiceService';
import { Language, TRANSLATIONS } from '../../services/i18nService';

interface WhatsAppChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSchemeForWeb?: (schemeId: string) => void;
  selectedScheme?: Scheme | null;
  selectedPartner?: RankedPartner | null;
  profile?: CitizenProfile;
  language?: Language;
  onNavigateTab?: (tab: 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'dashboard' | 'auth') => void;
  authUser?: AuthUser | null;
  activeApplication?: BeneficiaryApplicationItem | null;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  buttons?: { label: string; action: () => void }[];
  schemeCard?: Scheme;
  actionTab?: 'wizard' | 'recommendations' | 'calculator' | 'partners' | 'checklist' | 'dashboard' | 'auth';
  actionLabel?: string;
}

// DTMF tone generator for realistic IVR dialpad
const playDialpadTone = (freq1: number, freq2: number) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = freq1;
    osc2.frequency.value = freq2;
    gain.gain.value = 0.08;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    setTimeout(() => {
      osc1.stop();
      osc2.stop();
      ctx.close();
    }, 150);
  } catch (e) {
    // Ignore audio context autoplay restrictions
  }
};

const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

export const WhatsAppChannelModal: React.FC<WhatsAppChannelModalProps> = ({
  isOpen,
  onClose,
  onSelectSchemeForWeb,
  selectedScheme,
  selectedPartner,
  profile,
  language = 'hi',
  onNavigateTab,
  authUser,
  activeApplication
}) => {
  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'WHATSAPP' | 'DIRECT_SEND' | 'IVR'>('WHATSAPP');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Direct WhatsApp sending state
  const [targetPhone, setTargetPhone] = useState<string>(authUser?.phone?.replace(/\D/g, '') || '9876543210');
  const [targetSchemeId, setTargetSchemeId] = useState<string>(selectedScheme?.id || REAL_MOSJE_SCHEMES[0].id);

  // IVR State
  const [ivrState, setIvrState] = useState<'IDLE' | 'CALLING' | 'CONNECTED' | 'COMPLETED'>('IDLE');
  const [ivrStep, setIvrStep] = useState<number>(1);
  const [ivrSeconds, setIvrSeconds] = useState<number>(0);
  const [ivrTranscript, setIvrTranscript] = useState<string[]>([]);

  // Current interactive profile for eligibility logic
  const [userProfile, setUserProfile] = useState<CitizenProfile>(() => {
    return profile || {
      name: authUser?.name || 'Citizen Beneficiary',
      state: 'Madhya Pradesh',
      district: 'Indore',
      age: 32,
      gender: 'FEMALE',
      category: 'OBC',
      annualFamilyIncome: 180000,
      projectCost: 200000,
      loanAmountRequested: 150000,
      purpose: 'SMALL_BUSINESS',
      isDifferentlyAbled: false,
      consentGiven: true
    };
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effective current scheme and partner
  const effectiveScheme = REAL_MOSJE_SCHEMES.find(s => s.id === targetSchemeId) || selectedScheme || REAL_MOSJE_SCHEMES[0];
  const effectivePartner: RankedPartner = selectedPartner || PartnerRouterService.rankPartners(
    22.7196,
    75.8577,
    effectiveScheme.agency,
    userProfile.district
  )[0];

  // Initial messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: isHindi
        ? '🇮🇳 नमस्ते! मैं MoSJE SAHAYAK आधिकारिक चैटबॉट हूँ। बिना किसी कंप्यूटर के, आप यहीं से अपनी पात्रता जान सकते हैं, दस्तावेज़ चेक कर सकते हैं और लोन ईएमआई पता कर सकते हैं।\n\nकृपया अपना सामाजिक वर्ग (Category) चुनें:'
        : '🇮🇳 Namaste! I am the official MoSJE SAHAYAK WhatsApp Bot. You can discover eligible schemes, check documents, and calculate concessional loan EMIs right here.\n\nPlease select your Social Category:',
      time: '11:00 AM',
      buttons: [
        { label: 'अनुसूचित जाति (SC)', action: () => handleSelectCategory('SC') },
        { label: 'अन्य पिछड़ा वर्ग (OBC)', action: () => handleSelectCategory('OBC') },
        { label: 'सफाई कर्मचारी (NSKFDC)', action: () => handleSelectCategory('SAFAI_KARAMCHARI') }
      ]
    }
  ]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // IVR Call Timer
  useEffect(() => {
    let interval: any = null;
    if (ivrState === 'CONNECTED') {
      interval = setInterval(() => {
        setIvrSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setIvrSeconds(0);
    }
    return () => clearInterval(interval);
  }, [ivrState]);

  if (!isOpen) return null;

  // Build WhatsApp Share Text
  const generateWhatsAppMessage = () => {
    const rate = effectiveScheme.interestSlabs?.[0]?.ratePercent || 5;
    const maxLoan = (effectiveScheme.maxLoanAmount / 100000).toFixed(2);
    const subsidy = effectiveScheme.maxSubsidyAmount 
      ? `₹${(effectiveScheme.maxSubsidyAmount / 100000).toFixed(2)} Lakh` 
      : 'Up to 33% capital subsidy';
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${effectivePartner.lat},${effectivePartner.lng}&travelmode=driving`;

    return `🏛️ *सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) - SAHAYAK*
----------------------------------------
✅ *अनुशंसित योजना:* ${effectiveScheme.name} (${effectiveScheme.agency})
💰 *अधिकतम ऋण:* ₹${maxLoan} लाख
📊 *रियायती ब्याज दर:* ${rate}% प्रतिवर्ष (बाजार दरों से 50% कम)
🎁 *सरकारी सब्सिडी:* ${subsidy}
⏳ *मोराटोरियम:* ${effectiveScheme.moratoriumMonths || 6} माह की छूट

📋 *अनिवार्य दस्तावेज़ (डिजिलॉकर प्रमाणित):*
1. आधार कार्ड (पहचान व निवास)
2. जाति प्रमाण पत्र (${userProfile.category || 'SC/OBC/Safai Karamchari'})
3. आय प्रमाण पत्र
4. बैंक पासबुक (DBT सक्रिय)

📍 *नामित चैनल पार्टनर (SCA) कार्यालय:*
🏢 ${effectivePartner.name}
📌 ${effectivePartner.address}, पिन: ${effectivePartner.pinCode}
👤 नोडल अधिकारी: ${effectivePartner.contactPerson} (${effectivePartner.phone})
🗺️ *गूगल मैप्स नेविगेशन दिशा-निर्देश:*
${directionsUrl}

🔗 *ऑनलाइन आवेदन पोर्टल:* https://sahayak.gov.in`;
  };

  // Launch Real WhatsApp with specific Phone Number
  const handleLaunchWhatsAppPersonal = () => {
    const cleanNumber = targetPhone.replace(/\D/g, '');
    const text = generateWhatsAppMessage();
    const url = cleanNumber.length >= 10
      ? `https://api.whatsapp.com/send?phone=91${cleanNumber.slice(-10)}&text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Launch Real WhatsApp Share Dialog
  const handleLaunchWhatsAppShare = () => {
    const text = generateWhatsAppMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Chat with Official Helpline
  const handleLaunchHelplineWhatsApp = () => {
    const query = isHindi 
      ? `नमस्ते! मुझे MoSJE की ${effectiveScheme.name} योजना एवं इंदौर SCA कार्यालय के बारे में जानकारी चाहिए।` 
      : `Namaste! I want to check details for ${effectiveScheme.name} under MoSJE and locate my nearest SCA office.`;
    window.open(`https://wa.me/919013151515?text=${encodeURIComponent(query)}`, '_blank');
  };

  // Copy WhatsApp message to clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Voice output for bot messages
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      VoiceService.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      VoiceService.stopSpeaking();
      setSpeakingMsgId(msgId);
      VoiceService.speak(text.replace(/[*•#]/g, ''), isHindi ? 'hi-IN' : 'en-IN', () => {
        setSpeakingMsgId(null);
      });
    }
  };

  // Voice note speech input
  const handleToggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      VoiceService.stopSpeaking();
    } else {
      if (!VoiceService.isRecognitionSupported()) {
        alert(isHindi ? 'आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता है।' : 'Voice recognition not supported in this browser.');
        return;
      }
      setIsListening(true);
      VoiceService.listen(
        isHindi ? 'hi-IN' : 'en-IN',
        (transcript) => {
          setInputText(transcript);
          setIsListening(false);
          // Automatically process the recognized voice note
          processUserQuery(transcript);
        },
        (err) => {
          console.warn('Voice recognition error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  // Process user message using ChatbotService
  const processUserQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      time: userTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Build context for conversational AI
    const context: ChatContext = {
      profile: userProfile,
      selectedScheme: effectiveScheme,
      selectedPartner: effectivePartner,
      activeApplication: activeApplication || null,
      language: language
    };

    try {
      const serviceHistory: ServiceChatMessage[] = messages.map(m => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.time
      }));

      const botReply = await ChatbotService.processMessage(queryText, serviceHistory, context);

      const nextBotMsg: ChatMessage = {
        id: botReply.id,
        sender: 'bot',
        text: botReply.text,
        time: botReply.timestamp,
        actionTab: botReply.actionTab,
        actionLabel: botReply.actionLabel,
        buttons: botReply.quickReplies?.map(qr => ({
          label: qr,
          action: () => processUserQuery(qr)
        }))
      };

      // Check if top matching scheme should be attached
      if (queryText.toLowerCase().includes('scheme') || queryText.toLowerCase().includes('योजना') || queryText.toLowerCase().includes('पात्र') || queryText.toLowerCase().includes('loan')) {
        nextBotMsg.schemeCard = effectiveScheme;
      }

      setMessages(prev => [...prev, nextBotMsg]);
    } catch (e) {
      console.error('Chatbot error:', e);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: isHindi
          ? `आपकी पंजीकृत श्रेणी **${userProfile.category}** के लिए **${effectiveScheme.name}** सर्वोत्तम है। अधिकतम ऋण ₹${(effectiveScheme.maxLoanAmount/100000).toFixed(2)} लाख है।`
          : `For your registered category **${userProfile.category}**, **${effectiveScheme.name}** is the top recommended scheme with up to ₹${(effectiveScheme.maxLoanAmount/100000).toFixed(2)} Lakh financing.`,
        time: userTime,
        schemeCard: effectiveScheme
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Interactive flow triggers
  const handleSelectCategory = (category: BeneficiaryCategory) => {
    const updated = { ...userProfile, category };
    setUserProfile(updated);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: category === 'SC' ? 'अनुसूचित जाति (SC)' : category === 'OBC' ? 'अन्य पिछड़ा वर्ग (OBC)' : 'सफाई कर्मचारी (NSKFDC)',
      time: '11:01 AM'
    };

    const nextBotMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: isHindi
        ? `धन्यवाद! आप किस उद्देश्य (Business Purpose) के लिए ऋण अथवा सहायता चाहते हैं?`
        : `Thank you! What business purpose do you require concessional financing for?`,
      time: '11:01 AM',
      buttons: [
        { label: '🏪 दुकान / लघु उद्यम (Retail & Micro)', action: () => handleSelectPurpose('SMALL_BUSINESS', updated) },
        { label: '✂️ महिला सिलाई / स्वयं सहायता (Mahila Samriddhi)', action: () => handleSelectPurpose('WOMEN_MICROCREDIT', updated) },
        { label: '⚡ ई-रिक्शा / सौर ऊर्जा (Green Business)', action: () => handleSelectPurpose('GREEN_BUSINESS', updated) },
        { label: '🎓 उच्च शिक्षा ऋण (Higher Education)', action: () => handleSelectPurpose('EDUCATION', updated) }
      ]
    };

    setMessages(prev => [...prev, userMsg, nextBotMsg]);
  };

  const handleSelectPurpose = (purpose: ProjectPurpose, currentProfile: CitizenProfile) => {
    const updated: CitizenProfile = { 
      ...currentProfile, 
      purpose, 
      gender: (purpose === 'WOMEN_MICROCREDIT' ? 'FEMALE' : currentProfile.gender) as Gender 
    };
    setUserProfile(updated);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: purpose === 'SMALL_BUSINESS' 
        ? 'दुकान / लघु उद्यम' 
        : purpose === 'WOMEN_MICROCREDIT' 
        ? 'महिला सिलाई / स्वयं सहायता' 
        : purpose === 'EDUCATION'
        ? 'उच्च शिक्षा ऋण'
        : 'ई-रिक्शा / सौर ऊर्जा',
      time: '11:02 AM'
    };

    const outcome = EligibilityEngine.evaluateAllSchemes(updated);
    const topMatch = outcome.eligibleSchemes[0]?.scheme || effectiveScheme;
    const rate = topMatch.interestSlabs?.[0]?.ratePercent || 5;

    const nextBotMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: isHindi
        ? `🎉 *बधाई! आपके लिए शीर्ष सरकारी योजना स्वीकृत हुई है:*\n\n✅ *${topMatch.name}*\n• एजेंसी: ${topMatch.agency}\n• ब्याज दर: ${rate}% प्रतिवर्ष (रियायती)\n• अधिकतम ऋण: ₹${(topMatch.maxLoanAmount / 100000).toFixed(2)} लाख\n• मोराटोरियम: ${topMatch.moratoriumMonths || 6} माह की छूट\n\nआप इस योजना के लिए 100% पात्र हैं। आप सीधे अपने चैनल पार्टनर कार्यालय जा सकते हैं या नीचे से व्हाट्सएप पर पर्ची मंगा सकते हैं।`
        : `🎉 *Congratulations! Matching Welfare Scheme Identified:*\n\n✅ *${topMatch.name}*\n• Apex Agency: ${topMatch.agency}\n• Concessional Rate: ${rate}% p.a.\n• Max Loan: ₹${(topMatch.maxLoanAmount / 100000).toFixed(2)} Lakh\n• Moratorium: ${topMatch.moratoriumMonths || 6} Months Grace Period\n\nYou qualify 100% for this scheme.`,
      time: '11:02 AM',
      schemeCard: topMatch,
      buttons: [
        { label: '📄 आवश्यक दस्तावेज़ चेकलिस्ट देखें', action: () => processUserQuery('आवश्यक दस्तावेज़ क्या हैं?') },
        { label: '💰 मासिक ईएमआई की गणना करें', action: () => processUserQuery('ईएमआई कितनी होगी?') },
        { label: '📍 निकटतम SCA कार्यालय व दिशा-निर्देश', action: () => processUserQuery('निकटतम कार्यालय कहाँ है?') }
      ]
    };

    setMessages(prev => [...prev, userMsg, nextBotMsg]);
  };

  const handleResetChat = () => {
    VoiceService.stopSpeaking();
    setSpeakingMsgId(null);
    setMessages([
      {
        id: 'msg-1',
        sender: 'bot',
        text: isHindi
          ? '🇮🇳 नमस्ते! मैं MoSJE SAHAYAK आधिकारिक चैटबॉट हूँ। बिना किसी कंप्यूटर के, आप यहीं से अपनी पात्रता जान सकते हैं, दस्तावेज़ चेक कर सकते हैं और लोन ईएमआई पता कर सकते हैं।\n\nकृपया अपना सामाजिक वर्ग (Category) चुनें:'
          : '🇮🇳 Namaste! I am the official MoSJE SAHAYAK WhatsApp Bot. You can discover eligible schemes, check documents, and calculate concessional loan EMIs right here.\n\nPlease select your Social Category:',
        time: '11:00 AM',
        buttons: [
          { label: 'अनुसूचित जाति (SC)', action: () => handleSelectCategory('SC') },
          { label: 'अन्य पिछड़ा वर्ग (OBC)', action: () => handleSelectCategory('OBC') },
          { label: 'सफाई कर्मचारी (NSKFDC)', action: () => handleSelectCategory('SAFAI_KARAMCHARI') }
        ]
      }
    ]);
  };

  // IVR Call Simulation Handler
  const startIvrCall = () => {
    setIvrState('CONNECTED');
    setIvrStep(1);
    setIvrTranscript([
      '📞 Call Connected: 1800-202-SAHAYAK (Toll-Free MoSJE Hotline)',
      '🤖 IVR: "नमस्ते! सामाजिक न्याय एवं अधिकारिता मंत्रालय में आपका स्वागत है। हिंदी के लिए 1 दबाएं। For English press 2."'
    ]);
    VoiceService.speak(
      'नमस्ते! सामाजिक न्याय एवं अधिकारिता मंत्रालय के टोल-फ्री हेल्पलाइन में आपका स्वागत है। हिंदी के लिए 1 दबाएं। For English press 2.',
      'hi-IN'
    );
  };

  const endIvrCall = () => {
    VoiceService.stopSpeaking();
    setIvrState('COMPLETED');
    setIvrTranscript(prev => [...prev, '🔴 Call Terminated by User.']);
  };

  const handleIvrKeyPress = (digit: string) => {
    if (ivrState !== 'CONNECTED') return;

    // Play DTMF tone
    const freqs = DTMF_FREQS[digit] || [697, 1209];
    playDialpadTone(freqs[0], freqs[1]);

    if (ivrStep === 1) {
      // Language selected
      if (digit === '1') {
        setIvrStep(2);
        setIvrTranscript(prev => [
          ...prev,
          `Citizen Pressed: [${digit}] (Hindi Selected)`,
          '🤖 IVR: "अपनी सामाजिक श्रेणी चुनें। अनुसूचित जाति (SC) के लिए 1 दबाएं। अन्य पिछड़ा वर्ग (OBC) हेतु 2 दबाएं। सफाई कर्मचारी हेतु 3 दबाएं।"'
        ]);
        VoiceService.speak('अपनी सामाजिक श्रेणी चुनें। अनुसूचित जाति के लिए 1 दबाएं। अन्य पिछड़ा वर्ग हेतु 2 दबाएं। सफाई कर्मचारी हेतु 3 दबाएं।', 'hi-IN');
      } else {
        setIvrStep(2);
        setIvrTranscript(prev => [
          ...prev,
          `Citizen Pressed: [${digit}] (English Selected)`,
          '🤖 IVR: "Please select your category. Press 1 for Scheduled Caste (SC), Press 2 for OBC, Press 3 for Safai Karamchari."'
        ]);
        VoiceService.speak('Please select your category. Press 1 for Scheduled Caste, Press 2 for OBC, Press 3 for Safai Karamchari.', 'en-IN');
      }
    } else if (ivrStep === 2) {
      // Category selected
      const selectedCat = digit === '1' ? 'SC' : digit === '2' ? 'OBC' : 'SAFAI_KARAMCHARI';
      setUserProfile(prev => ({ ...prev, category: selectedCat }));
      setIvrStep(3);
      setIvrTranscript(prev => [
        ...prev,
        `Citizen Pressed: [${digit}] (${selectedCat})`,
        '🤖 IVR: "ऋण आवश्यकता का चयन करें। दुकान व लघु व्यवसाय हेतु 1 दबाएं। महिला सिलाई हेतु 2 दबाएं। उच्च शिक्षा हेतु 3 दबाएं।"'
      ]);
      VoiceService.speak('ऋण आवश्यकता का चयन करें। दुकान व लघु व्यवसाय हेतु 1 दबाएं। महिला सिलाई हेतु 2 दबाएं। उच्च शिक्षा हेतु 3 दबाएं।', 'hi-IN');
    } else if (ivrStep === 3) {
      // Need selected -> Qualification
      setIvrStep(4);
      const scheme = effectiveScheme;
      const speechText = `बधाई हो! आप सामाजिक न्याय मंत्रालय की ${scheme.name} के लिए पात्र हैं। रियायती ब्याज दर 4 प्रतिशत प्रतिवर्ष है। आपके फोन पर एसएमएस और व्हाट्सएप टोकन भेज दिया गया है। इंदौर कार्यालय में श्री अरविंद वर्मा से संपर्क करें। धन्यवाद!`;
      setIvrTranscript(prev => [
        ...prev,
        `Citizen Pressed: [${digit}] (Loan Need Selected)`,
        `🤖 IVR: "${speechText}"`,
        `📱 SMS & WhatsApp Sent: Scheme token #MOSJE-${Date.now().toString(36).toUpperCase()} dispatched with Indore SCA directions link.`
      ]);
      VoiceService.speak(speechText, 'hi-IN');
    }
  };

  const formatIvrTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Channel Switcher & Close Bar */}
        <div className="bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('WHATSAPP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer ${
                activeTab === 'WHATSAPP' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>💬 WhatsApp Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('DIRECT_SEND')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer ${
                activeTab === 'DIRECT_SEND' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>📲 Send to WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab('IVR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0 cursor-pointer ${
                activeTab === 'IVR' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>📞 Live IVR Call</span>
            </button>
          </div>

          <button
            onClick={() => {
              VoiceService.stopSpeaking();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TAB 1: WHATSAPP INTERACTIVE CHATBOT */}
        {activeTab === 'WHATSAPP' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-[#ECE5DD]">
            
            {/* WhatsApp Contact Header */}
            <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center text-base shadow-sm">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm leading-tight">SAHAYAK — MoSJE Official</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center text-[9px] font-black" title="Verified MoSJE Bot">✓</span>
                  </div>
                  <span className="text-[10px] text-emerald-200">
                    {isTyping ? 'typing…' : 'Online • MoSJE Govt of India (+91-11-SAHAYAK)'}
                  </span>
                </div>
              </div>

              {/* Header Real WhatsApp Action & Reset */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLaunchWhatsAppShare}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold transition flex items-center space-x-1 border border-emerald-500/50 shadow-xs cursor-pointer"
                  title="Open real WhatsApp app"
                >
                  <Share2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Open Real WhatsApp</span>
                </button>

                <button
                  onClick={handleResetChat}
                  className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-100 transition cursor-pointer"
                  title="Reset conversation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              
              {/* Encryption & Legal Compliance Notice */}
              <div className="text-center">
                <span className="bg-[#FFF8E7] text-[#54656F] px-3 py-1 rounded-lg text-[10px] shadow-2xs inline-flex items-center space-x-1.5 border border-amber-200/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>End-to-End Encrypted · DPDP Act 2023 Statutory MoSJE Gateway</span>
                </span>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] p-3 rounded-2xl shadow-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#E7FFDB] text-slate-900 rounded-tr-xs'
                        : 'bg-white text-slate-900 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line text-xs">{msg.text}</p>

                    {/* Scheme Card Preview in WhatsApp */}
                    {msg.schemeCard && (
                      <div className="mt-3 p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{msg.schemeCard.name}</span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 shrink-0">
                            {msg.schemeCard.agency}
                          </span>
                        </div>
                        
                        <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2 rounded-xl border border-emerald-100">
                          <div>• रियायती ब्याज: <strong className="text-emerald-700">{msg.schemeCard.interestSlabs?.[0]?.ratePercent || 5}% प्रतिवर्ष</strong></div>
                          <div>• अधिकतम ऋण: <strong className="text-slate-800">₹{(msg.schemeCard.maxLoanAmount / 100000).toFixed(2)} लाख</strong></div>
                          <div>• मोराटोरियम: <strong>{msg.schemeCard.moratoriumMonths || 6} माह की छूट</strong></div>
                        </div>

                        {/* Interactive Actions on Scheme Card */}
                        <div className="pt-1 flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => {
                              onClose();
                              if (onSelectSchemeForWeb && msg.schemeCard) {
                                onSelectSchemeForWeb(msg.schemeCard.id);
                              }
                            }}
                            className="flex-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-[10px] transition flex items-center justify-center space-x-1 cursor-pointer shadow-2xs"
                          >
                            <span>पोर्टल पर आवेदन करें</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${effectivePartner.lat},${effectivePartner.lng}&travelmode=driving`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] transition flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
                            title="Open SCA in Google Maps"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>SCA रास्ता</span>
                          </a>

                          <button
                            onClick={() => setActiveTab('DIRECT_SEND')}
                            className="py-1.5 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-bold text-[10px] transition flex items-center justify-center space-x-1 cursor-pointer"
                            title="Send scheme details to your personal WhatsApp"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>व्हाट्सएप पर्ची</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bottom Metadata & Voice Readout */}
                    <div className="text-[9px] text-slate-400 mt-1.5 flex items-center justify-between pt-1 border-t border-slate-100">
                      {msg.sender === 'bot' ? (
                        <button
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          className="text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 font-semibold transition cursor-pointer"
                          title="Listen voice readout"
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                              <span className="text-rose-500">Stop Voice</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-emerald-600" />
                              <span>Listen Audio</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span></span>
                      )}

                      <div className="flex items-center space-x-1">
                        <span>{msg.time}</span>
                        {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>

                  {/* Quick Reply Action Buttons */}
                  {msg.buttons && (
                    <div className="mt-2 space-y-1.5 w-[90%] sm:w-[85%]">
                      {msg.buttons.map((btn, idx) => (
                        <button
                          key={idx}
                          onClick={btn.action}
                          className="w-full py-2 px-3 bg-white hover:bg-emerald-50 text-[#075E54] border border-emerald-200 rounded-xl font-bold text-xs text-left shadow-2xs transition flex items-center justify-between cursor-pointer"
                        >
                          <span>{btn.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center space-x-1.5 bg-white px-3 py-2 rounded-2xl w-24 text-slate-400 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="bg-[#EFEAE2] px-3 py-1.5 border-t border-slate-200 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold text-slate-500 shrink-0">त्वरित सुझाव:</span>
              <button
                onClick={() => processUserQuery('मेरी पात्रता जांचें')}
                className="px-2.5 py-1 rounded-full bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-[10px] font-semibold whitespace-nowrap transition cursor-pointer"
              >
                📋 मेरी पात्रता
              </button>
              <button
                onClick={() => processUserQuery('आवश्यक दस्तावेज़ क्या हैं?')}
                className="px-2.5 py-1 rounded-full bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-[10px] font-semibold whitespace-nowrap transition cursor-pointer"
              >
                📄 दस्तावेज़ लिस्ट
              </button>
              <button
                onClick={() => processUserQuery('₹2 लाख के लोन पर ईएमआई बताएं')}
                className="px-2.5 py-1 rounded-full bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-[10px] font-semibold whitespace-nowrap transition cursor-pointer"
              >
                💰 ऋण ईएमआई
              </button>
              <button
                onClick={() => processUserQuery('निकटतम SCA कार्यालय कहाँ है?')}
                className="px-2.5 py-1 rounded-full bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 text-[10px] font-semibold whitespace-nowrap transition cursor-pointer"
              >
                📍 निकटतम ऑफिस
              </button>
            </div>

            {/* Input Bar with Mic & Send */}
            <div className="bg-[#F0F2F5] p-2.5 border-t border-slate-200 flex items-center space-x-2 shrink-0">
              <button
                onClick={handleToggleVoiceInput}
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer ${
                  isListening 
                    ? 'bg-rose-600 text-white animate-pulse' 
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                }`}
                title={isListening ? 'Listening… click to stop' : 'Record WhatsApp voice note'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && processUserQuery(inputText)}
                placeholder={isListening ? 'बोलिए... आपकी आवाज़ सुनी जा रही है...' : 'योजना, दस्तावेज़ या ईएमआई के बारे में पूछें...'}
                className="flex-1 py-2 px-3.5 bg-white rounded-full text-xs font-medium border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              />

              <button
                onClick={() => processUserQuery(inputText)}
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-full bg-[#075E54] hover:bg-emerald-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-xs transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: SEND SCHEME & PASS DIRECTLY TO WHATSAPP */}
        {activeTab === 'DIRECT_SEND' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50">
            
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isHindi ? 'सीधे अपने व्हाट्सएप पर योजना पर्ची भेजें' : 'Send Scheme & Routing Pass to WhatsApp'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isHindi 
                      ? 'अपनी चयनित योजना, ब्याज दर, आवश्यक कागज़ात और SCA कार्यालय का गूगल मैप्स लिंक एक क्लिक में प्राप्त करें।' 
                      : 'Receive your verified scheme sanction memo, document checklist & SCA GPS directions via WhatsApp.'}
                  </p>
                </div>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {isHindi ? '10-अंकों का मोबाइल नंबर:' : '10-Digit Mobile Number:'}
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
                    <span className="px-3 text-xs font-bold text-slate-500 bg-slate-100 border-r border-slate-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={targetPhone}
                      onChange={(e) => setTargetPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-3 py-2 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {isHindi ? 'योजना चुनें:' : 'Select Scheme:'}
                  </label>
                  <select
                    value={targetSchemeId}
                    onChange={(e) => setTargetSchemeId(e.target.value)}
                    className="w-full p-2 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {REAL_MOSJE_SCHEMES.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.agency}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleLaunchWhatsAppPersonal}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isHindi ? 'व्हाट्सएप पर भेजें (Send to My Number)' : 'Send to My WhatsApp'}</span>
                </button>

                <button
                  onClick={handleLaunchWhatsAppShare}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'अन्य संपर्क को शेयर करें' : 'Share to Any Contact'}</span>
                </button>

                <button
                  onClick={handleCopyMessage}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 border border-slate-300 cursor-pointer"
                  title="Copy formatted text"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText ? 'कॉपी हो गया' : 'कॉपी'}</span>
                </button>
              </div>

            </div>

            {/* Live WhatsApp Message Preview Card */}
            <div className="bg-[#ECE5DD] p-4 rounded-2xl border border-[#DAD3CC] shadow-inner space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                {isHindi ? 'व्हाट्सएप संदेश पूर्वावलोकन (Live Preview):' : 'WhatsApp Message Live Preview:'}
              </span>
              
              <div className="bg-white p-3.5 rounded-2xl shadow-xs text-slate-800 text-xs font-mono leading-relaxed whitespace-pre-line border border-slate-200">
                {generateWhatsAppMessage()}
              </div>
            </div>

            {/* Official Helpdesk Banner */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-xs text-emerald-950 block">
                  MoSJE आधिकारिक राष्ट्रीय हेल्पलाइन (व्हाट्सएप बॉट)
                </span>
                <span className="text-[11px] text-emerald-700">
                  +91-9013151515 पर सीधे सरकार के MyGov बॉट से चैट करें।
                </span>
              </div>
              <button
                onClick={handleLaunchHelplineWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center space-x-1 cursor-pointer"
              >
                <span>चैट शुरू करें</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

          </div>
        )}

        {/* TAB 3: LIVE INTERACTIVE IVR VOICE SIMULATOR */}
        {activeTab === 'IVR' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-900 text-white">
            
            {/* IVR Status Banner */}
            <div className="flex items-center justify-between p-4 bg-slate-800/90 rounded-2xl border border-slate-700">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  ivrState === 'CONNECTED' ? 'bg-emerald-600 text-white animate-pulse' : 'bg-blue-600/30 text-blue-400'
                }`}>
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Toll-Free Voice Gateway (2G / Feature Phone Simulator)
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    1800-202-SAHAYAK
                  </h3>
                </div>
              </div>

              {/* Call Timer & Status */}
              <div className="text-right">
                <div className={`text-xs font-extrabold flex items-center justify-end space-x-1.5 ${
                  ivrState === 'CONNECTED' ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${ivrState === 'CONNECTED' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                  <span>{ivrState === 'CONNECTED' ? 'Call Active' : 'Offline / Ready'}</span>
                </div>
                {ivrState === 'CONNECTED' && (
                  <span className="text-base font-mono font-bold text-white block mt-0.5">
                    {formatIvrTimer(ivrSeconds)}
                  </span>
                )}
              </div>
            </div>

            {/* Dialpad & Call Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              
              {/* Dialpad */}
              <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-4">
                <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
                  DTMF Interactive Keypad
                </div>

                <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleIvrKeyPress(digit)}
                      disabled={ivrState !== 'CONNECTED'}
                      className="h-12 rounded-2xl bg-slate-700 hover:bg-slate-600 active:bg-blue-600 disabled:opacity-30 text-white font-extrabold text-lg flex items-center justify-center transition shadow-sm cursor-pointer disabled:cursor-not-allowed border border-slate-600"
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                {/* Call & Hang Up Actions */}
                <div className="pt-2 flex items-center justify-center space-x-3">
                  {ivrState !== 'CONNECTED' ? (
                    <button
                      onClick={startIvrCall}
                      className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>कॉल प्रारंभ करें (Start Call)</span>
                    </button>
                  ) : (
                    <button
                      onClick={endIvrCall}
                      className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 transition shadow-lg shadow-rose-600/30 cursor-pointer"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>कॉल समाप्त करें (End Call)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Call Transcript Box */}
              <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex flex-col h-[320px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400">
                  <span>लाइव वॉयस ट्रांसक्रिप्ट (ASR / TTS)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Bhashini Indian TTS</span>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs text-slate-300 font-mono">
                  {ivrTranscript.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      "कॉल प्रारंभ करें" बटन दबाकर टोल-फ्री आईवीआर हेल्पलाइन का वास्तविक अनुभव लें।
                    </div>
                  ) : (
                    ivrTranscript.map((line, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 leading-relaxed">
                        {line}
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Twilio / Exotel Simulated Trunk</span>
                  <span className="text-emerald-400 font-bold">11 Indian Languages</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
