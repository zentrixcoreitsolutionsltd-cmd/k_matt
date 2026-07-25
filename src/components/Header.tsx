import React, { useState, useEffect } from 'react';
import { 
  Phone, MapPin, Truck, Lock, Menu, Search, User, Heart, ShoppingCart, 
  X, LayoutGrid, LogOut, Store, ArrowRight, Mic, MicOff, Sun, Moon,
  ChevronDown, HelpCircle, ShieldCheck, Tag, Sparkles, ChevronRight, Globe
} from 'lucide-react';
import { StoreSettings, CategoryMeta } from '../types';
import { categoryMeta, formatMoney, CURRENCIES, LANG_TO_CURRENCY, CURRENCY_TO_LANG, getGlobalCurrency, setGlobalCurrency } from '../data/catalog';
import { getGlobalLang, setGlobalLang, applyGoogleTranslate, t } from '../data/i18n';
import { KENYA_COUNTIES } from '../data/counties';
import { LanguageCurrencyModal } from './LanguageCurrencyModal';

interface HeaderProps {
  settings: StoreSettings;
  currentView: 'shop' | 'admin' | 'cart';
  onViewChange: (view: 'shop' | 'admin' | 'cart') => void;
  onSearch: (query: string) => void;
  onCategorySelect: (cat: string) => void;
  onToggleCart: () => void;
  onToggleWishlist: () => void;
  cartCount: number;
  wishlistCount: number;
  deliveryLocation: string;
  onDeliveryLocationChange: (county: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleUserProfile: () => void;
}

export default function Header({
  settings,
  currentView,
  onViewChange,
  onSearch,
  onCategorySelect,
  onToggleCart,
  onToggleWishlist,
  cartCount,
  wishlistCount,
  deliveryLocation,
  onDeliveryLocationChange,
  isLoggedIn,
  onLogout,
  isDark,
  onToggleTheme,
  onToggleUserProfile
}: HeaderProps) {
  const getInitialLanguage = () => {
    return getGlobalLang();
  };

  const [selectedLang, setSelectedLang] = useState(getInitialLanguage);
  const [currentCurrency, setCurrentCurrency] = useState(getGlobalCurrency());
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');

  useEffect(() => {
    const handleCurrChange = () => setCurrentCurrency(getGlobalCurrency());
    const handleLangChange = () => setSelectedLang(getGlobalLang());
    window.addEventListener('currency-changed', handleCurrChange);
    window.addEventListener('lang-changed', handleLangChange);
    return () => {
      window.removeEventListener('currency-changed', handleCurrChange);
      window.removeEventListener('lang-changed', handleLangChange);
    };
  }, []);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
    { code: 'pt', label: 'Português', flag: '🇵🇹' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' }
  ];

  const handleLanguageChange = (langCode: string) => {
    setSelectedLang(langCode);
    
    // Automatically match cost/currency to chosen language
    const targetCurr = LANG_TO_CURRENCY[langCode] || 'KES';
    setGlobalCurrency(targetCurr);
    setCurrentCurrency(targetCurr);

    applyGoogleTranslate(langCode);
  };

  const handleCurrencyChange = (currCode: string) => {
    setGlobalCurrency(currCode);
    setCurrentCurrency(currCode);

    // Automatically match language to chosen currency
    const targetLang = CURRENCY_TO_LANG[currCode];
    if (targetLang && targetLang !== selectedLang) {
      handleLanguageChange(targetLang);
    }
  };

  const startVoiceListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not fully supported in this browser. Please try Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchVal(transcript);
        onSearch(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const selectCategory = (catKey: string) => {
    onCategorySelect(catKey);
    setSearchCategory(catKey);
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleCategoryDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setSearchCategory(cat);
    onCategorySelect(cat);
  };

  return (
    <>
      <div className="sticky top-0 z-40 w-full flex flex-col">
      {/* 1. PRIMARY AMAZON-STYLE HIGH-CONTRAST HEADER ROW */}
      <header className="bg-plum text-white py-2 shadow-md border-b border-plum-dark font-sans w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-3 lg:gap-5">
          
          {/* Top Row for Mobile, or Left/Right for Desktop */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {/* Mobile Hamburger Menu (hidden on desktop) */}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden bg-white text-plum hover:bg-gray-100 hover:text-plum cursor-pointer p-1.5 rounded-lg shrink-0 transition-colors shadow-sm flex items-center justify-center"
                aria-label="Toggle Navigation Menu"
                id="mobile-menu-trigger"
              >
                <Menu className="w-5 h-5 text-plum" />
              </button>

              {/* Amazon-Style Logo with Curved Smile Underline */}
              <div 
                onClick={() => { selectCategory('all'); onViewChange('shop'); }}
                className="flex flex-col cursor-pointer select-none shrink-0 group px-2 py-1 rounded-sm border border-transparent hover:border-white transition-all duration-150"
                id="header-logo"
              >
                <div className="flex items-baseline gap-0.5">
                  <span className="text-white font-black text-xl sm:text-2xl tracking-tighter leading-none group-hover:text-gray-100 font-sans">
                    kipchimatt
                  </span>
                  <span className="text-white text-xs font-black uppercase tracking-wider bg-white/20 px-1 py-0.5 rounded">
                    .ke
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 -mt-0.5 pl-0.5">
                  <span className="text-gray-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none">
                    Supermarket
                  </span>
                  <div className="relative w-12 sm:w-16 h-1.5 sm:h-2">
                    <svg className="absolute top-0 left-0 w-full h-full text-white" viewBox="0 0 100 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 2 Q 50 12 95 2" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M91 1 L96 3.5 L90 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-Only Quick Access Actions */}
            <div className="flex md:hidden items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Language & Currency Translator Button (Mobile Header) */}
              <button
                type="button"
                onClick={() => setLangModalOpen(true)}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/25 px-2 py-1 rounded-md text-white text-xs font-black cursor-pointer transition-all shrink-0 shadow-2xs"
                title="Change Language & Currency"
              >
                <span className="text-xs">{languages.find(l => l.code === selectedLang)?.flag || '🌐'}</span>
                <span className="text-[11px] text-white font-black uppercase">{CURRENCIES[currentCurrency]?.code || 'KES'}</span>
                <ChevronDown className="w-2.5 h-2.5 text-gray-200" />
              </button>

              {/* Theme Toggle (Mobile) */}
              <button 
                onClick={onToggleTheme}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer transition-all shrink-0"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-white" /> : <Moon className="w-3.5 h-3.5 text-gray-300" />}
              </button>

              {/* Wishlist Widget (Mobile) */}
              {currentView === 'shop' && (
                <button 
                  onClick={onToggleWishlist}
                  className="p-1.5 rounded hover:bg-white/10 text-white cursor-pointer relative shrink-0 transition-all"
                  aria-label="Wishlist"
                  title={t('wishlist')}
                >
                  <Heart className="w-4.5 h-4.5 text-white fill-white/20" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-white text-plum text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-xs">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              )}

              {/* Compact Account / Sign In Link (Mobile) */}
              {currentView === 'shop' && (
                <button 
                  onClick={onToggleUserProfile}
                  className="flex flex-col items-center justify-center px-1.5 py-0.5 text-white hover:text-gray-200 cursor-pointer shrink-0 rounded hover:bg-white/10 transition-all"
                  title={isLoggedIn ? t('hello_customer') : t('hello_sign_in')}
                >
                  <User className="w-4 h-4 text-white" />
                  <span className="text-[9px] font-bold leading-none mt-0.5 max-w-[42px] truncate">
                    {isLoggedIn ? 'Account' : 'Sign In'}
                  </span>
                </button>
              )}

              {/* Cart Widget (Mobile) */}
              {currentView === 'shop' && (
                <button 
                  onClick={onToggleCart}
                  className="flex items-center p-1.5 rounded hover:bg-white/10 cursor-pointer relative shrink-0 select-none group transition-all"
                  aria-label="Shopping Cart"
                  title={t('cart')}
                >
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-white text-plum text-[9px] font-black rounded-full px-1 min-w-[15px] text-center leading-none py-0.5 shadow-xs">
                      {cartCount}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Deliver To County Widget (Desktop only) */}
          <div 
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-white/30 cursor-pointer relative shrink-0 transition-all max-w-[140px] lg:max-w-[155px]"
            id="delivery-widget"
          >
            <MapPin className="w-4 h-4 text-white shrink-0 self-center" />
            <div className="flex flex-col text-left min-w-0 flex-1">
              <span className="text-[10px] text-gray-300 font-semibold leading-none mb-0.5">{t('deliver_to')}</span>
              <div className="relative flex items-center min-w-0 w-full">
                <select 
                  value={deliveryLocation}
                  onChange={(e) => onDeliveryLocationChange(e.target.value)}
                  className="w-full bg-transparent border-none text-white font-black text-xs outline-none cursor-pointer pr-5 appearance-none focus:ring-0 py-0 truncate"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  title="Choose Delivery Location"
                >
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c.code} value={c.name} className="text-gray-950 bg-white font-bold">
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-0 top-1/2 -translate-y-1/2 text-white pointer-events-none shrink-0" />
              </div>
            </div>
          </div>

          {/* Prominent Giant Search Bar - Desktop Only */}
          <div className="hidden md:flex flex-1 min-w-0 max-w-3xl items-center z-10 mx-2 lg:mx-4" id="search-bar-container">
            <form 
              onSubmit={handleSearchSubmit} 
              className="w-full h-10 bg-white rounded-md flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-orange border border-transparent transition-all"
            >
              {/* Left Department dropdown */}
              <select
                value={searchCategory}
                onChange={handleCategoryDropdownChange}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] lg:text-xs px-2 lg:px-3 h-full outline-none cursor-pointer font-bold border-r border-gray-300 shrink-0 max-w-[85px] lg:max-w-[135px] select-none transition-colors truncate"
                title="Select Department"
              >
                <option value="all">{t('all_departments')}</option>
                {categoryMeta.filter(cat => cat.key !== 'all').map(cat => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Central text input */}
              <input 
                type="text" 
                placeholder={t('search_placeholder')} 
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="flex-1 px-2.5 lg:px-4 h-full outline-none text-xs lg:text-sm text-gray-900 placeholder-gray-400 font-medium min-w-0"
                aria-label="Search inputs"
              />

              {/* Hands-free Voice Search mic button */}
              <button 
                type="button"
                onClick={startVoiceListening}
                className={`w-9 h-9 shrink-0 rounded-full my-auto mr-1 flex items-center justify-center cursor-pointer transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                title="Search hands-free with voice"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4.5 h-4.5" />}
              </button>

              {/* Trigger Plum search button */}
              <button 
                type="submit"
                className="h-full px-5 bg-plum hover:bg-plum-dark text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                aria-label="Submit Search Query"
              >
                <Search className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>
          </div>

          {/* Right Hand Navigation Widgets - Desktop Only */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2.5 xl:gap-3.5 shrink-0" id="header-right-actions">
            
            {/* Amazon & Kipchimatt Styled Language & Currency Selector Trigger */}
            <button
              type="button"
              onClick={() => setLangModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-98 border border-white/25 px-2.5 py-1.5 rounded-lg text-white shrink-0 transition-all cursor-pointer shadow-2xs group"
              title="Change Language & Currency"
            >
              <span className="text-sm">{languages.find(l => l.code === selectedLang)?.flag || '🌐'}</span>
              <div className="flex items-center gap-1 font-black text-xs">
                <span className="text-white tracking-wide uppercase">{selectedLang}</span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white">{CURRENCIES[currentCurrency]?.code || 'KES'} ({CURRENCIES[currentCurrency]?.symbol || 'KSh'})</span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-300 group-hover:text-white transition-colors" />
            </button>

            {/* Account & Lists panel with elegant Hover State */}
            {currentView === 'shop' && (
              <button 
                onClick={onToggleUserProfile}
                className="flex flex-col text-left px-1.5 lg:px-2 py-1 rounded-sm border border-transparent hover:border-white cursor-pointer transition-all"
                id="account-menu-trigger"
              >
                <span className="text-[10px] lg:text-[11px] text-gray-200 font-normal leading-none mb-0.5">
                  {isLoggedIn ? t('hello_customer') : t('hello_sign_in')}
                </span>
                <span className="text-[11px] lg:text-xs text-white font-black leading-none flex items-center gap-0.5">
                  Account <ChevronDown className="w-2.5 h-2.5 text-gray-200" />
                </span>
              </button>
            )}

            {/* Returns & Orders panel */}
            {currentView === 'shop' && (
              <button 
                onClick={onToggleUserProfile}
                className="hidden lg:flex flex-col text-left px-1.5 lg:px-2 py-1 rounded-sm border border-transparent hover:border-white cursor-pointer transition-all"
              >
                <span className="text-[10px] lg:text-[11px] text-gray-200 font-normal leading-none mb-0.5">Returns</span>
                <span className="text-[11px] lg:text-xs text-white font-black leading-none">& Orders</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button 
              onClick={onToggleTheme}
              className="p-1 lg:p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer transition-all shrink-0"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-gray-300" />}
            </button>

            {/* Elegant Wishlist panel */}
            {currentView === 'shop' && (
              <button 
                onClick={onToggleWishlist}
                className="flex flex-col items-center justify-center px-1.5 lg:px-2 py-1 rounded-sm border border-transparent hover:border-white cursor-pointer relative transition-all"
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 text-white fill-white/20" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-white text-plum text-[9px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Premium Giant Amazon Cart Widget */}
            {currentView === 'shop' && (
              <button 
                onClick={onToggleCart}
                className="flex items-end gap-1 px-1.5 lg:px-2 py-1 rounded-sm border border-transparent hover:border-white cursor-pointer relative shrink-0 select-none group transition-all"
                aria-label="Shopping Cart"
                id="cart-trigger-button"
              >
                <div className="relative">
                  <ShoppingCart className="w-5.5 h-5.5 text-white" />
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-white text-plum text-[10px] font-black rounded-full px-1 min-w-[16px] text-center leading-none py-0.5 shadow-sm group-hover:scale-105 transition-all duration-150">
                    {cartCount}
                  </span>
                </div>
                <span className="text-[11px] lg:text-xs text-white font-black uppercase tracking-wider self-end mb-0.5 hidden lg:inline">
                  Cart
                </span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Search Bar Row (shown ONLY on mobile/tablet screens below md) */}
        <div className="md:hidden px-3 sm:px-4 pb-2.5 pt-1 bg-plum w-full space-y-1.5" id="search-bar-container-mobile">
          {/* Quick Deliver To Location Pill for Mobile */}
          <div className="flex items-center justify-between text-white text-[11px] font-bold px-1">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="text-gray-200 font-normal shrink-0">Deliver to:</span>
              <div className="relative inline-flex items-center min-w-0">
                <select 
                  value={deliveryLocation}
                  onChange={(e) => onDeliveryLocationChange(e.target.value)}
                  className="bg-transparent text-white font-black outline-none cursor-pointer pr-4 appearance-none text-[11px] truncate max-w-[150px]"
                  title="Select Delivery County"
                >
                  {KENYA_COUNTIES.map((c) => (
                    <option key={c.code} value={c.name} className="text-gray-950 bg-white font-bold">
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-white absolute right-0 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 text-[10px] text-green-300 font-extrabold">
              <Truck className="w-3 h-3 text-white" />
              <span>Kikapu Express</span>
            </div>
          </div>

          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full h-10 bg-white rounded-md flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-orange border border-transparent transition-all shadow-xs"
          >
            {/* Mobile Department Selector */}
            <select
              value={searchCategory}
              onChange={handleCategoryDropdownChange}
              className="bg-gray-100 text-gray-800 text-[11px] px-2 h-full outline-none cursor-pointer font-bold border-r border-gray-300 shrink-0 max-w-[95px] truncate"
              title="Select Department"
            >
              <option value="all">All</option>
              {categoryMeta.filter(cat => cat.key !== 'all').map(cat => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Search text input */}
            <input 
              type="text" 
              placeholder="Search Kipchimatt Supermarket..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 px-2.5 h-full outline-none text-xs text-gray-900 placeholder-gray-400 font-medium min-w-0"
              aria-label="Search inputs"
            />

            {/* Voice Search mic button */}
            <button 
              type="button"
              onClick={startVoiceListening}
              className={`w-8 h-8 shrink-0 rounded-full my-auto mr-1 flex items-center justify-center cursor-pointer transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
              title="Search hands-free with voice"
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Trigger search button */}
            <button 
              type="submit"
              className="h-full px-3.5 bg-plum hover:bg-plum-dark text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="Submit Search Query"
            >
              <Search className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </header>

      {/* 2. SECONDARY SUB-HEADER ROW (All Categories & Quick Links - Mobile Scrollable) */}
      <nav className="bg-plum-dark text-white py-1 text-xs font-semibold flex items-center justify-between shadow-sm border-t border-white/5 select-none overflow-x-auto whitespace-nowrap scrollbar-none w-full">
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 min-w-max">
          
          {/* Navigation quick-links & Drawer Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            
            {/* Mega Menu Drawer Toggle */}
            <button 
              onClick={() => setMegaMenuOpen(true)}
              className="flex items-center gap-1.5 bg-white text-plum hover:bg-gray-100 hover:text-plum cursor-pointer transition-all font-black uppercase tracking-wider py-1 px-2.5 rounded-md shadow-sm shrink-0"
              id="mega-menu-trigger-all"
            >
              <Menu className="w-4 h-4 stroke-[2.5] text-plum" />
              <span className="text-plum">All</span>
            </button>
 
            {/* Direct Category Access Links - Scrollable on mobile & desktop */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button 
                onClick={() => selectCategory('all')} 
                className="border border-transparent hover:border-white py-1 px-2 rounded text-gray-200 hover:text-white transition-all text-[11px] sm:text-xs font-bold cursor-pointer shrink-0"
              >
                ⚡ Today's Deals
              </button>
              <button 
                onClick={() => selectCategory('fresh food')} 
                className="border border-transparent hover:border-white py-1 px-2 rounded text-gray-200 hover:text-white transition-all text-[11px] sm:text-xs font-bold cursor-pointer shrink-0"
              >
                🍏 Fresh Produce
              </button>
              <button 
                onClick={() => selectCategory('electronics')} 
                className="border border-transparent hover:border-white py-1 px-2 rounded text-gray-200 hover:text-white transition-all text-[11px] sm:text-xs font-bold cursor-pointer shrink-0"
              >
                Electricals
              </button>
              <button 
                onClick={() => selectCategory('apparel')} 
                className="hidden sm:inline-block border border-transparent hover:border-white py-1 px-2 rounded text-gray-200 hover:text-white transition-all text-[11px] sm:text-xs font-bold cursor-pointer shrink-0"
              >
                Everyday Wear
              </button>
              <button 
                onClick={() => selectCategory('liquor')} 
                className="border border-transparent hover:border-white font-bold py-1 px-2 rounded text-white transition-all text-[11px] sm:text-xs cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Tag className="w-3 h-3 text-white" />
                Liquor Cellar
              </button>
            </div>
          </div>

          {/* Right Side badging and Portal redirects */}
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] font-bold text-gray-300 shrink-0">
            
            {/* Free Delivery Threshold Alert */}
            <span className="hidden lg:flex items-center gap-1 text-green bg-green-light/10 px-2 py-0.5 rounded border border-green/20">
              <Truck className="w-3.5 h-3.5" />
              <span>Free Delivery over {formatMoney(settings.freeDeliveryThreshold)}</span>
            </span>

            {/* Admin toggle portal buttons */}
            {currentView !== 'admin' ? (
              <div className="flex items-center gap-1.5">
                {currentView === 'cart' && (
                  <button 
                    onClick={() => onViewChange('shop')}
                    className="flex items-center gap-1 hover:text-white py-1 px-2 rounded bg-white/10 text-white cursor-pointer transition-all border border-white/5 active:scale-95 shrink-0 text-[11px]"
                  >
                    <Store className="w-3 h-3" />
                    <span>Storefront</span>
                  </button>
                )}
                <button 
                  onClick={() => onViewChange('admin')}
                  className="flex items-center gap-1 hover:text-white py-1 px-2 rounded bg-white/10 text-white cursor-pointer transition-all border border-white/5 active:scale-95 shrink-0 text-[11px]"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onViewChange('shop')}
                  className="flex items-center gap-1 hover:bg-gray-100 text-slate-950 bg-white font-black py-1 px-2.5 rounded transition-all text-[11px]"
                >
                  <Store className="w-3 h-3" />
                  <span>Storefront</span>
                </button>
                {isLoggedIn && (
                  <button 
                    onClick={onLogout}
                    className="flex items-center gap-1 text-red hover:text-red-light cursor-pointer text-[11px]"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </nav>
 
      {/* 3. QUICK HORIZONTAL CATEGORIES RAIL (Sits beautifully under the subheaders) */}
      {currentView === 'shop' && (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden select-none" id="quick-category-rail">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
            {categoryMeta.map((cat) => (
              <button
                key={cat.key}
                onClick={() => selectCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full font-extrabold text-xs whitespace-nowrap transition-all cursor-pointer border ${
                  searchCategory === cat.key 
                    ? 'bg-plum text-white border-plum dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-850 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>

      {/* 4. HIGH-FIDELITY ROBUST MEGA CATEGORIES DRAWER (ALL MENU) */}
      {megaMenuOpen && (
        <>
          {/* Back Drop Overlay */}
          <div 
            onClick={() => setMegaMenuOpen(false)}
            className="fixed inset-0 bg-black/65 z-50 transition-opacity duration-300 backdrop-blur-xs"
            aria-hidden="true"
          />
          {/* Drawer Wrapper */}
          <nav 
            className="fixed top-0 left-0 w-[365px] max-w-[85%] h-full bg-white dark:bg-gray-900 shadow-2xl z-55 flex flex-col animate-slide-in font-sans overflow-hidden"
            id="mega-menu-sidebar"
          >
            {/* Drawer Header (Sign In profile banner) */}
            <div className="bg-plum text-white p-5 flex items-center justify-between sticky top-0 border-b border-plum-dark shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 border border-white/20 flex items-center justify-center p-1 overflow-hidden">
                  <User className="w-6 h-6 text-plum" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight leading-none text-white">
                    {isLoggedIn ? 'Hello, Customer' : 'Hello, Sign In'}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">Your Kipchimatt Account</p>
                </div>
              </div>
              <button 
                onClick={() => setMegaMenuOpen(false)}
                className="text-gray-300 hover:text-white cursor-pointer p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close Department Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Sub banner advertisement */}
            <div className="bg-plum-dark text-white py-3 px-5 text-[11px] font-bold flex items-center justify-between border-b border-white/5 shrink-0 select-none">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Supercharged shopping deals today!</span>
              </span>
              <span className="text-white uppercase tracking-wider text-[9px] font-black bg-white/10 px-1.5 py-0.5 rounded">HOT</span>
            </div>

            {/* Grouped Department Lists (The robust categorized mega-menu structure) */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-6">
              
              {/* SECTION: Trending */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  Trending & Deals
                </h4>
                <div className="space-y-2 text-sm font-bold text-gray-750 dark:text-gray-250">
                  <button 
                    onClick={() => { selectCategory('all'); setMegaMenuOpen(false); }}
                    className="w-full flex items-center justify-between text-left py-1.5 hover:text-plum dark:hover:text-pink-300 transition-colors"
                  >
                    <span>Today's Kikapu Chapchap Deals</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                  <button 
                    onClick={() => { selectCategory('fresh food'); setMegaMenuOpen(false); }}
                    className="w-full flex items-center justify-between text-left py-1.5 hover:text-plum dark:hover:text-pink-300 transition-colors"
                  >
                    <span>Fresh Local Farm Harvests</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                  <button 
                    onClick={() => { selectCategory('liquor'); setMegaMenuOpen(false); }}
                    className="w-full flex items-center justify-between text-left py-1.5 hover:text-plum dark:hover:text-pink-300 transition-colors"
                  >
                    <span>Premium Liquor & Spirits</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-150 dark:bg-gray-800" />

              {/* SECTION: Food & Groceries */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  Grocery, Food & Beverages
                </h4>
                <div className="space-y-1 text-sm font-bold text-gray-750 dark:text-gray-250">
                  {categoryMeta.filter(c => ['food cupboard', 'fresh food', 'beverages', 'liquor'].includes(c.key)).map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => selectCategory(cat.key)}
                      className="w-full flex items-center justify-between text-left py-2 hover:text-plum dark:hover:text-pink-300 group transition-colors"
                    >
                      <span>{cat.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-350 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-150 dark:bg-gray-800" />

              {/* SECTION: Lifestyle, Basics & Fitness */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  Lifestyle, Basics & Fitness
                </h4>
                <div className="space-y-1 text-sm font-bold text-gray-750 dark:text-gray-250">
                  {categoryMeta.filter(c => ['electronics', 'health', 'apparel', 'sports', 'books', 'beauty'].includes(c.key)).map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => selectCategory(cat.key)}
                      className="w-full flex items-center justify-between text-left py-2 hover:text-plum dark:hover:text-pink-300 group transition-colors"
                    >
                      <span>{cat.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-350 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-150 dark:bg-gray-800" />

              {/* SECTION: Household & Pet */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  Household & Hardware Essentials
                </h4>
                <div className="space-y-1 text-sm font-bold text-gray-750 dark:text-gray-250">
                  {categoryMeta.filter(c => ['cleaning', 'furniture', 'hardware', 'pet', 'baby & kids', 'stationery'].includes(c.key)).map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => selectCategory(cat.key)}
                      className="w-full flex items-center justify-between text-left py-2 hover:text-plum dark:hover:text-pink-300 group transition-colors"
                    >
                      <span>{cat.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-350 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-150 dark:bg-gray-800" />

              {/* SECTION: Help & Settings */}
              <div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">
                  Help & Settings
                </h4>
                <div className="space-y-2 text-sm font-bold text-gray-750 dark:text-gray-250">
                  <button 
                    onClick={() => { onToggleUserProfile(); setMegaMenuOpen(false); }}
                    className="w-full text-left py-1.5 hover:text-plum dark:hover:text-pink-300 transition-colors"
                  >
                    Your Profile & Settings
                  </button>
                  <button 
                    onClick={() => { onToggleUserProfile(); setMegaMenuOpen(false); }}
                    className="w-full text-left py-1.5 hover:text-plum dark:hover:text-pink-300 transition-colors"
                  >
                    Order History & Invoices
                  </button>
                  <button 
                    onClick={() => { onToggleTheme(); setMegaMenuOpen(false); }}
                    className="w-full text-left py-1.5 hover:text-plum dark:hover:text-pink-300 transition-colors"
                  >
                    {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  </button>
                  {isLoggedIn ? (
                    <button 
                      onClick={() => { onLogout(); setMegaMenuOpen(false); }}
                      className="w-full text-left py-1.5 text-red hover:text-red-light transition-colors"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button 
                      onClick={() => { onToggleUserProfile(); setMegaMenuOpen(false); }}
                      className="w-full text-left py-1.5 text-green hover:text-green-light transition-colors"
                    >
                      Sign In to Account
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Footer legalities */}
            <div className="bg-gray-50 dark:bg-gray-950 p-4 border-t border-gray-150 dark:border-gray-800 text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0 select-none">
              Kipchimatt E-Commerce Platform v2.2
            </div>
          </nav>
        </>
      )}

      {/* 5. MOBILE NAV OVERLAY SIDEBAR */}
      {mobileMenuOpen && (
        <>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-xs"
            aria-hidden="true"
          />
          <nav className="fixed top-0 left-0 w-[320px] max-w-[88%] h-full bg-white dark:bg-gray-900 shadow-2xl z-55 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-plum text-white p-4 sm:p-5 flex flex-col gap-3 relative border-b border-plum-dark shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="font-black text-sm tracking-tight leading-none text-white truncate">
                    {isLoggedIn ? 'Hello, Customer' : 'Hello, Sign In'}
                  </h2>
                  <span className="text-[10px] text-gray-200 mt-1 font-bold">Manage Account, Wishlist & Tracking</span>
                </div>
              </div>
              
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-3 text-gray-300 hover:text-white p-1 cursor-pointer rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile drawer scrollable body */}
            <div className="flex-1 overflow-y-auto py-3 flex flex-col font-bold text-sm text-gray-700 dark:text-gray-300 space-y-1">
              
              {/* Deliver To County Selection (Mobile) */}
              <div className="mx-4 mb-2 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/80 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-black text-plum dark:text-pink-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-plum dark:text-pink-400 shrink-0" />
                    <span>Delivery Location</span>
                  </span>
                  <span className="text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-bold">47 Counties</span>
                </div>
                <div className="relative w-full">
                  <select 
                    value={deliveryLocation}
                    onChange={(e) => onDeliveryLocationChange(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-black text-xs rounded-lg px-3 py-2 outline-none cursor-pointer appearance-none pr-8 shadow-2xs"
                  >
                    {KENYA_COUNTIES.map((c) => (
                      <option key={c.code} value={c.name} className="text-gray-900 dark:text-white bg-white dark:bg-gray-900 font-bold">
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Language & Currency Selection Card (Mobile Drawer) */}
              <button 
                type="button"
                onClick={() => { setLangModalOpen(true); setMobileMenuOpen(false); }}
                className="mx-4 mb-2 p-3 bg-gradient-to-r from-plum/10 via-plum/5 to-white/10 dark:from-gray-800/80 dark:to-gray-800 rounded-xl border border-plum/20 dark:border-gray-700 flex items-center justify-between text-left cursor-pointer hover:border-plum transition-all shadow-2xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-plum dark:bg-pink-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-plum dark:text-pink-300 group-hover:text-plum-dark">
                      Language & Currency
                    </p>
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <span>{languages.find(l => l.code === selectedLang)?.flag} {languages.find(l => l.code === selectedLang)?.label}</span>
                      <span>•</span>
                      <span className="text-plum dark:text-white font-extrabold">{CURRENCIES[currentCurrency]?.code} ({CURRENCIES[currentCurrency]?.symbol})</span>
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-900 text-plum dark:text-white text-[10px] font-black border border-plum/20 shrink-0">
                  Change
                </div>
              </button>

              {/* Core Links */}
              <button 
                onClick={() => { selectCategory('all'); onViewChange('shop'); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3 text-gray-800 dark:text-gray-100 cursor-pointer"
              >
                <Store className="w-4.5 h-4.5 text-plum dark:text-pink-400 shrink-0" />
                <span>Store Home</span>
              </button>

              <button 
                onClick={() => { setMegaMenuOpen(true); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-between text-gray-800 dark:text-gray-100 cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <LayoutGrid className="w-4.5 h-4.5 text-plum dark:text-pink-400 shrink-0" />
                  <span>Shop All Departments</span>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <div className="h-px bg-gray-150 dark:bg-gray-800 my-1 mx-5" />

              {/* Popular Category Shortcuts */}
              <div className="px-5 py-1">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Top Departments</span>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  <button
                    onClick={() => { selectCategory('fresh food'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-extrabold text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 hover:border-plum"
                  >
                    <span>🍏</span>
                    <span className="truncate">Fresh Produce</span>
                  </button>
                  <button
                    onClick={() => { selectCategory('liquor'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-extrabold text-white dark:text-white border border-gray-200/80 dark:border-gray-700/80 hover:border-white"
                  >
                    <span>🍷</span>
                    <span className="truncate">Liquor Cellar</span>
                  </button>
                  <button
                    onClick={() => { selectCategory('food cupboard'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-extrabold text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 hover:border-plum"
                  >
                    <span>🛒</span>
                    <span className="truncate">Food Cupboard</span>
                  </button>
                  <button
                    onClick={() => { selectCategory('electronics'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-extrabold text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 hover:border-plum"
                  >
                    <span>⚡</span>
                    <span className="truncate">Electricals</span>
                  </button>
                </div>
              </div>
              
              <div className="h-px bg-gray-150 dark:bg-gray-800 my-1 mx-5" />
              
              {/* User Account / Wishlist / Cart */}
              <button 
                onClick={() => { onToggleWishlist(); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-4.5 h-4.5 text-gray-500" />
                  <span>My Saved Wishlist</span>
                </span>
                {wishlistCount > 0 && (
                  <span className="bg-plum text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => { onToggleCart(); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart className="w-4.5 h-4.5 text-gray-500" />
                  <span>My Shopping Cart</span>
                </span>
                {cartCount > 0 && (
                  <span className="bg-plum text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => { onToggleUserProfile(); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3 text-gray-800 dark:text-gray-100 cursor-pointer"
              >
                <User className="w-4.5 h-4.5 text-gray-500" />
                <span>Account Profile / Orders</span>
              </button>

              <button 
                onClick={() => { onToggleTheme(); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3 text-gray-800 dark:text-gray-100 cursor-pointer"
              >
                {isDark ? <Sun className="w-4.5 h-4.5 text-white" /> : <Moon className="w-4.5 h-4.5 text-gray-500" />}
                <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>

              <div className="h-px bg-gray-150 dark:bg-gray-800 my-1 mx-5" />

              {/* Admin Portal */}
              <button 
                onClick={() => { onViewChange('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3 text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                <Lock className="w-4.5 h-4.5 text-plum dark:text-pink-400" />
                <span>Admin Management Portal</span>
              </button>

              {/* Store Helpline / Contacts Footer */}
              <div className="mx-4 mt-3 p-3 bg-plum/5 dark:bg-gray-800/60 rounded-xl border border-plum/10 dark:border-gray-700/60 text-xs">
                <div className="flex items-center gap-1.5 font-black text-plum dark:text-white">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Kipchimatt Hotline</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 font-bold mt-0.5">{settings.storePhone}</p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>M-Pesa Express & Card Verified</span>
                </div>
              </div>

            </div>
          </nav>
        </>
      )}

      {/* Language & Currency Selection Modal */}
      <LanguageCurrencyModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        onChanged={() => {
          setSelectedLang(getGlobalLang());
          setCurrentCurrency(getGlobalCurrency());
        }}
      />
    </>
  );
}
