import React, { useState, useRef, useEffect } from 'react';
import { Globe2, Check, Search, ChevronDown } from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES, LanguageMeta } from '../../services/i18nService';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onSelectLanguage: (language: Language) => void;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentMeta = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: Language) => {
    onSelectLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all shadow-xs cursor-pointer ${
          isOpen
            ? 'bg-slate-800 text-white border-orange-500 ring-2 ring-orange-500/20'
            : 'bg-slate-800/95 hover:bg-slate-700 text-slate-100 border-slate-700 hover:border-slate-600'
        }`}
        title="Change Language (भाषा बदलें)"
        aria-expanded={isOpen}
      >
        <Globe2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span className="font-semibold text-xs tracking-wide">
          {currentMeta.nativeName}
          {!compact && currentMeta.code !== 'en' && (
            <span className="text-slate-400 font-normal ml-1 text-[11px]">({currentMeta.name})</span>
          )}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Multilingual Selection Modal / Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-900/20 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <Globe2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Select Language (भाषा चुनें)</h4>
                <p className="text-[10px] text-slate-500">11 Major Official Languages of India</p>
              </div>
            </div>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              Pan-India
            </span>
          </div>

          {/* Quick Search */}
          <div className="px-3 pt-2.5 pb-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language / भाषा खोजें..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100/80 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Languages Grid */}
          <div className="max-h-72 overflow-y-auto px-2 py-1 space-y-1">
            {filteredLanguages.map((lang: LanguageMeta) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-orange-50/90 text-orange-950 font-bold border border-orange-200/80 shadow-2xs'
                      : 'hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected 
                        ? 'bg-orange-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}>
                      {lang.nativeName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{lang.nativeName}</span>
                        <span className="text-xs text-slate-500 font-medium">({lang.name})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">{lang.region}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-500">
                No language found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-3 pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Voice & text adapts automatically</span>
            <span className="text-orange-600 font-medium">MoSJE Accessible</span>
          </div>

        </div>
      )}
    </div>
  );
};
