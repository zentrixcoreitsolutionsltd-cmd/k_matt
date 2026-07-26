import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, Mail, MapPin, Award, RotateCcw, ShoppingCart, 
  Crown, Lock, CheckCircle2, Copy, Check, Sparkles, ChevronRight, Zap,
  Printer, FileText, UserPlus, KeyRound, LogOut, Download, AlertCircle,
  History, TrendingUp, TrendingDown, Clock, Calendar, ArrowRight,
  ShieldCheck, Eye, EyeOff, MessageSquareCode, LogIn, RefreshCw, Building2
} from 'lucide-react';
import { Customer, Order, CartItem } from '../types';
import { formatMoney } from '../data/catalog';
import { KENYA_COUNTIES } from '../data/counties';
import { BRANCHES, getNearestBranchForCustomer, getDistanceToBranchKm } from '../data/branches';

interface LoyaltyTier {
  id: 'bronze' | 'silver' | 'gold' | 'platinum';
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  badgeBg: string;
  textColor: string;
  bgGradient: string;
  discountDesc: string;
  perks: string[];
}

const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Member',
    minPoints: 0,
    maxPoints: 199,
    icon: '🥉',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
    textColor: 'text-amber-600 dark:text-amber-400',
    bgGradient: 'from-amber-700 to-amber-900',
    discountDesc: 'Redeem points directly at checkout (1 Pt = KSh 1)',
    perks: ['Earn 1 point per KSh 100 spent', 'Weekly digital catalog updates']
  },
  {
    id: 'silver',
    name: 'Silver Shopper',
    minPoints: 200,
    maxPoints: 499,
    icon: '🥈',
    badgeBg: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-400',
    textColor: 'text-slate-500 dark:text-slate-300',
    bgGradient: 'from-slate-600 to-slate-800',
    discountDesc: 'Redeem points directly on orders + priority verification',
    perks: ['Priority M-PESA payment verification', 'Free express pickup option']
  },
  {
    id: 'gold',
    name: 'Gold Executive',
    minPoints: 500,
    maxPoints: 999,
    icon: '🥇',
    badgeBg: 'bg-plum/10 text-plum dark:bg-plum/30 dark:text-pink-300 border-plum/30',
    textColor: 'text-plum dark:text-pink-300',
    bgGradient: 'from-plum via-pink-600 to-plum-dark',
    discountDesc: 'Redeem points directly + Express Same-Day Delivery',
    perks: ['Dedicated support helpline', 'Exclusive early flash sale access']
  },
  {
    id: 'platinum',
    name: 'Platinum VIP',
    minPoints: 1000,
    maxPoints: Infinity,
    icon: '💎',
    badgeBg: 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-200 border-cyan-400',
    textColor: 'text-cyan-500 dark:text-cyan-300',
    bgGradient: 'from-purple-700 via-indigo-700 to-cyan-600',
    discountDesc: 'Redeem points on any order + Free delivery on ALL orders',
    perks: ['Free delivery on ALL orders', 'Annual birthday voucher & bonus points']
  }
];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  orders?: Order[];
  userOrders?: Order[];
  onSaveCustomer?: (c: Customer) => void;
  onLoginCustomer?: (phoneOrEmail: string, password?: string) => boolean;
  onLogoutCustomer?: () => void;
  onReorderCart?: (items: CartItem[]) => void;
  onViewReceipt?: (order: Order) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  selectedBranchId?: string;
  onSelectBranch?: (branchId: string) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  customer,
  orders,
  userOrders,
  onSaveCustomer,
  onLoginCustomer,
  onLogoutCustomer,
  onReorderCart,
  onViewReceipt,
  onShowToast,
  selectedBranchId = 'kericho',
  onSelectBranch
}: UserProfileModalProps) {
  const activeOrders = orders || userOrders || [];
  const previousFiveOrders = activeOrders.slice(0, 5);

  // Profile Edit State
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [county, setCounty] = useState(customer?.county || 'Nairobi');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Navigation Tab
  type TabType = 'profile' | 'loyalty' | 'points_history' | 'orders' | 'sign_in' | 'create_account';
  const [activeTab, setActiveTab] = useState<TabType>(customer ? 'profile' : 'sign_in');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCounty, setRegCounty] = useState('Nairobi');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [optInLoyalty, setOptInLoyalty] = useState(true);

  // Registration OTP State
  const [regOtpStep, setRegOtpStep] = useState<'details' | 'otp_sent'>('details');
  const [generatedRegOtp, setGeneratedRegOtp] = useState('');
  const [userEnteredRegOtp, setUserEnteredRegOtp] = useState('');

  // Login Form State
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [loginOtpStep, setLoginOtpStep] = useState<'input' | 'otp_sent'>('input');
  const [loginGeneratedOtp, setLoginGeneratedOtp] = useState('');
  const [loginEnteredOtp, setLoginEnteredOtp] = useState('');

  // Update form fields when customer prop changes
  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
      setCounty(customer.county || 'Nairobi');
      if (activeTab === 'sign_in' || activeTab === 'create_account') {
        setActiveTab('profile');
      }
    } else {
      if (activeTab === 'profile' || activeTab === 'loyalty' || activeTab === 'points_history' || activeTab === 'orders') {
        setActiveTab('sign_in');
      }
    }
  }, [customer]);

  if (!isOpen) return null;

  const points = customer?.points ?? 0;
  const currentTier = LOYALTY_TIERS.find(t => points >= t.minPoints && points <= t.maxPoints) || LOYALTY_TIERS[0];
  const currentTierIndex = LOYALTY_TIERS.findIndex(t => t.id === currentTier.id);
  const nextTier = LOYALTY_TIERS[currentTierIndex + 1];

  let progressPercent = 100;
  let pointsNeeded = 0;
  if (nextTier) {
    const currentLevelProgress = points - currentTier.minPoints;
    const levelRange = nextTier.minPoints - currentTier.minPoints;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelProgress / levelRange) * 100)));
    pointsNeeded = nextTier.minPoints - points;
  }

  // Handle Save Profile Updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      if (onShowToast) onShowToast('Name and Phone Number are required.', 'error');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      if (onShowToast) onShowToast('New password must be a strong password with at least 8 characters.', 'error');
      return;
    }
    const updatedCust: Customer = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: county,
      county,
      points,
      password: newPassword ? newPassword : customer?.password,
      isVerified: true
    };
    if (onSaveCustomer) {
      onSaveCustomer(updatedCust);
    }
    if (onShowToast) onShowToast('Profile details & password updated successfully!', 'success');
  };

  // Step 1 Registration: Send Verification OTP
  const handleSendRegistrationOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      if (onShowToast) onShowToast('Please enter your full name.', 'error');
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 8) {
      if (onShowToast) onShowToast('Please enter a valid M-PESA phone number.', 'error');
      return;
    }
    if (!regPassword || regPassword.length < 8) {
      if (onShowToast) onShowToast('Password must be a strong password with at least 8 characters.', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      if (onShowToast) onShowToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    // Generate random 4-digit OTP code for SMS verification
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedRegOtp(otpCode);
    setRegOtpStep('otp_sent');

    if (onShowToast) {
      onShowToast(`💬 Verification SMS sent to +254 ${regPhone}! Code: ${otpCode}`, 'info');
    }
  };

  // Step 2 Registration: Verify OTP & Create Account
  const handleVerifyRegistrationOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEnteredRegOtp.trim() !== generatedRegOtp) {
      if (onShowToast) onShowToast('Invalid OTP verification code. Check SMS simulation below.', 'error');
      return;
    }

    const welcomePoints = optInLoyalty ? 150 : 0;
    const newCust: Customer = {
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      address: regAddress.trim(),
      city: regCounty,
      county: regCounty,
      points: welcomePoints,
      password: regPassword,
      isVerified: true
    };

    if (onSaveCustomer) {
      onSaveCustomer(newCust);
    }

    if (onShowToast) {
      onShowToast(`🎉 Phone number verified! Account created with ${welcomePoints} Welcome Loyalty Points!`, 'success');
    }

    // Reset reg state and switch to profile
    setRegOtpStep('details');
    setUserEnteredRegOtp('');
    setRegPassword('');
    setRegConfirmPassword('');
    setActiveTab('profile');
  };

  // Handle Password Sign In
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhoneOrEmail.trim() || !loginPassword) {
      if (onShowToast) onShowToast('Please enter your phone/email and password.', 'error');
      return;
    }
    if (onLoginCustomer) {
      const success = onLoginCustomer(loginPhoneOrEmail.trim(), loginPassword);
      if (success) {
        setLoginPassword('');
        setActiveTab('profile');
      }
    }
  };

  // Handle Send Login OTP
  const handleSendLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhoneOrEmail.trim()) {
      if (onShowToast) onShowToast('Please enter your phone number.', 'error');
      return;
    }
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    setLoginGeneratedOtp(otpCode);
    setLoginOtpStep('otp_sent');
    if (onShowToast) {
      onShowToast(`💬 Login SMS OTP sent to ${loginPhoneOrEmail}! Code: ${otpCode}`, 'info');
    }
  };

  // Handle Verify Login OTP
  const handleVerifyLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEnteredOtp.trim() !== loginGeneratedOtp) {
      if (onShowToast) onShowToast('Invalid OTP code. Please check the SMS banner.', 'error');
      return;
    }
    if (onLoginCustomer) {
      const success = onLoginCustomer(loginPhoneOrEmail.trim());
      if (success) {
        setLoginOtpStep('input');
        setLoginEnteredOtp('');
        setActiveTab('profile');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 my-auto">
        
        {/* Header Banner */}
        <div className="bg-plum p-5 text-white flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-3 z-10">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg">
                  {customer ? customer.name : 'K-Matt Member Services'}
                </h3>
                {customer?.isVerified && (
                  <span className="bg-green/20 text-green-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-400/30 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80 font-medium">
                {customer ? `Phone: ${customer.phone} | Points: ${points} PTS` : 'Sign in or register with phone OTP verification'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 px-3 pt-2 gap-1 text-xs font-bold overflow-x-auto no-scrollbar">
          {customer ? (
            <>
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'profile' ? 'border-plum text-plum dark:text-pink-400 font-black' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('loyalty')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'loyalty' ? 'border-plum text-plum dark:text-pink-400 font-black' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >
                <Crown className="w-3.5 h-3.5 text-plum dark:text-pink-400" />
                <span>Loyalty Tiers</span>
                <span className="bg-plum text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">{points} pts</span>
              </button>
              <button
                onClick={() => setActiveTab('points_history')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'points_history' ? 'border-plum text-plum dark:text-pink-400 font-black' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >
                <History className="w-3.5 h-3.5 text-plum" />
                <span>Points History</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'orders' ? 'border-plum text-plum dark:text-pink-400 font-black' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >
                <Printer className="w-3.5 h-3.5 text-plum" />
                <span>Receipts ({previousFiveOrders.length})</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('sign_in')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'sign_in' ? 'border-plum text-plum dark:text-pink-400 font-black' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >
                <LogIn className="w-3.5 h-3.5 text-plum" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setActiveTab('create_account')}
                className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'create_account' ? 'border-plum text-plum dark:text-pink-400 font-black' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
              >
                <UserPlus className="w-3.5 h-3.5 text-green" />
                <span>Create Account (Password + OTP)</span>
              </button>
            </>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">

          {/* TAB: SIGN IN */}
          {!customer && activeTab === 'sign_in' && (
            <div className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center space-y-1">
                <h4 className="font-black text-gray-900 dark:text-white text-base">Sign In to Your Account</h4>
                <p className="text-gray-500 font-medium text-xs">
                  Access your points balance, order history, and instant checkout.
                </p>
              </div>

              {/* Login Mode Selector */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLoginMode('password')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${loginMode === 'password' ? 'bg-white dark:bg-gray-700 text-plum dark:text-pink-300 shadow-xs' : 'text-gray-500'}`}
                >
                  Password Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('otp')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${loginMode === 'otp' ? 'bg-white dark:bg-gray-700 text-plum dark:text-pink-300 shadow-xs' : 'text-gray-500'}`}
                >
                  Phone SMS OTP
                </button>
              </div>

              {loginMode === 'password' ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Phone Number or Email
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input 
                        type="text" 
                        value={loginPhoneOrEmail}
                        onChange={e => setLoginPhoneOrEmail(e.target.value)}
                        placeholder="e.g. 0712345678 or john@gmail.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input 
                        type={showLoginPassword ? "text" : "password"} 
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter your account password"
                        className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-plum hover:bg-plum-dark text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <LogIn className="w-4 h-4 text-white" />
                    <span>Sign In to Member Account</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-3 pt-1">
                  {loginOtpStep === 'input' ? (
                    <form onSubmit={handleSendLoginOtp} className="space-y-3">
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                          Registered Phone Number (M-PESA)
                        </label>
                        <input 
                          type="text" 
                          value={loginPhoneOrEmail}
                          onChange={e => setLoginPhoneOrEmail(e.target.value)}
                          placeholder="e.g. 0712345678"
                          className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-plum hover:bg-plum-dark text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageSquareCode className="w-4 h-4 text-white" />
                        <span>Send Login SMS OTP</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyLoginOtp} className="space-y-3">
                      {/* SMS Simulation Banner */}
                      <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 text-xs space-y-1 animate-pulse">
                        <div className="flex items-center gap-1.5 font-black text-amber-900 dark:text-amber-200">
                          <MessageSquareCode className="w-4 h-4 text-amber-600" />
                          <span>💬 K-Matt SMS Dispatcher</span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 font-semibold text-[11px]">
                          Verification code for <strong>+254 {loginPhoneOrEmail}</strong> is:
                        </p>
                        <div className="text-center font-black text-xl tracking-widest text-plum bg-white dark:bg-gray-900 py-1.5 rounded-xl border border-amber-300">
                          {loginGeneratedOtp}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                          Enter 4-Digit SMS Code
                        </label>
                        <input 
                          type="text"
                          maxLength={4} 
                          value={loginEnteredOtp}
                          onChange={e => setLoginEnteredOtp(e.target.value)}
                          placeholder="4-Digit Code"
                          className="w-full text-center tracking-widest text-lg font-black px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum"
                          required
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-green hover:bg-green-600 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify OTP & Sign In</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLoginOtpStep('input')}
                        className="w-full text-gray-500 hover:text-gray-800 text-[11px] font-bold py-1 transition-colors"
                      >
                        ← Change Phone Number
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="border-t border-gray-150 dark:border-gray-800 pt-3 text-center">
                <p className="text-gray-500 text-xs">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setActiveTab('create_account')}
                    className="text-plum dark:text-pink-400 font-extrabold underline cursor-pointer hover:text-plum-dark"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* TAB: CREATE ACCOUNT WITH OTP */}
          {!customer && activeTab === 'create_account' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-plum/10 via-pink-500/10 to-amber-500/10 border border-plum/20 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-plum text-white rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 dark:text-white text-xs">New Member Loyalty Offer</h4>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300">
                      Create a password-protected account & verify your phone to claim <strong>150 Free Welcome Points (KSh 150)</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {regOtpStep === 'details' ? (
                <form onSubmit={handleSendRegistrationOtp} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                        Full Name *
                      </label>
                      <input 
                        type="text" 
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="e.g. Jane Wambui"
                        className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                        M-PESA Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input 
                          type="text" 
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          placeholder="0712345678"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                        Email Address (Optional)
                      </label>
                      <input 
                        type="email" 
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                        County (Kenya 47 Counties)
                      </label>
                      <select
                        value={regCounty}
                        onChange={e => setRegCounty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-bold"
                      >
                        {KENYA_COUNTIES.map(c => (
                          <option key={c.code} value={c.name}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                      Estate / Street Address
                    </label>
                    <input 
                      type="text" 
                      value={regAddress}
                      onChange={e => setRegAddress(e.target.value)}
                      placeholder="e.g. Westlands, Mpaka Road Apt 4B"
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-gray-700 dark:text-gray-300 font-bold">
                          Account Password *
                        </label>
                        {regPassword && (
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                            regPassword.length >= 10 && /[A-Z]/.test(regPassword) && /[0-9]/.test(regPassword)
                              ? 'bg-green/10 text-green border border-green/30'
                              : regPassword.length >= 8
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border border-red-300'
                          }`}>
                            {regPassword.length >= 10 && /[A-Z]/.test(regPassword) && /[0-9]/.test(regPassword)
                              ? 'Strong'
                              : regPassword.length >= 8
                              ? 'Good (8+ chars)'
                              : `${regPassword.length}/8 chars`}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input 
                          type={showRegPassword ? "text" : "password"} 
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold text-xs"
                          required
                          minLength={8}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 font-medium">Must be a strong password with at least 8 characters.</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input 
                          type={showRegPassword ? "text" : "password"} 
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          placeholder="Re-type password"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold text-xs"
                          required
                          minLength={8}
                        />
                      </div>
                      {regConfirmPassword && regPassword !== regConfirmPassword && (
                        <p className="text-[10px] text-red-500 mt-1 font-bold">Passwords do not match</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox"
                      id="optInLoyalty"
                      checked={optInLoyalty}
                      onChange={e => setOptInLoyalty(e.target.checked)}
                      className="w-4 h-4 accent-plum cursor-pointer rounded"
                    />
                    <label htmlFor="optInLoyalty" className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer select-none">
                      Opt-in to K-Matt Smart Loyalty Program (+150 Bonus Points)
                    </label>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-plum hover:bg-plum-dark text-white font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <MessageSquareCode className="w-4 h-4 text-white" />
                    <span>Send Verification Code (SMS OTP)</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyRegistrationOtp} className="space-y-4 max-w-md mx-auto py-2">
                  <div className="text-center space-y-1">
                    <h4 className="font-black text-gray-900 dark:text-white text-base">Verify Your Phone Number</h4>
                    <p className="text-gray-500 text-xs">
                      Enter the 4-digit verification code dispatched to <strong>+254 {regPhone}</strong>
                    </p>
                  </div>

                  {/* SMS Simulation Callout Box */}
                  <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-2xl p-4 text-xs space-y-2 text-center animate-pulse shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 font-black text-amber-900 dark:text-amber-200">
                      <MessageSquareCode className="w-4 h-4 text-amber-600" />
                      <span>💬 K-Matt SMS Dispatcher</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 font-semibold">
                      Your phone verification code for K-Matt Membership is:
                    </p>
                    <div className="font-black text-2xl tracking-widest text-plum bg-white dark:bg-gray-900 py-2 rounded-xl border border-amber-300 shadow-inner">
                      {generatedRegOtp}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1 text-center">
                      Enter 4-Digit Code
                    </label>
                    <input 
                      type="text"
                      maxLength={4} 
                      value={userEnteredRegOtp}
                      onChange={e => setUserEnteredRegOtp(e.target.value)}
                      placeholder="0000"
                      className="w-full text-center tracking-widest text-2xl font-black px-3 py-2.5 rounded-2xl border-2 border-plum bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-plum/30"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-green hover:bg-green-600 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify OTP & Complete Registration</span>
                  </button>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setRegOtpStep('details')}
                      className="text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold"
                    >
                      ← Edit Registration Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
                        setGeneratedRegOtp(newCode);
                        if (onShowToast) onShowToast(`💬 New OTP Code sent: ${newCode}`, 'info');
                      }}
                      className="text-plum dark:text-pink-400 font-bold flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend SMS Code</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="border-t border-gray-150 dark:border-gray-800 pt-3 text-center">
                <p className="text-gray-500 text-xs">
                  Already have an account?{' '}
                  <button 
                    onClick={() => setActiveTab('sign_in')}
                    className="text-plum dark:text-pink-400 font-extrabold underline cursor-pointer hover:text-plum-dark"
                  >
                    Sign In Here
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* TAB: PROFILE DETAILS (WHEN LOGGED IN) */}
          {customer && activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Loyalty Quick Banner */}
              <div className={`bg-gradient-to-r ${currentTier.bgGradient} text-white p-4 rounded-2xl flex items-center justify-between shadow-md`}>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xl">{currentTier.icon}</span>
                    <span className="text-white/90 font-extrabold text-xs uppercase tracking-wider">{currentTier.name}</span>
                  </div>
                  <h4 className="text-2xl font-black">{points} Points</h4>
                  <p className="text-[10px] text-white/80 mt-1">
                    {nextTier ? `Earn ${pointsNeeded} more points to reach ${nextTier.name}` : 'Max VIP Level Achieved! 🎉'}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('loyalty')}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View Rewards</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider text-xs">Account Information</h4>
                  {customer.isVerified && (
                    <span className="text-[10px] bg-green/10 text-green font-extrabold px-2 py-0.5 rounded-full border border-green/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-green" />
                      <span>Phone Verified</span>
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">County (47 Counties)</label>
                    <select
                      value={county}
                      onChange={e => setCounty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none focus:border-plum"
                    >
                      {KENYA_COUNTIES.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Estate / Street Address</label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                    />
                  </div>
                </div>

                {/* Nearest K-Matt Supermarket Branch & Distance Calculation Card */}
                {(() => {
                  const activeLoc = `${address} ${county}`;
                  const nearestRes = getNearestBranchForCustomer(activeLoc);
                  const matchedB = nearestRes.branch;
                  const matchedKm = nearestRes.distanceKm;

                  return (
                    <div className="bg-gradient-to-r from-plum/10 via-pink-500/10 to-amber-500/10 border-2 border-plum/30 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-plum text-white rounded-xl shadow-xs">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-plum dark:text-pink-400 tracking-wider">
                              Matched Nearest K-Matt Supermarket
                            </span>
                            <h4 className="font-black text-gray-900 dark:text-white text-sm">
                              {matchedB.name}
                            </h4>
                          </div>
                        </div>
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>~{matchedKm} km away</span>
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-xs font-medium">
                        Storefront stock and products automatically update based on your address (<strong>{county}</strong>). Nearest branch: <strong>{matchedB.town} ({matchedB.address})</strong>.
                      </p>

                      {/* Distance to all K-Matt branches breakdown */}
                      <div className="pt-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">
                          Distance to all K-Matt Supermarkets from your address:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                          {BRANCHES.map(b => {
                            const dist = getDistanceToBranchKm(activeLoc, b.id);
                            const isSelected = b.id === selectedBranchId;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  if (onSelectBranch) onSelectBranch(b.id);
                                }}
                                className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'bg-plum text-white border-plum font-extrabold shadow-sm'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-plum/50'
                                }`}
                              >
                                <div className="font-bold truncate">{b.town}</div>
                                <div className={`text-[10px] ${isSelected ? 'text-pink-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                  ~{dist} km {isSelected ? '✓ Active' : ''}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Update Password (Optional - Min 8 characters)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters (leave blank to keep current)"
                      className="w-full pl-9 pr-10 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-plum font-semibold"
                      minLength={8}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs active:scale-98"
                  >
                    Update Account Details
                  </button>

                  {onLogoutCustomer && (
                    <button 
                      type="button"
                      onClick={() => {
                        onLogoutCustomer();
                        onClose();
                      }}
                      className="px-4 py-2.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* TAB: LOYALTY TIERS */}
          {customer && activeTab === 'loyalty' && (
            <div className="space-y-5">
              <div className={`bg-gradient-to-r ${currentTier.bgGradient} text-white p-5 rounded-3xl shadow-lg relative overflow-hidden`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{currentTier.icon}</span>
                    <div>
                      <span className="text-white/80 font-bold uppercase text-[10px] tracking-widest">Current Rank</span>
                      <h3 className="text-xl font-black text-white">{currentTier.name}</h3>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-black text-xs border border-white/20">
                    {points} PTS
                  </div>
                </div>

                {nextTier ? (
                  <div className="space-y-1.5 mt-4 pt-3 border-t border-white/20">
                    <div className="flex justify-between text-[11px] font-bold text-white/90">
                      <span>Progress to {nextTier.icon} {nextTier.name}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="bg-white h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/75 font-medium text-right">
                      {pointsNeeded} more points required for {nextTier.name} rank
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-white mt-2">
                    🏆 Congratulations! You have reached the highest Platinum VIP Tier status.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-plum" />
                  <span>K-Matt Member Tiers & Benefits</span>
                </h4>

                <div className="space-y-3">
                  {LOYALTY_TIERS.map(tier => {
                    const isUnlocked = points >= tier.minPoints;
                    const isCurrent = currentTier.id === tier.id;

                    return (
                      <div 
                        key={tier.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isUnlocked 
                            ? 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-xs' 
                            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{tier.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-gray-900 dark:text-white text-xs">{tier.name}</h5>
                                {isCurrent && (
                                  <span className="bg-plum/10 text-plum dark:bg-pink-900/40 dark:text-pink-300 text-[9px] font-extrabold px-2 py-0.2 rounded-full">
                                    Active Rank
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 font-medium">Requires {tier.minPoints} points</p>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <span className="bg-green/10 text-green font-extrabold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 border border-green/30">
                              <CheckCircle2 className="w-3 h-3 text-green" />
                              <span>Unlocked</span>
                            </span>
                          ) : (
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-extrabold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 pt-2.5 border-t border-gray-150 dark:border-gray-700/60 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-[11px]">
                          <p className="font-bold text-plum dark:text-pink-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-plum dark:text-pink-400" />
                            <span>{tier.discountDesc}</span>
                          </p>
                          <ul className="text-[10px] text-gray-500 space-y-0.5">
                            {tier.perks.map((p, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: POINTS HISTORY */}
          {customer && activeTab === 'points_history' && (
            <div className="space-y-4">
              <div className="bg-plum/10 dark:bg-pink-950/30 border border-plum/20 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-plum dark:text-pink-300 uppercase tracking-wider">Current Points Balance</span>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{points} PTS</h3>
                  <p className="text-[10px] text-gray-500 font-medium">1 Point = KSh 1 discount at checkout</p>
                </div>
                <div className="text-right">
                  <span className="bg-plum text-white text-[10px] font-extrabold px-3 py-1 rounded-full">
                    {currentTier.name}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs">Points Activity</h4>

                {previousFiveOrders.length > 0 ? (
                  <div className="space-y-2">
                    {previousFiveOrders.map(order => (
                      <div 
                        key={order.id}
                        className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-green/10 rounded-xl text-green">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-900 dark:text-white block">Order #{order.id.slice(-6).toUpperCase()}</span>
                            <span className="text-[10px] text-gray-500 font-medium">{order.date ? new Date(order.date).toLocaleDateString('en-GB') : 'Recent'} • Earned 1 pt / KSh 100</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-green text-sm block">+{Math.floor(order.total / 100)} PTS</span>
                          {order.pointsRedeemed && order.pointsRedeemed > 0 ? (
                            <span className="text-[10px] font-bold text-red-500">-{order.pointsRedeemed} PTS redeemed</span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500 font-medium border border-dashed border-gray-250 dark:border-gray-700 rounded-2xl">
                    <p>No recent orders found. Earn points automatically on every checkout!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PREVIOUS RECEIPTS */}
          {customer && activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-plum" />
                  <span>Your Previous Receipts ({previousFiveOrders.length})</span>
                </h4>
              </div>

              {previousFiveOrders.length > 0 ? (
                <div className="space-y-3">
                  {previousFiveOrders.map(order => (
                    <div 
                      key={order.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 hover:border-plum transition-all"
                    >
                      <div className="flex justify-between items-start border-b border-gray-150 dark:border-gray-700 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-gray-900 dark:text-white">Order #{order.id.slice(-6).toUpperCase()}</span>
                            <span className="bg-green/10 text-green font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-green/30">
                              {order.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {order.date ? new Date(order.date).toLocaleString('en-GB') : 'Recent Order'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-plum dark:text-pink-400 text-sm">{formatMoney(order.total)}</span>
                          <span className="text-[10px] text-gray-500 block font-bold">{order.items.reduce((s, i) => s + i.qty, 0)} Items</span>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-1">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex justify-between font-medium">
                            <span className="truncate max-w-[200px] sm:max-w-[300px]">{item.qty}x {item.name}</span>
                            <span className="font-bold">{formatMoney(item.price * item.qty)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-[10px] text-gray-400 italic">+ {order.items.length - 3} more item(s)</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        {onViewReceipt && (
                          <button
                            onClick={() => onViewReceipt(order)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-extrabold text-xs py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View / Print Receipt</span>
                          </button>
                        )}

                        {onReorderCart && (
                          <button
                            onClick={() => onReorderCart(order.items)}
                            className="flex-1 bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-white" />
                            <span>Reorder Items</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 font-medium border border-dashed border-gray-250 dark:border-gray-700 rounded-2xl space-y-2">
                  <Printer className="w-8 h-8 mx-auto text-gray-300" />
                  <p className="font-bold text-gray-700 dark:text-gray-300">No previous order receipts yet.</p>
                  <p className="text-[11px]">When you place orders on K-Matt Supermarket, your receipts will be safely archived here for instant reordering and printing!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
