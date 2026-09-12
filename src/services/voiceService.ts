import { getBestVoice } from '../lib/accessibility/speak';

// Web Speech API interfaces for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class VoiceService {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static recognition: any = null;

  /**
   * Checks if speech synthesis is available
   */
  public static isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Checks if speech recognition is available
   */
  public static isRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  /**
   * Speak prompt aloud using SpeechSynthesis
   */
  public static speak(text: string, lang: string = 'hi-IN', onEnd?: () => void): void {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = this.synth.getVoices();
      const { voice: matchedVoice, resolvedLang } = getBestVoice(voices, lang);
      if (matchedVoice) {
        utterance.voice = matchedVoice;
        utterance.lang = matchedVoice.lang || resolvedLang;
      } else {
        utterance.lang = resolvedLang || lang;
      }

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      if (onEnd) onEnd();
    }
  }

  /**
   * Stop speaking
   */
  public static stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Listen for user speech
   */
  public static listen(
    lang: string,
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): () => void {
    if (!this.isRecognitionSupported()) {
      onError(new Error('Speech recognition not supported in this browser.'));
      onEnd();
      return () => {};
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRec();
    this.recognition.lang = lang;
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      onError(event.error);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Failed to start recognition:', e);
      onError(e);
      onEnd();
    }

    return () => {
      if (this.recognition) {
        try {
          this.recognition.stop();
        } catch (e) {}
      }
    };
  }
}
