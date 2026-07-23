import React, { useState } from 'react';
import { 
  Phone, MapPin, Truck, Lock, Menu, Search, User, Heart, ShoppingCart, 
  X, LayoutGrid, LogOut, Store, ArrowRight, Mic, MicOff, Sun, Moon,
  ChevronDown, HelpCircle, ShieldCheck, Tag, Sparkles, ChevronRight
} from 'lucide-react';
import { StoreSettings, CategoryMeta } from '../types';
import { categoryMeta, formatMoney } from '../data/catalog';
import { KENYA_COUNTIES } from '../data/counties';

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
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return match ? match[1] : 'en';
  };

  const [selectedLang, setSelectedLang] = useState(getInitialLanguage);
  const [searchVal, setSearchVal] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchCategory, setSearchCategory] = useState('all');

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
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
    try {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
      
      const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectEl) {
        selectEl.value = langCode;
        selectEl.dispatchEvent(new Event('change'));
      }
    } catch (e) {}
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
                className="md:hidden text-white hover:text-gray-200 cursor-pointer p-1 shrink-0 transition-colors"
                aria-label="Toggle Navigation Menu"
                id="mobile-menu-trigger"
              >
                <Menu className="w-6 h-6" />
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
            <div className="flex md:hidden items-center gap-1.5 sm:gap-3">
              {/* Theme Toggle (Mobile) */}
              <button 
                onClick={onToggleTheme}
                className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer transition-all shrink-0"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-gray-300" />}
              </button>

              {/* Compact Account Link (Mobile) */}
              <button 
                onClick={onToggleUserProfile}
                className="flex flex-col items-center justify-center px-1.5 py-1 text-white hover:text-gray-200 cursor-pointer"
                title="Account"
              >
                <span className="text-[9px] text-gray-200 leading-none font-medium">Hello</span>
                <span className="text-xs font-black leading-none mt-0.5">Profile</span>
              </button>

              {/* Cart Widget (Mobile) */}
              <button 
                onClick={onToggleCart}
                className="flex items-center p-1.5 rounded-sm hover:bg-white/10 cursor-pointer relative shrink-0 select-none group transition-all"
                aria-label="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6 text-white" />
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 bg-white text-plum text-[10px] font-black rounded-full px-1 min-w-[16px] text-center leading-none py-0.5 shadow-sm">
                    {cartCount}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Deliver To County Widget (Desktop only) */}
          <div 
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent hover:border-white/30 cursor-pointer relative shrink-0 transition-all max-w-[140px] lg:max-w-[155px]"
            id="delivery-widget"
          >
            <MapPin className="w-4 h-4 text-yellow shrink-0 self-center" />
            <div className="flex flex-col text-left min-w-0 flex-1">
              <span className="text-[10px] text-gray-300 font-semibold leading-none mb-0.5">Deliver to</span>
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
                <option value="all">All Departments</option>
                {categoryMeta.filter(cat => cat.key !== 'all').map(cat => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Central text input */}
              <input 
                type="text" 
                placeholder="Search supermarket departments, brands..." 
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
            
            {/* Amazon-Style Language / Currency Selector */}
            <div className="hidden xl:flex relative items-center rounded-sm border border-transparent hover:border-white px-1.5 py-1 cursor-pointer shrink-0 transition-all">
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-transparent text-white font-extrabold text-[11px] cursor-pointer outline-none appearance-none pr-4"
                title="Select Language"
              >
                {languages.slice(0, 6).map(lang => (
                  <option key={lang.code} value={lang.code} className="text-gray-950 bg-white font-semibold">
                    {lang.flag} {lang.code.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-gray-200 absolute right-1 pointer-events-none" />
            </div>

            {/* Account & Lists panel with elegant Hover State */}
            {currentView === 'shop' && (
              <button 
                onClick={onToggleUserProfile}
                className="flex flex-col text-left px-1.5 lg:px-2 py-1 rounded-sm border border-transparent hover:border-white cursor-pointer transition-all"
                id="account-menu-trigger"
              >
                <span className="text-[10px] lg:text-[11px] text-gray-200 font-normal leading-none mb-0.5">
                  {isLoggedIn ? 'Hello, Customer' : 'Hello, Sign In'}
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
        <div className="md:hidden px-4 pb-2.5 pt-1 bg-plum w-full" id="search-bar-container-mobile">
          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full h-10 bg-white rounded-md flex items-center overflow-hidden focus-within:ring-2 focus-within:ring-orange border border-transparent transition-all"
          >
            {/* Search text input */}
            <input 
              type="text" 
              placeholder="Search Kipchimatt Supermarket..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-1 px-3.5 h-full outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
              aria-label="Search inputs"
            />

            {/* Voice Search mic button */}
            <button 
              type="button"
              onClick={startVoiceListening}
              className={`w-9 h-9 shrink-0 rounded-full my-auto mr-1 flex items-center justify-center cursor-pointer transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
              title="Search hands-free with voice"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4.5 h-4.5" />}
            </button>

            {/* Trigger search button */}
            <button 
              type="submit"
              className="h-full px-4 bg-orange hover:bg-orange/80 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="Submit Search Query"
            >
              <Search className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </header>

      {/* 2. SECONDARY SUB-HEADER ROW (All Categories & Quick Links) */}
      <nav className="bg-plum-dark text-white py-1 text-xs font-semibold flex items-center justify-between shadow-sm border-t border-white/5 select-none overflow-x-auto whitespace-nowrap scrollbar-none w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Left Navigation quick-links & Drawer Toggle */}
          <div className="flex items-center gap-1.5">
            
            {/* Mega Menu Drawer Toggle */}
            <button 
              onClick={() => setMegaMenuOpen(true)}
              className="flex items-center gap-1.5 text-white hover:text-white cursor-pointer transition-all font-black uppercase tracking-wider py-1.5 px-2.5 rounded-sm border border-transparent hover:border-white"
              id="mega-menu-trigger-all"
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
              <span>All</span>
            </button>
 
            {/* Direct Category Access Links */}
            <div className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => selectCategory('all')} 
                className="border border-transparent hover:border-white py-1.5 px-2.5 rounded-sm text-gray-200 hover:text-white transition-all duration-150 cursor-pointer"
              >
                Today's Deals
              </button>
              <button 
                onClick={() => selectCategory('fresh food')} 
                className="border border-transparent hover:border-white py-1.5 px-2.5 rounded-sm text-gray-200 hover:text-white transition-all duration-150 cursor-pointer"
              >
                Fresh Produce
              </button>
              <button 
                onClick={() => selectCategory('electronics')} 
                className="border border-transparent hover:border-white py-1.5 px-2.5 rounded-sm text-gray-200 hover:text-white transition-all duration-150 cursor-pointer"
              >
                Electricals & Batteries
              </button>
              <button 
                onClick={() => selectCategory('apparel')} 
                className="border border-transparent hover:border-white py-1.5 px-2.5 rounded-sm text-gray-200 hover:text-white transition-all duration-150 cursor-pointer"
              >
                Everyday Wear
              </button>
              <button 
                onClick={() => selectCategory('sports')} 
                className="border border-transparent hover:border-white py-1.5 px-2.5 rounded-sm text-gray-200 hover:text-white transition-all duration-150 cursor-pointer"
              >
                Fitness & Travel
              </button>
              <button 
                onClick={() => selectCategory('books')} 
                className="border border-transparent hover:border-white py-1.5 px-2.5 rounded-sm text-gray-200 hover:text-white transition-all duration-150 cursor-pointer"
              >
                Books & Planners
              </button>
              <button 
                onClick={() => selectCategory('liquor')} 
                className="border border-transparent hover:border-yellow font-bold py-1.5 px-2.5 rounded-sm text-yellow transition-all duration-150 cursor-pointer flex items-center gap-1"
              >
                <Tag className="w-3.5 h-3.5 text-yellow" />
                Liquor Cellar
              </button>
            </div>
          </div>

          {/* Right Side badging and Portal redirects */}
          <div className="flex items-center gap-4 text-[11px] font-bold text-gray-300">
            
            {/* Free Delivery Threshold Alert */}
            <span className="hidden lg:flex items-center gap-1 text-green bg-green-light/10 px-2 py-0.5 rounded border border-green/20">
              <Truck className="w-3.5 h-3.5" />
              <span>Free Delivery over {formatMoney(settings.freeDeliveryThreshold)}</span>
            </span>

            {/* Admin toggle portal buttons */}
            {currentView !== 'admin' ? (
              <div className="flex items-center gap-2">
                {currentView === 'cart' && (
                  <button 
                    onClick={() => onViewChange('shop')}
                    className="flex items-center gap-1 hover:text-white py-1 px-2.5 rounded bg-white/10 text-white cursor-pointer transition-all border border-white/5 active:scale-95 shrink-0"
                  >
                    <Store className="w-3 h-3" />
                    <span>View Storefront</span>
                  </button>
                )}
                <button 
                  onClick={() => onViewChange('admin')}
                  className="flex items-center gap-1 hover:text-white py-1 px-2.5 rounded bg-white/10 text-white cursor-pointer transition-all border border-white/5 active:scale-95 shrink-0"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onViewChange('shop')}
                  className="flex items-center gap-1 hover:text-white py-1 px-2.5 rounded bg-orange text-white cursor-pointer font-bold transition-all"
                >
                  <Store className="w-3 h-3" />
                  <span>View Storefront</span>
                </button>
                {isLoggedIn && (
                  <button 
                    onClick={onLogout}
                    className="flex items-center gap-1 text-red hover:text-red-light cursor-pointer"
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
                  <h3 className="font-extrabold text-base tracking-tight leading-none text-yellow">
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
                <Sparkles className="w-3.5 h-3.5 text-yellow" />
                <span>Supercharged shopping deals today!</span>
              </span>
              <span className="text-yellow uppercase tracking-wider text-[9px] font-black bg-white/10 px-1.5 py-0.5 rounded">HOT</span>
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
                    className="w-full flex items-center justify-between text-left py-1.5 hover:text-plum dark:hover:text-yellow transition-colors"
                  >
                    <span>Today's Kikapu Chapchap Deals</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                  <button 
                    onClick={() => { selectCategory('fresh food'); setMegaMenuOpen(false); }}
                    className="w-full flex items-center justify-between text-left py-1.5 hover:text-plum dark:hover:text-yellow transition-colors"
                  >
                    <span>Fresh Local Farm Harvests</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  </button>
                  <button 
                    onClick={() => { selectCategory('liquor'); setMegaMenuOpen(false); }}
                    className="w-full flex items-center justify-between text-left py-1.5 hover:text-plum dark:hover:text-yellow transition-colors"
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
                      className="w-full flex items-center justify-between text-left py-2 hover:text-plum dark:hover:text-yellow group transition-colors"
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
                      className="w-full flex items-center justify-between text-left py-2 hover:text-plum dark:hover:text-yellow group transition-colors"
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
                      className="w-full flex items-center justify-between text-left py-2 hover:text-plum dark:hover:text-yellow group transition-colors"
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
                    className="w-full text-left py-1.5 hover:text-plum dark:hover:text-yellow transition-colors"
                  >
                    Your Profile & Settings
                  </button>
                  <button 
                    onClick={() => { onToggleUserProfile(); setMegaMenuOpen(false); }}
                    className="w-full text-left py-1.5 hover:text-plum dark:hover:text-yellow transition-colors"
                  >
                    Order History & Invoices
                  </button>
                  <button 
                    onClick={() => { onToggleTheme(); setMegaMenuOpen(false); }}
                    className="w-full text-left py-1.5 hover:text-plum dark:hover:text-yellow transition-colors"
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
          <nav className="fixed top-0 left-0 w-[300px] max-w-[85%] h-full bg-white dark:bg-gray-900 shadow-2xl z-55 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-plum text-white p-5 flex flex-col gap-3 relative border-b border-plum-dark">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-250 border border-white/20 flex items-center justify-center p-1">
                  <User className="w-6 h-6 text-plum" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-black text-sm tracking-tight leading-none text-yellow">
                    {isLoggedIn ? 'Hello, Customer' : 'Hello, Sign In'}
                  </h2>
                  <span className="text-[10px] text-gray-400 mt-1 font-bold">Manage Account & Tracking</span>
                </div>
              </div>
              
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-5 right-4 text-gray-400 hover:text-white p-1 cursor-pointer rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile links */}
            <div className="flex-1 overflow-y-auto py-3 flex flex-col font-bold text-sm text-gray-700 dark:text-gray-300">
              
              {/* Deliver To County Selection (Mobile) */}
              <div className="mx-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs font-black text-plum dark:text-pink-300">
                  <MapPin className="w-4 h-4 text-plum dark:text-pink-400" />
                  <span>Deliver To County (47 Counties)</span>
                </div>
                <div className="relative w-full">
                  <select 
                    value={deliveryLocation}
                    onChange={(e) => onDeliveryLocationChange(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-black text-xs rounded-xl px-3 py-2 outline-none cursor-pointer appearance-none pr-8 shadow-xs"
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

              <button 
                onClick={() => { selectCategory('all'); onViewChange('shop'); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3 text-gray-800 dark:text-gray-100"
              >
                <Store className="w-5 h-5 text-gray-400" />
                <span>Store Home</span>
              </button>

              <button 
                onClick={() => { setMegaMenuOpen(true); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3 text-gray-800 dark:text-gray-100"
              >
                <LayoutGrid className="w-5 h-5 text-gray-400" />
                <span>Shop All Departments</span>
              </button>
              
              <div className="h-px bg-gray-150 dark:bg-gray-800 my-2 mx-5" />
              
              <button 
                onClick={() => { onToggleWishlist(); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-gray-400" />
                  <span>Wishlist</span>
                </span>
                {wishlistCount > 0 && (
                  <span className="bg-orange text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => { onToggleCart(); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-gray-400" />
                  <span>Shopping Cart</span>
                </span>
                {cartCount > 0 && (
                  <span className="bg-orange text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => { onToggleUserProfile(); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3 text-gray-800 dark:text-gray-100"
              >
                <User className="w-5 h-5 text-gray-400" />
                <span>My Profile / Track Order</span>
              </button>

              <button 
                onClick={() => { onToggleTheme(); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3 text-gray-800 dark:text-gray-100"
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-400" />}
                <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>

              <div className="h-px bg-gray-150 dark:bg-gray-800 my-2 mx-5" />

              <button 
                onClick={() => { onViewChange('admin'); setMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-850 flex items-center gap-3"
              >
                <Lock className="w-5 h-5 text-gray-400" />
                <span>Admin Panel Portal</span>
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
