import { useState, useEffect, useRef, useCallback } from 'react';
import { getBestVoice } from '../lib/accessibility/speak';

// Web Speech Recognition API type declarations for browsers
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export interface SpeechSettings {
  autoSpeak: boolean;
  rate: number;
  pitch: number;
  selectedVoiceURI: string;
}

export function useSpeech(currentLanguageSpeechCode: string = 'hi-IN') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechSupported, setSpeechSupported] = useState({
    recognition: false,
    synthesis: false,
  });

  const [settings, setSettings] = useState<SpeechSettings>(() => {
    try {
      const saved = localStorage.getItem('sahayak_speech_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      autoSpeak: false,
      rate: 1.0,
      pitch: 1.0,
      selectedVoiceURI: '',
    };
  });

  const recognitionRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Save settings changes
  useEffect(() => {
    try {
      localStorage.setItem('sahayak_speech_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Initialize Speech Synthesis and Speech Recognition
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const hasRecognition = Boolean(SpeechRecognitionClass);
    const hasSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;

    setSpeechSupported({
      recognition: hasRecognition,
      synthesis: hasSynthesis,
    });

    if (hasSynthesis) {
      const updateVoices = () => {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (hasSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Start Speech Recognition (Voice Input)
  const startListening = useCallback(
    (onResultCallback?: (text: string) => void) => {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      // If already speaking, cancel TTS
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = currentLanguageSpeechCode || 'hi-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);

          if (event.results[0].isFinal && onResultCallback) {
            onResultCallback(currentTranscript);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    },
    [currentLanguageSpeechCode]
  );

  // Stop Speech Recognition
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  // Clean text from markdown formatting, emojis, and symbols for natural TTS speech
  const cleanMarkdownForSpeech = (text: string): string => {
    return text
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/`([^`]+)`/g, '$1') // inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link text only
      .replace(/^#{1,6}\s+/gm, '') // headers
      .replace(/[*_~#>-]/g, ' ') // bold/italic/quotes
      .replace(/•|·|▪|▫/g, ' ') // bullet dots
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // common emojis (🌸, 🛡️, 💰, etc.)
      .replace(/[\u{2600}-\u{27BF}]/gu, '') // miscellaneous symbols
      .replace(/₹\s*/g, 'Rupees ')
      .replace(/%/g, ' percent ')
      .replace(/p\.a\./gi, 'per annum')
      .replace(/\bEMI\b/g, 'E M I')
      .replace(/\bMoSJE\b/gi, 'MoSJE')
      .replace(/\bNSFDC\b/g, 'N S F D C')
      .replace(/\bNBCFDC\b/g, 'N B C F D C')
      .replace(/\bNSKFDC\b/g, 'N S K F D C')
      .replace(/\bSCA\b/g, 'S C A')
      .replace(/\bDPR\b/g, 'D P R')
      .replace(/\bDBT\b/g, 'D B T')
      .replace(/\bSUY\b/g, 'S U Y')
      .replace(/\bSRMS\b/g, 'S R M S')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Text to Speech playback
  const speakText = useCallback(
    (rawText: string, langCode: string = currentLanguageSpeechCode, onComplete?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (onComplete) onComplete();
        return;
      }

      const textToSpeak = cleanMarkdownForSpeech(rawText);
      if (!textToSpeak) {
        if (onComplete) onComplete();
        return;
      }

      // Cancel current speaking
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;

      // Match voice
      const allVoices = window.speechSynthesis.getVoices();
      let matchedVoice: SpeechSynthesisVoice | undefined;

      if (settings.selectedVoiceURI) {
        matchedVoice = allVoices.find((v) => v.voiceURI === settings.selectedVoiceURI);
      }

      if (!matchedVoice && langCode) {
        const { voice } = getBestVoice(allVoices, langCode);
        matchedVoice = voice;
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang;
      } else {
        utterance.lang = langCode || 'hi-IN';
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (onComplete) onComplete();
      };

      activeUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [currentLanguageSpeechCode, settings]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    }
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    voices,
    speechSupported,
    settings,
    setSettings,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
  };
}
