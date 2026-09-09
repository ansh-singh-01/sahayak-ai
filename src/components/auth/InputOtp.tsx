import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, RotateCw, CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../../services/i18nService';

interface InputOtpProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  phone: string;
  onResend: () => void;
  onVerify: (otp?: string) => void;
  onComplete?: (otp: string) => void;
  simulatedOtp?: string;
  isVerifying?: boolean;
  language: Language;
}

export const InputOtp: React.FC<InputOtpProps> = ({
  value,
  onChange,
  length = 6,
  phone,
  onResend,
  onVerify,
  onComplete,
  simulatedOtp = '123456',
  isVerifying = false,
  language
}) => {
  const isHindi = language === 'hi';
  const [seconds, setSeconds] = useState(30);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 30-Second Countdown Timer (per input-otp-2 spec)
  useEffect(() => {
    if (seconds === 0) return;
    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleResendClick = () => {
    if (seconds > 0) return;
    setSeconds(30);
    onResend();
  };

  // Convert string value to array of characters
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  // Handle digit change in individual slot
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleaned = rawVal.replace(/\D/g, '');
    if (!cleaned) {
      // Clear current digit
      const next = digits.slice();
      next[index] = '';
      const newVal = next.join('');
      onChange(newVal);
      return;
    }

    // Handle single digit input
    const char = cleaned[cleaned.length - 1];
    const next = digits.slice();
    next[index] = char;
    const newVal = next.join('');
    onChange(newVal);

    // Auto-advance focus to next slot
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    if (newVal.length === length && onComplete) {
      onComplete(newVal);
    }
  };

  // Handle keyboard navigation (Enter to verify, Backspace & Arrow Keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentDigits = digits.slice();
      if (e.currentTarget.value) {
        currentDigits[index] = e.currentTarget.value;
      }
      const otpCode = currentDigits.join('');
      if (otpCode.length === length && !isVerifying) {
        onChange(otpCode);
        onVerify(otpCode);
      } else if (value.length === length && !isVerifying) {
        onVerify(value);
      }
      return;
    }

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear previous slot
        const next = digits.slice();
        next[index - 1] = '';
        onChange(next.join(''));
        inputsRef.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  // Handle clipboard paste across slots
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const targetIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[targetIdx]?.focus();
    setActiveIndex(targetIdx);

    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }
  };

  const handleAutoFill = () => {
    onChange(simulatedOtp);
    inputsRef.current[length - 1]?.focus();
    setActiveIndex(length - 1);
    if (onComplete) {
      onComplete(simulatedOtp);
    }
  };

  return (
    <div 
      className="space-y-4 p-5 rounded-2xl bg-orange-50/50 border-2 border-orange-200 animate-in fade-in duration-200"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (value.length === length && !isVerifying) {
            onVerify(value);
          }
        }
      }}
    >
      
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            {isHindi ? 'सुरक्षित 6-अंकीय ओटीपी दर्ज करें' : 'Verify Mobile OTP'}
          </label>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isHindi ? 'ओटीपी भेजा गया:' : 'Verification code sent to'} <strong className="text-slate-800">+91 {phone}</strong>
          </p>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          MoSJE Verified SMS
        </span>
      </div>

      {/* 6-Slot OTP Input Group (Referencing input-otp-2 architecture) */}
      <div className="flex justify-between gap-1.5 sm:gap-2.5">
        {digits.map((digit, idx) => {
          const isActive = idx === activeIndex;
          const isFilled = Boolean(digit);

          return (
            <input
              key={idx}
              ref={el => { inputsRef.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoComplete="one-time-code"
              onFocus={() => setActiveIndex(idx)}
              onChange={e => handleChange(idx, e)}
              onKeyDown={e => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-11 sm:w-13 h-13 sm:h-14 rounded-xl text-center font-mono text-xl sm:text-2xl font-black transition-all outline-none border shadow-xs ${
                isActive
                  ? 'border-orange-500 ring-4 ring-orange-500/20 bg-white text-orange-950 scale-105'
                  : isFilled
                  ? 'border-slate-300 bg-white text-slate-900'
                  : 'border-slate-200 bg-slate-50/80 text-slate-400'
              }`}
            />
          );
        })}
      </div>

      {/* Resend Countdown & Fast Testing Auto-Fill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 pt-1">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 text-[11px]">
            {seconds > 0
              ? `${isHindi ? 'पुनः भेजें' : 'Resend in'} 00:${seconds.toString().padStart(2, '0')}`
              : (isHindi ? 'ओटीपी नहीं मिला?' : "Didn't receive code?")}
          </span>

          <button
            type="button"
            onClick={handleResendClick}
            disabled={seconds > 0}
            className={`font-bold transition flex items-center space-x-1 ${
              seconds > 0
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-orange-600 hover:text-orange-700 underline cursor-pointer'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${seconds > 0 ? '' : 'text-orange-600'}`} />
            <span>{isHindi ? 'ओटीपी पुनः भेजें' : 'Resend OTP'}</span>
          </button>
        </div>

        {/* ⚡ Demo Auto-Fill (Fast evaluation helper for juries) */}
        {simulatedOtp && (
          <button
            type="button"
            onClick={handleAutoFill}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-orange-700 font-bold text-[11px] transition shadow-2xs flex items-center space-x-1"
            title="Auto-fill OTP for fast SIH judging evaluation"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>⚡ {isHindi ? 'स्वतः भरें' : 'Auto-Fill'} ({simulatedOtp})</span>
          </button>
        )}
      </div>

      {/* Verify & Proceed Button */}
      <button
        type="button"
        id="verify-otp-btn"
        onClick={() => onVerify(value)}
        disabled={value.length < length || isVerifying}
        className={`w-full py-3 rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer select-none ${
          value.length === length && !isVerifying
            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 active:scale-98'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
        title={isHindi ? 'प्रवेश करने के लिए कीबोर्ड पर Enter दबाएं' : 'Press Enter on keyboard to log in'}
      >
        {isVerifying ? (
          <span className="flex items-center space-x-2">
            <RotateCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
            <span>{isHindi ? 'सत्यापित हो रहा है...' : 'Verifying OTP & Logging In...'}</span>
          </span>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isHindi ? 'ओटीपी सत्यापित करें एवं प्रवेश करें' : 'Verify OTP & Log In'}</span>
            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 shadow-2xs">
              Enter ↵
            </kbd>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5 shrink-0" />
          </>
        )}
      </button>

    </div>
  );
};
