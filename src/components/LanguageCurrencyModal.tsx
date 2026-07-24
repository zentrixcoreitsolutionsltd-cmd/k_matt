import React, { useState, useEffect } from 'react';
import { Globe, DollarSign, Check, X, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { CURRENCIES, LANG_TO_CURRENCY, CURRENCY_TO_LANG, getGlobalCurrency, setGlobalCurrency } from '../data/catalog';
import { getGlobalLang, setGlobalLang, applyGoogleTranslate, t } from '../data/i18n';

interface LanguageCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧', defaultCurrency: 'KES' },
  { code: 'sw', label: 'Kiswahili', native: 'Kiswahili', flag: '🇰🇪', defaultCurrency: 'KES' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷', defaultCurrency: 'EUR' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪', defaultCurrency: 'EUR' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸', defaultCurrency: 'EUR' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦', defaultCurrency: 'SAR' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', defaultCurrency: 'INR' },
  { code: 'zh-CN', label: 'Chinese', native: '中文 (简体)', flag: '🇨🇳', defaultCurrency: 'CNY' },
];

export const LanguageCurrencyModal: React.FC<LanguageCurrencyModalProps> = ({
  isOpen,
  onClose,
  onChanged
}) => {
  const [selectedLang, setSelectedLang] = useState(() => getGlobalLang());
  const [selectedCurrency, setSelectedCurrency] = useState(() => getGlobalCurrency());
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSelectedLang(getGlobalLang());
      setSelectedCurrency(getGlobalCurrency());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectLang = (langCode: string) => {
    setSelectedLang(langCode);
    applyGoogleTranslate(langCode);

    if (autoSync) {
      const matchCurr = LANG_TO_CURRENCY[langCode] || 'KES';
      setSelectedCurrency(matchCurr);
      setGlobalCurrency(matchCurr);
    }

    if (onChanged) onChanged();
  };

  const handleSelectCurrency = (currCode: string) => {
    setSelectedCurrency(currCode);
    setGlobalCurrency(currCode);

    if (autoSync) {
      const matchLang = CURRENCY_TO_LANG[currCode];
      if (matchLang && matchLang !== selectedLang) {
        setSelectedLang(matchLang);
        applyGoogleTranslate(matchLang);
      }
    }

    if (onChanged) onChanged();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-plum/15 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-plum dark:bg-gray-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-yellow shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                <span>{t('language_currency')}</span>
                <span className="text-[10px] bg-yellow text-gray-950 px-2 py-0.5 rounded-full font-black uppercase">
                  Global
                </span>
              </h3>
              <p className="text-xs text-gray-300 font-medium">
                Customize your shopping language & live currency exchange rates
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Section 1: Choose Language */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-plum dark:text-pink-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-plum dark:text-pink-400" />
                <span>Select Language</span>
              </label>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                8 Languages Available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLang(lang.code)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-plum/10 dark:bg-pink-950/40 border-plum dark:border-pink-500 text-plum dark:text-pink-300 shadow-sm ring-1 ring-plum/20'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-750 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs sm:text-sm leading-tight truncate">
                          {lang.native}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {lang.label}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-plum dark:bg-pink-500 text-white flex items-center justify-center shrink-0 ml-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Choose Currency */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-black uppercase tracking-wider text-plum dark:text-yellow flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-plum dark:text-yellow" />
                <span>Select Currency & Cost</span>
              </label>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                Live Conversion Rate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {Object.values(CURRENCIES).map((curr) => {
                const isSelected = selectedCurrency === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => handleSelectCurrency(curr.code)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-300 shadow-sm ring-1 ring-amber-500/20'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-750 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{curr.flag}</span>
                      <div className="min-w-0">
                        <p className="font-black text-xs sm:text-sm leading-tight truncate flex items-center gap-1">
                          <span>{curr.code}</span>
                          <span className="text-amber-600 dark:text-amber-400 font-extrabold">({curr.symbol})</span>
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                          {curr.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center font-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {curr.symbol}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sync & Helper Callout */}
          <div className="p-3 bg-plum/5 dark:bg-gray-800 rounded-xl border border-plum/10 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-plum dark:text-yellow shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Match Currency & Language Automatically
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Selecting USD automatically sets English, EUR sets French/German/Spanish, etc.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoSync(!autoSync)}
              className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                autoSync ? 'bg-plum dark:bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  autoSync ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
            <span>Active:</span>
            <strong className="text-plum dark:text-pink-400 font-extrabold">
              {LANGUAGES.find(l => l.code === selectedLang)?.flag} {selectedLang.toUpperCase()}
            </strong>
            <span>•</span>
            <strong className="text-amber-600 dark:text-yellow font-extrabold">
              {CURRENCIES[selectedCurrency]?.code} ({CURRENCIES[selectedCurrency]?.symbol})
            </strong>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-plum hover:bg-plum-dark text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <span>Done</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
