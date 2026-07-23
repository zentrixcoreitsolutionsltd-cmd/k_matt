import React, { useState } from 'react';
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, 
  CreditCard, Phone, MapPin, User, Mail, ShieldCheck, CheckCircle2, 
  Truck, Tag, Building2, Lock, Smartphone, RefreshCw, Printer, AlertCircle, Sparkles, Check, Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { CartItem, StoreSettings, Order, Customer } from '../types';
import { formatMoney } from '../data/catalog';
import { KENYA_COUNTIES } from '../data/counties';
import ReceiptModal from './ReceiptModal';
import { generatePdfReceipt } from '../utils/generatePdfReceipt';

interface CartPageProps {
  cart: CartItem[];
  settings: StoreSettings;
  onQtyChange: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout?: () => void;
  onContinueShopping?: () => void;
  deliveryLocation?: string;
  onDeliveryLocationChange?: (county: string) => void;
  onPlaceOrder?: (
    customerData: Customer, 
    paymentMethod: string, 
    notes?: string,
    extraDetails?: {
      discountAmount?: number;
      couponCode?: string;
      deliveryType?: 'express' | 'pickup';
      pickupBranch?: string;
      transactionRef?: string;
      receiptNo?: string;
    }
  ) => Order | null;
  onBackToShop?: () => void;
  orders?: Order[];
}

const PICKUP_BRANCHES = [
  'Nairobi Flagship Branch (Koinange St)',
  'Nakuru Mega Superstore (Kenyatta Ave)',
  'Eldoret West Branch (Uganda Rd)',
  'Kisumu Lakeside Mall Branch',
  'Kericho Town Center Branch',
  'Bomet Superstore Branch',
  'Kitale Mall Branch'
];

export default function CartPage({
  cart,
  settings,
  onQtyChange,
  onRemoveItem,
  onContinueShopping,
  deliveryLocation = 'Nairobi',
  onDeliveryLocationChange,
  onPlaceOrder,
  onBackToShop,
  orders
}: CartPageProps) {
  // Steps: 'basket' | 'shipping' | 'payment' | 'confirmation'
  const [step, setStep] = useState<'basket' | 'shipping' | 'payment' | 'confirmation'>('basket');
  
  // Fulfillment
  const [deliveryType, setDeliveryType] = useState<'express' | 'pickup'>('express');
  const [selectedBranch, setSelectedBranch] = useState(PICKUP_BRANCHES[0]);

  // Customer Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('0712345678');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Coupon System
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'percent' | 'flat' | 'free_shipping' } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'M-PESA' | 'Card' | 'Cash on Delivery'>('M-PESA');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // M-Pesa STK Simulation State
  const [stkPhone, setStkPhone] = useState('0712345678');
  const [stkStatus, setStkStatus] = useState<'idle' | 'sending' | 'pin_prompt' | 'processing' | 'success'>('idle');
  const [stkPin, setStkPin] = useState('');
  const [stkTxnRef, setStkTxnRef] = useState('');

  // Placed Order Result
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = Math.round((rawSubtotal * appliedCoupon.discount) / 100);
    } else if (appliedCoupon.type === 'flat') {
      discountAmount = Math.min(rawSubtotal, appliedCoupon.discount);
    }
  }

  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  
  let deliveryFee = 0;
  if (deliveryType === 'express') {
    if (appliedCoupon?.type === 'free_shipping') {
      deliveryFee = 0;
    } else {
      deliveryFee = subtotalAfterDiscount >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
    }
  }

  const grandTotal = subtotalAfterDiscount + deliveryFee;
  const isFreeDelivery = deliveryType === 'express' && deliveryFee === 0;

  // Coupon handling
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'KIPCHIMATT10') {
      setAppliedCoupon({ code, discount: 10, type: 'percent' });
    } else if (code === 'BRONZE5') {
      setAppliedCoupon({ code, discount: 5, type: 'percent' });
    } else if (code === 'SILVER10') {
      setAppliedCoupon({ code, discount: 10, type: 'percent' });
    } else if (code === 'GOLD15') {
      setAppliedCoupon({ code, discount: 15, type: 'percent' });
    } else if (code === 'PLATINUM20') {
      setAppliedCoupon({ code, discount: 20, type: 'percent' });
    } else if (code === 'FREE254') {
      setAppliedCoupon({ code, discount: 0, type: 'free_shipping' });
    } else if (code === 'SAVE500') {
      setAppliedCoupon({ code, discount: 500, type: 'flat' });
    } else if (code === 'WELCOME100') {
      setAppliedCoupon({ code, discount: 100, type: 'flat' });
    } else {
      setCouponError('Invalid coupon code. Try "BRONZE5", "SILVER10", "GOLD15", "PLATINUM20", or "FREE254"');
    }
  };

  // Card formatting
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.substring(0, 2)}/${raw.substring(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Get Card Brand Logo / Name
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    return 'Debit / Credit Card';
  };

  // STK Push Simulation Trigger
  const handleTriggerStkPush = () => {
    if (!stkPhone || stkPhone.length < 9) return;
    setStkStatus('sending');
    setTimeout(() => {
      setStkStatus('pin_prompt');
    }, 1200);
  };

  const handleConfirmStkPin = () => {
    if (!stkPin || stkPin.length < 4) return;
    setStkStatus('processing');
    
    setTimeout(() => {
      const generatedRef = `MP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setStkTxnRef(generatedRef);
      setStkStatus('success');
      
      // Auto-submit order after M-Pesa approval
      executeOrderPlacement(`M-PESA (${generatedRef})`, generatedRef);
    }, 2500);
  };

  // Order Execution Helper
  const executeOrderPlacement = (finalPaymentMethod: string, customTxnRef?: string) => {
    if (!onPlaceOrder) return;

    const customerData: Customer = {
      name: name || 'Valued Shopper',
      phone: phone || stkPhone || '0712345678',
      email: email || 'customer@kipchimatt.co.ke',
      address: deliveryType === 'pickup' ? `In-Store Pick Up: ${selectedBranch}` : (address || 'Doorstep Delivery'),
      city: deliveryLocation,
      county: deliveryLocation,
      points: Math.floor(grandTotal / 100)
    };

    const newRecNo = `KIP-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalTxnRef = customTxnRef || (finalPaymentMethod.includes('Card') ? `CARD-AUTH-${Math.floor(100000 + Math.random() * 900000)}` : `COD-${Math.floor(100000 + Math.random() * 900000)}`);

    const created = onPlaceOrder(customerData, finalPaymentMethod, notes, {
      discountAmount,
      couponCode: appliedCoupon?.code,
      deliveryType,
      pickupBranch: deliveryType === 'pickup' ? selectedBranch : undefined,
      transactionRef: finalTxnRef,
      receiptNo: newRecNo
    });

    if (created) {
      setCompletedOrder(created);
      setStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 14 || !cardHolder || !cardExpiry || !cardCvc) return;
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    executeOrderPlacement(`Credit Card (${getCardBrand()} ****${cardNumber.slice(-4)})`, authCode);
  };

  const handleCodSubmit = () => {
    executeOrderPlacement('Cash / M-Pesa on Delivery');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Printable Receipt Modal Overlay */}
      {completedOrder && (
        <ReceiptModal 
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          order={completedOrder}
          settings={settings}
        />
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={onBackToShop || onContinueShopping}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-plum hover:underline cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping Supermarket Items</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Checkout & Order Fulfillment
          </h1>
        </div>

        {/* Step Progress Pill Bar */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm text-xs font-bold">
          <button 
            onClick={() => setStep('basket')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${step === 'basket' ? 'bg-plum text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>1. Cart ({cart.reduce((s, i) => s + i.qty, 0)})</span>
          </button>

          <span className="text-gray-300 dark:text-gray-700">/</span>

          <button 
            onClick={() => cart.length > 0 && setStep('shipping')}
            disabled={cart.length === 0}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${step === 'shipping' ? 'bg-plum text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-40'}`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>2. Delivery</span>
          </button>

          <span className="text-gray-300 dark:text-gray-700">/</span>

          <button 
            onClick={() => cart.length > 0 && name && phone && setStep('payment')}
            disabled={cart.length === 0 || !name || !phone}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${step === 'payment' ? 'bg-plum text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-40'}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>3. Payment</span>
          </button>
        </div>
      </div>

      {/* If Cart Empty */}
      {cart.length === 0 && step !== 'confirmation' ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto shadow-lg">
          <div className="w-20 h-20 rounded-full bg-plum-fade dark:bg-gray-800 text-plum mx-auto flex items-center justify-center">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-200">Your basket is currently empty</h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Explore our vast catalog of fresh groceries, food cupboard essentials, electronics, and household items.
          </p>
          <button 
            onClick={onContinueShopping}
            className="bg-plum hover:bg-plum-dark text-white font-extrabold text-xs px-8 py-3.5 rounded-xl transition-colors cursor-pointer uppercase tracking-wider shadow-md"
          >
            Explore Supermarket Store
          </button>
        </div>
      ) : step === 'confirmation' && completedOrder ? (
        
        /* ORDER CONFIRMATION & RECEIPT SCREEN */
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 max-w-3xl mx-auto shadow-2xl space-y-6 animate-scale-up">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/60 text-green flex items-center justify-center mx-auto border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-10 h-10 text-green" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order Confirmed & Paid!</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Thank you for shopping at Kipchimatt. Receipt <strong className="text-plum dark:text-pink-400 font-extrabold">{completedOrder.receiptNo}</strong> is issued and saved.
            </p>
          </div>

          {/* Quick Summary Card */}
          <div className="bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400 font-bold">Total Amount Paid:</span>
              <span className="text-plum dark:text-pink-400 font-black text-base">{formatMoney(completedOrder.total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Payment Method</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{completedOrder.payment}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Transaction Ref</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{completedOrder.transactionRef}</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Recipient</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{completedOrder.customer.name} ({completedOrder.customer.phone})</span>
              </div>
              <div>
                <span className="text-gray-400 font-bold block text-[10px] uppercase">Fulfillment</span>
                <span className="font-extrabold text-gray-900 dark:text-white">{completedOrder.customer.address}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => generatePdfReceipt(completedOrder, settings)}
              className="flex-1 bg-green hover:bg-green-dark text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Receipt</span>
            </button>

            <button 
              onClick={() => setIsReceiptModalOpen(true)}
              className="flex-1 bg-plum hover:bg-plum-dark text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>View & Print Receipt</span>
            </button>

            <button 
              onClick={onContinueShopping}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs px-6 py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              Back to Store
            </button>
          </div>
        </div>

      ) : (
        /* MAIN 3-STEP CHECKOUT LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Main Step View (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: BASKET ITEMS */}
            {step === 'basket' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
                    <h2 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-plum" />
                      <span>Shopping Basket Items ({cart.length})</span>
                    </h2>
                    
                    {/* Free Delivery Bar Indicator */}
                    <div className="text-xs font-bold text-gray-600 dark:text-gray-300">
                      {isFreeDelivery ? (
                        <span className="text-green font-extrabold flex items-center gap-1">
                          <Check className="w-4 h-4" /> FREE Delivery Qualified!
                        </span>
                      ) : (
                        <span>
                          Add <strong>{formatMoney(settings.freeDeliveryThreshold - subtotalAfterDiscount)}</strong> for FREE delivery
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-150 dark:divide-gray-800">
                    {cart.map((item) => (
                      <div key={item.id} className="py-4 flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">{item.name}</h3>
                          <p className="text-xs font-black text-plum dark:text-pink-400 mt-1">{formatMoney(item.price)} each</p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-1.5">
                            <button onClick={() => onQtyChange(item.id, -1)} className="text-gray-500 hover:text-plum font-bold cursor-pointer">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-gray-900 dark:text-white min-w-[20px] text-center">{item.qty}</span>
                            <button onClick={() => onQtyChange(item.id, 1)} className="text-gray-500 hover:text-plum font-bold cursor-pointer">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-xs font-black text-gray-900 dark:text-white w-20 text-right">
                            {formatMoney(item.price * item.qty)}
                          </span>

                          <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 p-1 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Location Selector & Fulfillment Choice */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-plum" />
                    <span>Select Fulfillment Method</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setDeliveryType('express')}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${deliveryType === 'express' ? 'border-plum bg-plum/5 ring-2 ring-plum/20' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <div className="flex items-center gap-2 font-black text-xs text-gray-900 dark:text-white">
                        <Truck className="w-4 h-4 text-plum" />
                        <span>Doorstep Rider Express</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Delivered in under 90 mins to your address in {deliveryLocation}.
                      </p>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${deliveryType === 'pickup' ? 'border-green bg-green/5 ring-2 ring-green/20' : 'border-gray-200 dark:border-gray-700'}`}
                    >
                      <div className="flex items-center gap-2 font-black text-xs text-gray-900 dark:text-white">
                        <Building2 className="w-4 h-4 text-green" />
                        <span>In-Store Pick Up (Free)</span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Collect ready packed order at any Kipchimatt branch counter.
                      </p>
                    </button>
                  </div>

                  {deliveryType === 'pickup' ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Select Pickup Branch:</label>
                      <select 
                        value={selectedBranch}
                        onChange={e => setSelectedBranch(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white outline-none"
                      >
                        {PICKUP_BRANCHES.map((b, i) => (
                          <option key={i} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">Target County (47 Counties in Kenya):</label>
                      <select 
                        value={deliveryLocation}
                        onChange={e => onDeliveryLocationChange && onDeliveryLocationChange(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-plum"
                      >
                        {KENYA_COUNTIES.map(c => (
                          <option key={c.code} value={c.name}>{c.name} County ({c.code})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setStep('shipping')}
                  className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs uppercase tracking-wider py-4 rounded-2xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Proceed to Delivery Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: SHIPPING / CONTACT FORM */}
            {step === 'shipping' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h2 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-150 dark:border-gray-800 pb-3">
                  <User className="w-5 h-5 text-plum" />
                  <span>2. Customer Contact & Delivery Address</span>
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., Jane Wambui" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold outline-none focus:border-plum"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Phone Number (M-Pesa) *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input 
                          type="tel" 
                          required 
                          placeholder="0712345678" 
                          value={phone} 
                          onChange={e => {
                            setPhone(e.target.value);
                            setStkPhone(e.target.value);
                          }}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold outline-none focus:border-plum"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Email Address (For E-Receipt)</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input 
                          type="email" 
                          placeholder="jane@example.com" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold outline-none focus:border-plum"
                        />
                      </div>
                    </div>
                  </div>

                  {deliveryType === 'express' ? (
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Doorstep Address / House No / Landmark *</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input 
                          type="text" 
                          required 
                          placeholder="Apt 4B, Westlands Heights, Parklands Rd" 
                          value={address} 
                          onChange={e => setAddress(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold outline-none focus:border-plum"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-950/40 p-3 rounded-xl border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-green" />
                      <span>Order will be prepared for pickup at <strong>{selectedBranch}</strong>.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Special Rider Notes (Optional)</label>
                    <textarea 
                      rows={2} 
                      placeholder="e.g., Leave package with gate security or call upon arrival" 
                      value={notes} 
                      onChange={e => setNotes(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium outline-none focus:border-plum"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-150 dark:border-gray-800">
                  <button 
                    onClick={() => setStep('basket')}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs px-6 py-3.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Back to Basket
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (!name || !phone) return;
                      setStep('payment');
                    }}
                    disabled={!name || !phone}
                    className="flex-1 bg-plum hover:bg-plum-dark text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>Proceed to Secure Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: HIGH-END PAYMENT SELECTION */}
            {step === 'payment' && (
              <div className="space-y-6">
                
                {/* Method selector tabs */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h2 className="font-black text-base text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-150 dark:border-gray-800 pb-3">
                    <Lock className="w-5 h-5 text-plum" />
                    <span>3. Choose Payment Method ({formatMoney(grandTotal)})</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('M-PESA')}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center font-extrabold text-xs cursor-pointer transition-all flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1.5 min-w-0 ${paymentMethod === 'M-PESA' ? 'border-green bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 ring-2 ring-green/20' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green flex-shrink-0" />
                      <span className="truncate">M-PESA Express</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center font-extrabold text-xs cursor-pointer transition-all flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1.5 min-w-0 ${paymentMethod === 'Card' ? 'border-plum bg-plum/10 text-plum ring-2 ring-plum/20' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-plum flex-shrink-0" />
                      <span className="truncate">Credit / Debit Card</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setPaymentMethod('Cash on Delivery')}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-center font-extrabold text-xs cursor-pointer transition-all flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-1.5 min-w-0 ${paymentMethod === 'Cash on Delivery' ? 'border-yellow bg-yellow/10 text-yellow-800 dark:text-yellow-400 ring-2 ring-yellow/20' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                      <span className="truncate">Pay on Delivery</span>
                    </button>
                  </div>
                </div>

                {/* OPTION A: M-PESA EXPRESS INTERACTIVE PANEL */}
                {paymentMethod === 'M-PESA' && (
                  <div className="bg-white dark:bg-gray-900 border border-green-200 dark:border-green-900 rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-green text-white font-black text-sm flex items-center justify-center">
                        M
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Lipa na M-PESA STK Push Prompt</h3>
                        <p className="text-xs text-gray-500">Instant Safaricom Daraja integration prompt directly to your phone.</p>
                      </div>
                    </div>

                    {stkStatus === 'idle' && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">M-PESA Registered Phone Number:</label>
                          <input 
                            type="tel" 
                            value={stkPhone} 
                            onChange={e => setStkPhone(e.target.value)}
                            placeholder="0712345678"
                            className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm outline-none focus:border-green"
                          />
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl text-xs space-y-1 border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between font-bold">
                            <span className="text-gray-500">Till / Paybill Number:</span>
                            <span className="text-green font-extrabold">KIPCHIMATT 889210</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span className="text-gray-500">Amount to Charge:</span>
                            <span className="text-plum dark:text-pink-400 font-extrabold">{formatMoney(grandTotal)}</span>
                          </div>
                        </div>

                        <button 
                          onClick={handleTriggerStkPush}
                          className="w-full bg-green hover:bg-green-dark text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Send M-PESA Prompt ({formatMoney(grandTotal)})</span>
                        </button>
                      </div>
                    )}

                    {stkStatus === 'sending' && (
                      <div className="p-6 text-center space-y-3">
                        <RefreshCw className="w-8 h-8 text-green animate-spin mx-auto" />
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Connecting to Safaricom M-PESA...</h4>
                        <p className="text-xs text-gray-500">Sending STK Push prompt to {stkPhone}. Please keep your phone unlocked.</p>
                      </div>
                    )}

                    {stkStatus === 'pin_prompt' && (
                      <div className="bg-gray-900 text-white p-5 rounded-2xl space-y-3 border border-green-500/30 animate-fade-in">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                          <span className="text-[10px] font-mono text-green uppercase tracking-widest">Safaricom Sim Toolkit</span>
                          <span className="text-[10px] text-gray-400">Ref: {formatMoney(grandTotal)}</span>
                        </div>
                        <p className="text-xs font-semibold text-gray-200">
                          Do you want to pay KSh {grandTotal.toLocaleString()} to KIPCHIMATT SUPERMARKET Account 0712...?
                        </p>
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold mb-1">Enter M-PESA PIN:</label>
                          <input 
                            type="password" 
                            maxLength={4}
                            value={stkPin}
                            onChange={e => setStkPin(e.target.value)}
                            placeholder="• • • •"
                            className="w-full text-center tracking-widest text-lg font-black bg-black border border-green-500/50 rounded-xl py-2 text-green outline-none"
                          />
                        </div>
                        <button 
                          onClick={handleConfirmStkPin}
                          disabled={stkPin.length < 4}
                          className="w-full bg-green hover:bg-green-dark text-white font-extrabold text-xs py-2.5 rounded-xl cursor-pointer disabled:opacity-50"
                        >
                          Send M-PESA Payment
                        </button>
                      </div>
                    )}

                    {stkStatus === 'processing' && (
                      <div className="p-6 text-center space-y-3">
                        <RefreshCw className="w-8 h-8 text-plum animate-spin mx-auto" />
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">Verifying Transaction with Safaricom...</h4>
                        <p className="text-xs text-gray-500">Authenticating PIN and awaiting payment notification callback.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* OPTION B: CARD PAYMENT WITH VISUAL CARD PREVIEW */}
                {paymentMethod === 'Card' && (
                  <form onSubmit={handleCardSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-md space-y-4">
                    
                    {/* Visual Card Widget */}
                    <div className="bg-gradient-to-tr from-plum-dark via-plum to-pink-900 text-white rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-4 relative overflow-hidden">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-white/70 uppercase truncate">KIPCHIMATT SECURE CARD</span>
                        <span className="font-black text-xs sm:text-sm text-yellow uppercase flex-shrink-0">{getCardBrand()}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] sm:text-[9px] font-bold text-white/60 uppercase">Card Number</span>
                        <p className="font-mono text-sm sm:text-base tracking-wider sm:tracking-widest font-extrabold break-all">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </p>
                      </div>

                      <div className="flex justify-between items-end text-xs gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] font-bold text-white/60 block uppercase">Cardholder Name</span>
                          <span className="font-extrabold uppercase text-[10px] sm:text-xs truncate block">{cardHolder || 'VALUED SHOPPER'}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[8px] font-bold text-white/60 block uppercase">Expires</span>
                          <span className="font-mono font-bold text-[10px] sm:text-xs">{cardExpiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Card Number *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="4111 2222 3333 4444" 
                          value={cardNumber} 
                          onChange={e => handleCardNumberChange(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none focus:border-plum"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Cardholder Name *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Jane Wambui" 
                          value={cardHolder} 
                          onChange={e => setCardHolder(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none focus:border-plum"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Expiry Date *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="MM/YY" 
                            value={cardExpiry} 
                            onChange={e => handleExpiryChange(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none focus:border-plum text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">CVC / CVV *</label>
                          <input 
                            type="password" 
                            required 
                            maxLength={4}
                            placeholder="123" 
                            value={cardCvc} 
                            onChange={e => setCardCvc(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold outline-none focus:border-plum text-center"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input 
                          type="checkbox" 
                          id="saveCard" 
                          checked={saveCard} 
                          onChange={e => setSaveCard(e.target.checked)} 
                          className="rounded text-plum focus:ring-plum"
                        />
                        <label htmlFor="saveCard" className="text-gray-600 dark:text-gray-300 font-semibold cursor-pointer">
                          Save card securely for 1-click checkout in future
                        </label>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Pay {formatMoney(grandTotal)} with Card</span>
                    </button>
                  </form>
                )}

                {/* OPTION C: CASH ON DELIVERY */}
                {paymentMethod === 'Cash on Delivery' && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-md space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-950/40 p-4 rounded-2xl border border-yellow-200 dark:border-yellow-800 text-xs text-yellow-900 dark:text-yellow-200 space-y-1">
                      <h4 className="font-extrabold flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-yellow-600" />
                        <span>Pay on Delivery / Collection</span>
                      </h4>
                      <p>
                        You can pay our rider in cash or via M-Pesa upon doorstep arrival or pick up counter.
                      </p>
                    </div>

                    <button 
                      onClick={handleCodSubmit}
                      className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Confirm Order ({formatMoney(grandTotal)})</span>
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => setStep('shipping')}
                  className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Delivery Info
                </button>
              </div>
            )}

          </div>

          {/* Right Sidebar: Order Financial Summary & Coupon Box */}
          <div className="space-y-6">
            
            {/* Summary Card with Slide-In Motion Animation */}
            <motion.div 
              key={`${grandTotal}-${cart.reduce((s, i) => s + i.qty, 0)}`}
              initial={{ x: 18, opacity: 0.85 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4 sticky top-24"
            >
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white border-b border-gray-150 dark:border-gray-800 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-[10px] bg-plum-fade dark:bg-plum/20 text-plum dark:text-pink-300 px-2 py-0.5 rounded-full font-bold">
                  Live Rate
                </span>
              </h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300">Have a Promo Coupon?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="text" 
                      placeholder="e.g. KIPCHIMATT10" 
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs uppercase font-extrabold outline-none focus:border-plum"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-plum hover:bg-plum-dark text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red font-bold">{couponError}</p>}
                {appliedCoupon && (
                  <div className="bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 p-2 rounded-xl text-[11px] font-bold flex items-center justify-between border border-green-200 dark:border-green-800">
                    <span>🎉 Coupon "{appliedCoupon.code}" Applied!</span>
                    <button type="button" onClick={() => setAppliedCoupon(null)} className="text-red hover:underline ml-2">Remove</button>
                  </div>
                )}
              </form>

              {/* Financial Lines */}
              <div className="space-y-2.5 text-xs border-t border-gray-150 dark:border-gray-800 pt-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatMoney(rawSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green font-bold">
                    <span>Coupon Savings</span>
                    <span>-{formatMoney(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Delivery ({deliveryType === 'pickup' ? 'Pick Up' : deliveryLocation})</span>
                  <span>
                    {deliveryFee === 0 ? <strong className="text-green font-extrabold">FREE</strong> : formatMoney(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Included 16% VAT</span>
                  <span>{formatMoney(Math.round((grandTotal * 0.16) / 1.16))}</span>
                </div>

                <motion.div 
                  key={grandTotal}
                  initial={{ scale: 0.96, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700 bg-plum/5 dark:bg-plum/10 p-2.5 rounded-xl border border-plum/10"
                >
                  <span>Total Amount</span>
                  <span className="text-plum dark:text-pink-400 font-black">{formatMoney(grandTotal)}</span>
                </motion.div>
              </div>

              {/* Loyalty points notification */}
              <div className="bg-plum-fade dark:bg-gray-800 p-3 rounded-2xl text-[11px] font-bold text-plum dark:text-pink-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow" />
                <span>Earn +{Math.floor(grandTotal / 100)} Kipchimatt Loyalty Points on this order!</span>
              </div>

              <div className="text-[10px] text-gray-400 text-center font-semibold pt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green" />
                <span>256-bit Encrypted SSL Checkout Security</span>
              </div>
            </motion.div>

          </div>

        </div>
      )}

    </div>
  );
}
