import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Check, ArrowRight, X, Sparkles, VolumeX } from 'lucide-react';
import { VoiceService } from '../../services/voiceService';
import { CitizenProfile } from '../../types/user';
import { BeneficiaryCategory, ProjectPurpose } from '../../types/scheme';
import { Language, getSpeechCode, isIndicLanguage } from '../../services/i18nService';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CitizenProfile;
  onUpdateProfile: (updated: Partial<CitizenProfile>) => void;
  onComplete: () => void;
  language: Language;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onComplete,
  language
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [stopListeningFn, setStopListeningFn] = useState<(() => void) | null>(null);

  const isHindi = isIndicLanguage(language);
  const speechCode = getSpeechCode(language);

  const questions = [
    {
      step: 1,
      title: isHindi ? 'आपका सामाजिक वर्ग क्या है?' : 'What is your community category?',
      promptAudio: isHindi 
        ? 'कृपया अपना सामाजिक वर्ग बताएं: अनुसूचित जाति, अन्य पिछड़ा वर्ग, या सफाई कर्मचारी?' 
        : 'Please tell your community category: Scheduled Caste, Other Backward Class, or Safai Karamchari?',
      options: [
        { label: isHindi ? 'अनुसूचित जाति (SC)' : 'Scheduled Caste (SC)', value: 'SC', keywords: ['sc', 'अनुसूचित जाति', 'दलित', 'जाति'] },
        { label: isHindi ? 'अन्य पिछड़ा वर्ग (OBC)' : 'Other Backward Class (OBC)', value: 'OBC', keywords: ['obc', 'ओबीसी', 'पिछड़ा वर्ग', 'पिछड़े'] },
        { label: isHindi ? 'सफाई कर्मचारी / आश्रित' : 'Safai Karamchari / Dependent', value: 'SAFAI_KARAMCHARI', keywords: ['सफाई', 'कर्मचारी', 'वाल्मीकि', 'balmiki', 'safai'] },
        { label: isHindi ? 'सामान्य / अन्य' : 'Open / General', value: 'OPEN', keywords: ['general', 'सामान्य', 'open'] }
      ]
    },
    {
      step: 2,
      title: isHindi ? 'आप क्या व्यवसाय या कार्य करना चाहते हैं?' : 'What enterprise or activity do you plan?',
      promptAudio: isHindi 
        ? 'आप किस काम के लिए ऋण चाहते हैं: दुकान या लघु उद्योग, कृषि व डेयरी, ई-रिक्शा या हरित व्यापार, या सिलाई?' 
        : 'What business do you plan: Small Retail Shop, Agriculture Dairy, Green EV E-rickshaw, or Women Microcredit?',
      options: [
        { label: isHindi ? 'दुकान / लघु व्यापार' : 'Retail / Small Business', value: 'SMALL_BUSINESS', keywords: ['दुकान', 'व्यापार', 'बिजनेस', 'shop', 'business'] },
        { label: isHindi ? 'खेती / पशुपालन / डेयरी' : 'Agriculture & Dairy', value: 'AGRICULTURE', keywords: ['खेती', 'डेयरी', 'गाय', 'भैंस', 'पशुपालन', 'kheti', 'dairy'] },
        { label: isHindi ? 'ई-रिक्शा / हरित व्यापार' : 'E-Rickshaw / Green Business', value: 'GREEN_BUSINESS', keywords: ['रिक्शा', 'ई रिक्शा', 'solar', 'सोलर', 'rickshaw'] },
        { label: isHindi ? 'महिला सिलाई / सूक्ष्म उद्योग' : 'Women Micro-enterprise', value: 'WOMEN_MICROCREDIT', keywords: ['सिलाई', 'महिला', 'हस्तशिल्प', 'tailoring', 'women'] },
        { label: isHindi ? 'सफाई यंत्रीकरण' : 'Sanitation Modernization', value: 'SANITATION_REHAB', keywords: ['सफाई वाहन', 'सीवर', 'टैंक', 'मशीन'] }
      ]
    },
    {
      step: 3,
      title: isHindi ? 'आपकी वार्षिक पारिवारिक आय कितनी है?' : 'What is your annual family income?',
      promptAudio: isHindi 
        ? 'अपनी पारिवारिक वार्षिक आय बताएं: डेढ़ लाख, दो लाख, ढाई लाख, या तीन लाख से अधिक?' 
        : 'Please specify your family income: 1.5 Lakh, 2.5 Lakh, or above 3 Lakh?',
      options: [
        { label: isHindi ? '₹1.5 लाख तक (गरीबी रेखा)' : 'Up to ₹1.5 Lakh', value: 150000, keywords: ['डेढ़ लाख', 'एक लाख', 'one', '1.5'] },
        { label: isHindi ? '₹2.5 लाख तक' : '₹1.5L to ₹2.5 Lakh', value: 250000, keywords: ['दो लाख', 'ढाई लाख', '2.5', 'two'] },
        { label: isHindi ? '₹3.0 लाख (योजना सीमा)' : '₹2.5L to ₹3.0 Lakh', value: 290000, keywords: ['तीन लाख', 'three', '3'] },
        { label: isHindi ? '₹3.0 लाख से अधिक' : 'Above ₹3.0 Lakh', value: 360000, keywords: ['साढ़े तीन', 'चार लाख', 'above', 'अधिक'] }
      ]
    },
    {
      step: 4,
      title: isHindi ? 'आपको कितने ऋण की आवश्यकता है?' : 'How much loan amount do you require?',
      promptAudio: isHindi 
        ? 'आपको कितने रुपये ऋण की आवश्यकता है: एक लाख, तीन लाख, पांच लाख या दस लाख?' 
        : 'How much loan do you need: 1 Lakh, 3.5 Lakh, 5 Lakh, or 10 Lakh?',
      options: [
        { label: isHindi ? '₹1.4 लाख (माइक्रो-क्रेडिट)' : '₹1.4 Lakh (Micro-credit)', value: 140000, keywords: ['एक लाख', 'सवा लाख', 'डेढ़', '1.4'] },
        { label: isHindi ? '₹3.5 लाख (लघु व्यवसाय)' : '₹3.5 Lakh (Small Shop)', value: 350000, keywords: ['तीन लाख', 'साढ़े तीन', 'four', '3.5'] },
        { label: isHindi ? '₹5.0 लाख (उद्यम ऋण)' : '₹5.0 Lakh (Enterprise)', value: 500000, keywords: ['पांच लाख', 'five', '5'] },
        { label: isHindi ? '₹15.0 लाख (टर्म लोन)' : '₹15.0 Lakh (Term Loan)', value: 1500000, keywords: ['दस लाख', 'पंद्रह लाख', 'ten', '15'] }
      ]
    }
  ];

  const currentQ = questions[currentStep - 1];

  // Auto-play voice prompt when step changes
  useEffect(() => {
    if (isOpen && currentQ) {
      playPrompt();
    }
    return () => {
      VoiceService.stopSpeaking();
      if (stopListeningFn) stopListeningFn();
    };
  }, [currentStep, isOpen]);

  const playPrompt = () => {
    setIsSpeaking(true);
    VoiceService.speak(
      currentQ.promptAudio, 
      speechCode,
      () => setIsSpeaking(false)
    );
  };

  const handleStartListening = () => {
    VoiceService.stopSpeaking();
    setIsSpeaking(false);
    setIsListening(true);
    setTranscript('');

    const stop = VoiceService.listen(
      speechCode,
      (spokenText) => {
        setTranscript(spokenText);
        parseSpokenInput(spokenText);
        setIsListening(false);
      },
      (err) => {
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    setStopListeningFn(() => stop);
  };

  const parseSpokenInput = (text: string) => {
    const lower = text.toLowerCase();
    for (const opt of currentQ.options) {
      if (opt.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
        handleSelectOption(opt.value);
        return;
      }
    }
  };

  const handleSelectOption = (value: any) => {
    if (currentStep === 1) {
      onUpdateProfile({ category: value as BeneficiaryCategory });
    } else if (currentStep === 2) {
      const p = value as ProjectPurpose;
      onUpdateProfile({ 
        purpose: p,
        gender: p === 'WOMEN_MICROCREDIT' ? 'FEMALE' : profile.gender
      });
    } else if (currentStep === 3) {
      onUpdateProfile({ annualFamilyIncome: Number(value) });
    } else if (currentStep === 4) {
      const amt = Number(value);
      onUpdateProfile({ 
        loanAmountRequested: amt,
        projectCost: Math.round(amt * 1.15)
      });
    }

    // Advance or finish
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      VoiceService.speak(
        isHindi ? 'धन्यवाद! आपकी पात्रता की गणना की जा रही है।' : 'Thank you! Calculating your scheme recommendations.',
        isHindi ? 'hi-IN' : 'en-IN',
        () => {
          onComplete();
          onClose();
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-sans">
                {isHindi ? 'बोलकर बताएं — ध्वनि सहायक' : 'Voice-Guided Onboarding'}
              </h3>
              <p className="text-xs text-slate-500">
                {isHindi ? 'कम साक्षरता एवं दृष्टि दिव्यांगजनों हेतु विशेष सुलभ सुविधा' : 'Accessible audio-guided onboarding for low-literacy beneficiaries'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              VoiceService.stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-2 my-4">
          {questions.map((q) => (
            <div
              key={q.step}
              className={`h-2 rounded-full transition-all duration-300 ${
                q.step === currentStep 
                  ? 'w-8 bg-emerald-600' 
                  : q.step < currentStep 
                  ? 'w-2 bg-emerald-300' 
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Active Question Title & Speaker button */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 mb-6 text-center relative">
          <button
            onClick={playPrompt}
            className={`absolute top-3 right-3 p-2 rounded-full border transition ${
              isSpeaking 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300 animate-spin' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Re-play audio prompt"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
            {isHindi ? `प्रश्न ${currentStep} / ${questions.length}` : `Question ${currentStep} of ${questions.length}`}
          </span>
          <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            {currentQ.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1 italic">
            "{currentQ.promptAudio}"
          </p>
        </div>

        {/* Big Tap-friendly Card Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelectOption(opt.value)}
              className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition flex items-center justify-between group shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition">
                  {i + 1}
                </div>
                <span className="font-semibold text-sm text-slate-800 group-hover:text-emerald-900">
                  {opt.label}
                </span>
              </div>
              <Check className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>

        {/* Live Mic Action Section */}
        <div className="flex flex-col items-center justify-center pt-2 pb-2">
          <button
            onClick={isListening ? () => { if (stopListeningFn) stopListeningFn(); setIsListening(false); } : handleStartListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition transform active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <p className="text-xs font-semibold text-slate-600 mt-3 flex items-center space-x-1.5">
            {isListening ? (
              <span className="text-rose-600 animate-pulse font-bold">
                ● {isHindi ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now'}
              </span>
            ) : (
              <span>
                {isHindi ? 'माइक दबाकर बोलें या ऊपर दिए कार्ड छूकर चुनें' : 'Tap mic to speak or select a card above'}
              </span>
            )}
          </p>

          {transcript && (
            <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              "{transcript}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
