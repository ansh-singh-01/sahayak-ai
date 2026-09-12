// Audio-First Accessibility Utility (PRD §2)
// Browser-native wrapper around Web Speech API SpeechSynthesisUtterance
// with robust multilingual voice resolution (Hindi, Marathi, English, etc.)

const LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
  pa: 'pa-IN',
  ml: 'ml-IN',
  or: 'or-IN'
};

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Resolves the best available speech synthesis voice for the target language.
 * - For English ('en'): Prioritizes Indian English (en-IN), then any English voice.
 * - For Hindi ('hi'): Prioritizes Hindi voices (Google हिन्दी, Microsoft Swara, hi-IN, etc.).
 * - For Indic languages ('mr', 'gu', etc.): Uses native voice if installed, otherwise
 *   gracefully falls back to Hindi voice (hi-IN) because Hindi TTS articulates Devanagari
 *   and Indic phonetics naturally, whereas English voices produce unintelligible gibberish.
 */
export function getBestVoice(
  voices: SpeechSynthesisVoice[],
  langCode: string
): { voice: SpeechSynthesisVoice | undefined; resolvedLang: string } {
  const targetLocale = LOCALE_MAP[langCode] || langCode || 'en-IN';
  const prefix = (langCode || 'en').split('-')[0].toLowerCase();
  const isEnglish = prefix === 'en';

  if (!voices || voices.length === 0) {
    return { voice: undefined, resolvedLang: targetLocale };
  }

  if (isEnglish) {
    // 1. Indian English voice
    const enInVoice = voices.find((v) => {
      const l = v.lang.toLowerCase().replace('_', '-');
      return (
        l === 'en-in' ||
        (l.startsWith('en') && /india|heera|neerja|ravi/i.test(v.name))
      );
    });
    if (enInVoice) return { voice: enInVoice, resolvedLang: enInVoice.lang };

    // 2. Any English voice
    const anyEnVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('en') || /english/i.test(v.name)
    );
    if (anyEnVoice) return { voice: anyEnVoice, resolvedLang: anyEnVoice.lang };

    // 3. Fallback default
    const defVoice = voices.find((v) => v.default) || voices[0];
    return { voice: defVoice, resolvedLang: defVoice?.lang || 'en-IN' };
  }

  // --- Indic Language Routing (Hindi, Marathi, Gujarati, etc.) ---
  // 1. Check for exact voice matching the specific language code (e.g. 'mr-IN' or 'mr')
  const exactVoice = voices.find((v) => {
    const l = v.lang.toLowerCase().replace('_', '-');
    return (
      l === targetLocale.toLowerCase() ||
      l.startsWith(prefix) ||
      (prefix === 'mr' && /marathi|मराठी/i.test(v.name)) ||
      (prefix === 'gu' && /gujarati|ગુજરાતી/i.test(v.name)) ||
      (prefix === 'bn' && /bengali|বাংলা/i.test(v.name)) ||
      (prefix === 'ta' && /tamil|தமிழ்/i.test(v.name)) ||
      (prefix === 'te' && /telugu|తెలుగు/i.test(v.name))
    );
  });
  if (exactVoice && prefix !== 'hi') {
    return { voice: exactVoice, resolvedLang: exactVoice.lang };
  }

  // 2. Hindi Voice (Primary for 'hi', and essential fallback for 'mr'/other Indic when no native voice is installed)
  const hindiVoice = voices.find((v) => {
    const l = v.lang.toLowerCase().replace('_', '-');
    return (
      l === 'hi-in' ||
      l.startsWith('hi') ||
      /hindi|हिन्दी|swara|madhur|kalpana|hemant/i.test(v.name)
    );
  });
  if (hindiVoice) {
    return { voice: hindiVoice, resolvedLang: hindiVoice.lang || 'hi-IN' };
  }

  // 3. If exact voice was found earlier, use that
  if (exactVoice) {
    return { voice: exactVoice, resolvedLang: exactVoice.lang };
  }

  // 4. Any Indian locale voice
  const anyIndianVoice = voices.find(
    (v) => /india/i.test(v.name) || v.lang.toLowerCase().includes('-in')
  );
  if (anyIndianVoice) {
    return { voice: anyIndianVoice, resolvedLang: anyIndianVoice.lang };
  }

  // 5. Fallback to default
  const fallback = voices.find((v) => v.default) || voices[0];
  return { voice: fallback, resolvedLang: targetLocale };
}

export const speakQuestion = (
  text: string, 
  langCode: string = 'en', 
  onEnd?: () => void
): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  const doSpeak = (voices: SpeechSynthesisVoice[]) => {
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clear cognitive comprehension
      utterance.pitch = 1.0;

      const { voice: matchedVoice, resolvedLang } = getBestVoice(voices, langCode);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || resolvedLang;
      } else {
        utterance.lang = resolvedLang;
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      if (onEnd) onEnd();
    }
  };

  const voices = loadVoices();
  if (voices && voices.length > 0) {
    doSpeak(voices);
  } else {
    // Chrome/Edge voice initialization is asynchronous. Wait briefly if voices not yet populated.
    let resolved = false;
    const onVoicesChanged = () => {
      if (resolved) return;
      resolved = true;
      const vList = loadVoices();
      doSpeak(vList);
    };

    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged, { once: true });
    } else {
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    }

    // Safety timeout: don't hang if voiceschanged doesn't trigger
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        doSpeak(loadVoices());
      }
    }, 150);
  }
};

export const stopSpeaking = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};

export const isSpeaking = (): boolean => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};
