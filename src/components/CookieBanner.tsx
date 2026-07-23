import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Settings, Check, Lock } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('kipchimatt_cookie_consent');
      if (!consent) {
        // Show banner after short delay for optimal load
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = { necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
    try {
      localStorage.setItem('kipchimatt_cookie_consent', JSON.stringify(preferences));
    } catch (e) {}
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    const preferences = { necessary: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
    try {
      localStorage.setItem('kipchimatt_cookie_consent', JSON.stringify(preferences));
    } catch (e) {}
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const preferences = { necessary: true, analytics, marketing, timestamp: new Date().toISOString() };
    try {
      localStorage.setItem('kipchimatt_cookie_consent', JSON.stringify(preferences));
    } catch (e) {}
    setShowPreferences(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Cookie Consent Banner */}
      <div className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-lg z-[99990] animate-slide-up">
        <div className="bg-white dark:bg-gray-950 border-2 border-plum/30 dark:border-plum/50 rounded-2xl shadow-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-md">
          {/* Subtle top brand bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-plum via-plum-light to-plum" />

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-plum/10 text-plum flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cookie className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Cookie & Privacy Policy</span>
                  <span className="bg-plum text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Plum Privacy
                  </span>
                </h3>
                <button
                  onClick={handleAcceptEssential}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Close & Accept Essential"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                We use cookies to personalize your shopping experience, remember items in your cart, and deliver secure M-Pesa payments in accordance with Kenya Data Protection laws.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 min-w-[120px] bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-2 px-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept All</span>
                </button>

                <button
                  onClick={handleAcceptEssential}
                  className="bg-white dark:bg-gray-900 border border-plum/30 text-plum dark:text-plum-light hover:bg-plum/5 font-extrabold text-xs py-2 px-3 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Essential Only
                </button>

                <button
                  onClick={() => setShowPreferences(true)}
                  className="text-gray-500 hover:text-plum dark:hover:text-plum-light font-bold text-xs py-2 px-2 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99995] animate-fade-in">
          <div className="bg-white dark:bg-gray-950 border border-plum/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-plum/10 text-plum flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">Cookie Preferences</h3>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage your preferences below. Essential cookies are required for the shopping cart and checkout process to function properly.
            </p>

            <div className="space-y-3 pt-1">
              {/* Necessary */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-gray-900 dark:text-white">Strictly Necessary</span>
                    <Lock className="w-3 h-3 text-plum" />
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Required for cart, logins & payments.</p>
                </div>
                <span className="text-[10px] font-black text-plum bg-plum/10 px-2 py-0.5 rounded-full uppercase">Always On</span>
              </div>

              {/* Analytics */}
              <div className="p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-gray-900 dark:text-white block">Analytics & Performance</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Helps us measure site traffic & user journey.</p>
                </div>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="rounded border-gray-300 text-plum focus:ring-plum w-4 h-4 cursor-pointer accent-plum"
                />
              </div>

              {/* Marketing */}
              <div className="p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-gray-900 dark:text-white block">Marketing & Offers</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Personalized discounts and promotional codes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="rounded border-gray-300 text-plum focus:ring-plum w-4 h-4 cursor-pointer accent-plum"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={handleSavePreferences}
                className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Save My Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
