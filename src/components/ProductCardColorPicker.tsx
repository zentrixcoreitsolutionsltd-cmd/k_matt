import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, ChevronDown, Info } from 'lucide-react';
import { CARD_COLOR_THEMES, CardColorThemeId } from '../utils/productCardColors';

interface ProductCardColorPickerProps {
  currentTheme: CardColorThemeId;
  onChangeTheme: (theme: CardColorThemeId) => void;
  showCategoryBadges?: boolean;
  onToggleCategoryBadges?: () => void;
}

export default function ProductCardColorPicker({
  currentTheme,
  onChangeTheme,
  showCategoryBadges = true,
  onToggleCategoryBadges,
}: ProductCardColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const activeThemeObj = CARD_COLOR_THEMES[currentTheme] || CARD_COLOR_THEMES.category;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-250 hover:border-plum/50 text-gray-800 text-xs font-black px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer group"
        title="Change Product Card Color Theme"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-plum group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 hidden xs:inline">
            Card Colors:
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              className={`w-3 h-3 rounded-full shadow-xs ${activeThemeObj.swatchBg} ring-1 ring-black/10`}
            />
            <span className="text-gray-800 font-black text-xs">
              {activeThemeObj.name.split(' ')[0]}
            </span>
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-gray-150 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-plum/10 text-plum flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-xs text-gray-900">Product Card Colors</h4>
                <p className="text-[10px] text-gray-500 font-medium">Select storefront card color theme</p>
              </div>
            </div>
            <span className="text-[9px] bg-plum/10 text-plum font-black px-2 py-0.5 rounded-full uppercase">
              Live Preview
            </span>
          </div>

          {/* Theme Options */}
          <div className="space-y-1.5">
            {(Object.keys(CARD_COLOR_THEMES) as CardColorThemeId[]).map((themeKey) => {
              const theme = CARD_COLOR_THEMES[themeKey];
              const isSelected = currentTheme === themeKey;

              return (
                <button
                  key={themeKey}
                  type="button"
                  onClick={() => {
                    onChangeTheme(themeKey);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-plum bg-plum/5 shadow-xs'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex-shrink-0 ${theme.swatchBg} shadow-xs ring-2 ${
                        isSelected ? 'ring-plum ring-offset-1 ring-offset-white' : 'ring-black/10'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-900 leading-tight truncate">
                        {theme.name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate leading-snug">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-plum text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Category Department Badges Toggle */}
          {onToggleCategoryBadges && (
            <div className="mt-3 pt-3 border-t border-gray-150 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-black text-gray-700">
                  Category Color Badges
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleCategoryBadges}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showCategoryBadges ? 'bg-plum' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    showCategoryBadges ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Mini info badge */}
          <div className="mt-3 text-[10px] text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            <span>Theme applies immediately to product shelves & cards.</span>
          </div>
        </div>
      )}
    </div>
  );
}
