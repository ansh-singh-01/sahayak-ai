import React from 'react';
import { X, Volume2, Mic, Play, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { SpeechSettings } from '../../hooks/useSpeech';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SpeechSettings;
  onUpdateSettings: (newSettings: SpeechSettings) => void;
  voices: SpeechSynthesisVoice[];
  onTestVoice: (text: string) => void;
  speechSupported: {
    recognition: boolean;
    synthesis: boolean;
  };
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  voices,
  onTestVoice,
  speechSupported,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Voice & Speech Engine Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure Speech-to-Text (STT) & Natural Audio Playback (TTS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Diagnostic Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              {speechSupported.recognition ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              <div className="text-xs">
                <p className="font-bold text-slate-800">Voice Typing (STT)</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {speechSupported.recognition ? 'Supported & Ready' : 'Unavailable in browser'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {speechSupported.synthesis ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              <div className="text-xs">
                <p className="font-bold text-slate-800">Audio Speech (TTS)</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {speechSupported.synthesis ? 'Supported & Ready' : 'Unavailable in browser'}
                </p>
              </div>
            </div>
          </div>

          {/* Auto Speak Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 border border-orange-100">
            <div className="space-y-0.5">
              <label className="text-xs sm:text-sm font-bold text-slate-900">
                Auto-read AI Responses Aloud
              </label>
              <p className="text-[11px] text-slate-500">
                Automatically narrate answers when generated for hands-free access
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, autoSpeak: !settings.autoSpeak })}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.autoSpeak ? 'bg-orange-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>Text-to-Speech Voice</span>
              <span className="text-xs text-slate-400 font-normal">{voices.length} voices found</span>
            </label>
            <select
              value={settings.selectedVoiceURI}
              onChange={(e) => onUpdateSettings({ ...settings, selectedVoiceURI: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Default Language Voice (Automatic)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed / Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-800">Speaking Speed</span>
              <span className="text-xs text-orange-600 font-mono font-bold">{settings.rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.rate}
              onChange={(e) => onUpdateSettings({ ...settings, rate: parseFloat(e.target.value) })}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Slow (0.5x)</span>
              <span>Normal (1.0x)</span>
              <span>Fast (2.0x)</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-800">Voice Pitch</span>
              <span className="text-xs text-orange-600 font-mono font-bold">{settings.pitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={settings.pitch}
              onChange={(e) => onUpdateSettings({ ...settings, pitch: parseFloat(e.target.value) })}
              className="w-full accent-orange-600 cursor-pointer"
            />
          </div>

          {/* Test Voice Sample Button */}
          <div className="pt-2">
            <button
              onClick={() => onTestVoice('नमस्ते! मैं सामाजिक न्याय मंत्रालय का सहायक AI सलाहकार हूँ।')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 hover:from-orange-100 hover:to-amber-100 font-bold text-xs border border-orange-200 transition-colors shadow-xs"
            >
              <Play className="w-4 h-4 text-orange-600" />
              <span>Test Audio Sample ("नमस्ते! मैं सहायक AI हूँ...")</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP Act compliant local audio processing</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors shadow-xs"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
