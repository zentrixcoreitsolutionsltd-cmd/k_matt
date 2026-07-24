import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, MapPin, Award, RotateCcw, ShoppingCart, 
  Crown, Lock, CheckCircle2, Copy, Check, Sparkles, ChevronRight, Zap,
  Printer, FileText, UserPlus, KeyRound, LogOut, Download, AlertCircle,
  History, TrendingUp, TrendingDown, Clock, Calendar, ArrowRight
} from 'lucide-react';
import { Customer, Order, CartItem } from '../types';
import { formatMoney } from '../data/catalog';
import { KENYA_COUNTIES } from '../data/counties';

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
    badgeBg: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-400',
    textColor: 'text-yellow-600 dark:text-amber-300',
    bgGradient: 'from-amber-500 via-yellow-600 to-amber-700',
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
  onLoginCustomer?: (phone: string) => void;
  onLogoutCustomer?: () => void;
  onReorderCart?: (items: CartItem[]) => void;
  onViewReceipt?: (order: Order) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
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
  onShowToast
}: UserProfileModalProps) {
  const activeOrders = orders || userOrders || [];
  const previousFiveOrders = activeOrders.slice(0, 5);

  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [county, setCounty] = useState(customer?.county || 'Nairobi');
  
  // Tab and Auth states
  const [activeTab, setActiveTab] = useState<'profile' | 'loyalty' | 'points_history' | 'orders' | 'create_account'>('profile');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCounty, setRegCounty] = useState('Nairobi');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [optInLoyalty, setOptInLoyalty] = useState(true);

  if (!isOpen) return null;

  const points = customer?.points ?? 120;
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveCustomer) {
      onSaveCustomer({
        name,
        phone,
        email,
        address,
        city: county,
        county,
        points: customer?.points ?? 120
      });
    }
    if (onShowToast) onShowToast('Profile details updated successfully!', 'success');
    onClose();
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) {
      if (onShowToast) onShowToast('Please provide your full name and phone number.', 'error');
      return;
    }
    if (regPassword && regPassword !== regConfirmPassword) {
      if (onShowToast) onShowToast('Passwords do not match. Please re-check.', 'error');
      return;
    }

    const welcomeBonusPoints = optInLoyalty ? 150 : 0;
    const newCust: Customer = {
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      address: regAddress.trim(),
      city: regCounty,
      county: regCounty,
      points: welcomeBonusPoints
    };

    if (onSaveCustomer) {
      onSaveCustomer(newCust);
    }
    if (onLoginCustomer) {
      onLoginCustomer(newCust.phone);
    }

    if (onShowToast) {
      onShowToast(
        `🎉 Account created successfully! Welcome to Kipchimatt Membership${welcomeBonusPoints > 0 ? ' (+150 Loyalty Points Earned!)' : ''}`,
        'success'
      );
    }

    // Switch view to active profile
    setName(newCust.name);
    setPhone(newCust.phone);
    setEmail(newCust.email);
    setCounty(newCust.county);
    setAddress(newCust.address);
    setActiveTab('profile');
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Header Banner */}
        <div className="bg-plum text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-yellow" />
            <div>
              <h3 className="font-extrabold text-base">My Supermarket Account</h3>
              <p className="text-[10px] text-white/80 font-medium">Manage preferences, loyalty rewards & orders</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 px-3 pt-2 gap-1.5 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${activeTab === 'profile' ? 'border-plum text-plum dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`pb-2.5 px-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${activeTab === 'loyalty' ? 'border-plum text-plum dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <Crown className="w-3.5 h-3.5 text-yellow" />
            <span>Loyalty Tiers</span>
            <span className="bg-plum text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">{points} pts</span>
          </button>
          <button
            onClick={() => setActiveTab('points_history')}
            className={`pb-2.5 px-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${activeTab === 'points_history' ? 'border-plum text-plum dark:text-pink-400 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <History className="w-3.5 h-3.5 text-plum" />
            <span>Points History</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 px-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${activeTab === 'orders' ? 'border-plum text-plum dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <Printer className="w-3.5 h-3.5 text-plum" />
            <span>5 Previous Receipts ({previousFiveOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create_account')}
            className={`pb-2.5 px-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${activeTab === 'create_account' ? 'border-plum text-plum dark:text-pink-400 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            <UserPlus className="w-3.5 h-3.5 text-green" />
            <span>Create Account</span>
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">

          {/* QUICK REORDER PREVIOUS CART PROMINENT BANNER (Shown across tabs if past orders exist) */}
          {activeOrders.length > 0 && activeTab !== 'create_account' && (
            <div className="bg-gradient-to-r from-plum/10 via-purple-500/10 to-pink-500/10 dark:from-plum/20 dark:to-purple-900/30 border border-plum/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-plum dark:text-pink-400" />
                  <span className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Reorder Previous Cart</span>
                  <span className="bg-green/10 text-green text-[10px] px-2 py-0.5 rounded-full font-bold">
                    Order #{activeOrders[0].id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                  Populate cart with {activeOrders[0].items.length} item(s) from your last order ({formatMoney(activeOrders[0].total)}).
                </p>
              </div>
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                {onViewReceipt && (
                  <button
                    type="button"
                    onClick={() => onViewReceipt(activeOrders[0])}
                    className="bg-white dark:bg-gray-800 hover:bg-gray-100 text-plum dark:text-pink-300 border border-plum/30 font-extrabold text-xs px-3 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                    title="Print e-receipt for last order"
                  >
                    <Printer className="w-3.5 h-3.5 text-plum" />
                    <span>Print Receipt</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (onReorderCart) {
                      onReorderCart(activeOrders[0].items);
                    }
                  }}
                  className="bg-plum hover:bg-plum-dark text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-2 whitespace-nowrap hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-4 h-4 text-yellow" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
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
              <form onSubmit={handleSave} className="space-y-3">
                <h4 className="font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">Personal Details</h4>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Email</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">County (47 Counties)</label>
                    <select
                      value={county}
                      onChange={e => setCounty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-gray-900 dark:text-white outline-none focus:border-plum"
                    >
                      {KENYA_COUNTIES.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Default Street / Estate</label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum font-semibold"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Update Account Details
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: LOYALTY TIER SYSTEM */}
          {activeTab === 'loyalty' && (
            <div className="space-y-5">
              {/* Current Tier Header Card */}
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

                {/* Progress Bar towards Next Level */}
                {nextTier ? (
                  <div className="space-y-1.5 mt-4 pt-3 border-t border-white/20">
                    <div className="flex justify-between text-[11px] font-bold text-white/90">
                      <span>Progress to {nextTier.icon} {nextTier.name}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="bg-yellow h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/75 font-medium text-right">
                      {pointsNeeded} more points required for {nextTier.name} rank
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-yellow mt-2">
                    🏆 Congratulations! You have reached the highest Platinum VIP Tier status.
                  </p>
                )}
              </div>

              {/* Rank Coupons & Unlockable Perks */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-plum" />
                    <span>Rank Coupons & VIP Benefits</span>
                  </h4>
                  <span className="text-[10px] text-gray-500 font-bold">Copy code to use at checkout</span>
                </div>

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

                          {/* Unlock Badge & Action */}
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

                        {/* Perk Details */}
                        <div className="mt-2.5 pt-2.5 border-t border-gray-150 dark:border-gray-700/60 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-[11px]">
                          <p className="font-bold text-plum dark:text-pink-400 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-yellow" />
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
          {activeTab === 'points_history' && (
            <div className="space-y-4">
              {/* Summary Header */}
              <div className="bg-gradient-to-r from-plum via-purple-800 to-indigo-900 text-white p-4.5 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow animate-pulse" />
                    <h4 className="font-black text-sm tracking-wide">Loyalty Points Balance</h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${currentTier.badgeBg}`}>
                      {currentTier.icon} {currentTier.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 font-medium">
                    Every 1 Point = KSh 1 discount redeemable optionally at checkout.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl border border-white/20 text-center self-stretch sm:self-auto">
                  <span className="text-[10px] uppercase text-white/70 block font-bold">Available Balance</span>
                  <span className="text-xl font-black text-yellow">{points} PTS</span>
                  <span className="text-[10px] font-bold text-white/90 block">(KSh {points} value)</span>
                </div>
              </div>

              {/* Points Ledger / Activity Stream */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-plum dark:text-pink-400" />
                    <span>Points Transaction Ledger</span>
                  </h4>
                  <span className="text-[10px] text-gray-500 font-bold">1 Point per KSh 100 spent</span>
                </div>

                {activeOrders.length === 0 ? (
                  <div className="space-y-3">
                    {/* Welcome / Initial Account Bonus row */}
                    <div className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-green/10 text-green flex items-center justify-center font-black">
                          <Sparkles className="w-5 h-5 text-green" />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-gray-900 dark:text-white">Account Membership Welcome Bonus</h5>
                          <p className="text-[10px] text-gray-500 font-medium">Initial registration loyalty rewards credit</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-green/10 text-green font-black text-xs px-2.5 py-1 rounded-lg border border-green/30 inline-block">
                          +{points} PTS
                        </span>
                      </div>
                    </div>

                    <div className="text-center py-6 space-y-1 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                      <Clock className="w-8 h-8 text-gray-300 mx-auto" />
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No order points activity yet</p>
                      <p className="text-[11px] text-gray-400">Earn +1 point for every KSh 100 spent on upcoming supermarket orders!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeOrders.map((order) => {
                      const earned = Math.floor(order.total / 100);
                      const redeemed = order.pointsRedeemed || 0;
                      const formattedDate = order.date ? new Date(order.date).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Recent Order';

                      return (
                        <div 
                          key={order.id}
                          className="p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs space-y-2 hover:border-plum/40 transition-all"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-gray-900 dark:text-white">
                                Order #{order.id.slice(-6).toUpperCase()}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">({order.items.length} items)</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">{formattedDate}</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/60">
                            <div className="flex items-center gap-2">
                              {redeemed > 0 && (
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>-{redeemed} PTS Redeemed</span>
                                </span>
                              )}

                              <span className="bg-green/10 text-green font-extrabold text-[10px] px-2 py-0.5 rounded-lg border border-green/30 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-green" />
                                <span>+{earned} PTS Earned</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-black text-xs text-gray-900 dark:text-white">
                                {formatMoney(order.total)}
                              </span>

                              {onViewReceipt && (
                                <button
                                  type="button"
                                  onClick={() => onViewReceipt(order)}
                                  className="text-[10px] text-plum dark:text-pink-300 hover:underline font-extrabold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>Receipt</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Account Creation Welcome Entry */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow" />
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">Account Signup Loyalty Credit</span>
                          <span className="text-[10px] text-gray-500 block font-medium">Initial signup bonus points</span>
                        </div>
                      </div>
                      <span className="bg-green/10 text-green font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-green/30">
                        +{customer?.points ? Math.min(150, customer.points) : 120} PTS
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 5 PREVIOUS RECEIPTS & ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-plum/5 dark:bg-gray-800 p-3.5 rounded-2xl border border-plum/20">
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 text-xs sm:text-sm">
                    <Printer className="w-4 h-4 text-plum dark:text-pink-400" />
                    <span>Your 5 Previous Receipts</span>
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                    View, print, or download official thermal receipts for your past purchases.
                  </p>
                </div>
                {previousFiveOrders.length > 0 && onViewReceipt && (
                  <button
                    type="button"
                    onClick={() => onViewReceipt(previousFiveOrders[0])}
                    className="bg-plum hover:bg-plum-dark text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Printer className="w-3.5 h-3.5 text-yellow" />
                    <span>Print Latest Receipt</span>
                  </button>
                )}
              </div>

              {previousFiveOrders.length === 0 ? (
                <div className="text-center py-8 space-y-2 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-gray-500 font-medium text-xs">No recent order history found yet.</p>
                  <p className="text-[11px] text-gray-400">Place an order at checkout to automatically generate your printable e-receipts!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {previousFiveOrders.map((order, idx) => (
                    <div 
                      key={order.id} 
                      className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-plum/40 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-plum/10 text-plum dark:text-pink-300 font-black text-[10px] px-2 py-0.5 rounded-md">
                            Receipt #{idx + 1}
                          </span>
                          <p className="font-extrabold text-gray-900 dark:text-white text-xs">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <span className="text-[10px] font-bold text-green uppercase bg-green/10 px-2 py-0.5 rounded-md">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">
                          {new Date(order.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {order.items.length} item(s)
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-1 font-medium">
                          {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-150 dark:border-gray-700">
                        <span className="font-black text-plum dark:text-pink-400 text-sm mr-1">{formatMoney(order.total)}</span>
                        
                        {onViewReceipt && (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(order)}
                            className="bg-plum/10 hover:bg-plum hover:text-white text-plum dark:text-pink-300 font-extrabold text-[11px] px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Print e-receipt for this order"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Receipt</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onReorderCart && onReorderCart(order.items)}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-extrabold text-[11px] px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Populate cart with these items"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CREATE AN ACCOUNT */}
          {activeTab === 'create_account' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-plum/10 via-purple-500/10 to-pink-500/10 dark:from-plum/20 dark:to-purple-900/30 p-4 rounded-2xl border border-plum/20">
                <div className="flex items-center gap-2 text-plum dark:text-pink-300 font-extrabold text-sm mb-1">
                  <UserPlus className="w-4 h-4 text-green" />
                  <span>Create Your Kipchimatt Account</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                  Register for a free shopper account to save your delivery addresses, earn <strong>150 Loyalty Welcome Points</strong>, and instantly track & print your purchase receipts.
                </p>
              </div>

              <form onSubmit={handleCreateAccountSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jane Wanjiru"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-plum outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number (M-PESA) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-plum outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="e.g. jane@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-plum outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Delivery County *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                      <select
                        value={regCounty}
                        onChange={(e) => setRegCounty(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-plum outline-none text-gray-900 dark:text-white"
                      >
                        {KENYA_COUNTIES.map(c => (
                          <option key={c.code} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Street / Estate Address
                    </label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="e.g. Westlands, Commercial St"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-plum outline-none text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Password (Optional)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-plum outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs focus:ring-2 focus:ring-plum outline-none text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="optInLoyalty"
                    checked={optInLoyalty}
                    onChange={(e) => setOptInLoyalty(e.target.checked)}
                    className="mt-0.5 rounded text-plum focus:ring-plum accent-plum cursor-pointer"
                  />
                  <label htmlFor="optInLoyalty" className="text-[11px] text-amber-900 dark:text-amber-200 cursor-pointer font-medium">
                    <strong>Claim 150 Welcome Loyalty Points</strong> — Unlock Bronze Tier perks immediately and earn points on every future order!
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <UserPlus className="w-4 h-4 text-yellow" />
                    <span>Create My Account Now</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

