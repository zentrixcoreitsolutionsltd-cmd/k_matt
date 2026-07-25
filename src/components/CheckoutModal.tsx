import React, { useState } from 'react';
import { 
  X, CheckCircle, ShieldCheck, CreditCard, Phone, MapPin, User, Mail, 
  Smartphone, Lock, Building2, Printer, RefreshCw, Download 
} from 'lucide-react';
import { CartItem, StoreSettings, Customer, Order } from '../types';
import { formatMoney } from '../data/catalog';
import { KENYA_COUNTIES } from '../data/counties';
import ReceiptModal from './ReceiptModal';
import { generatePdfReceipt } from '../utils/generatePdfReceipt';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  deliveryLocation: string;
  onPlaceOrder: (
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
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  settings,
  deliveryLocation,
  onPlaceOrder
}: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('0712345678');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCounty, setSelectedCounty] = useState(deliveryLocation || 'Nairobi');
  const [paymentMethod, setPaymentMethod] = useState<'M-PESA' | 'Card' | 'Cash on Delivery'>('M-PESA');
  const [notes, setNotes] = useState('');

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // M-Pesa STK push simulation
  const [stkStatus, setStkStatus] = useState<'idle' | 'sending' | 'pin_prompt' | 'processing' | 'success'>('idle');
  const [stkPin, setStkPin] = useState('');

  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : settings.deliveryFee;
  const total = subtotal + deliveryFee;

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 16);
    setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.substring(0, 2)}/${raw.substring(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const triggerStkPrompt = () => {
    if (!phone) return;
    setStkStatus('sending');
    setTimeout(() => {
      setStkStatus('pin_prompt');
    }, 1200);
  };

  const handleConfirmPin = () => {
    if (stkPin.length < 4) return;
    setStkStatus('processing');
    setTimeout(() => {
      const generatedRef = `MP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setStkStatus('success');
      submitFinalOrder(`M-PESA (${generatedRef})`, generatedRef);
    }, 2200);
  };

  const submitFinalOrder = (finalPaymentMethod: string, customTxnRef?: string) => {
    const customer: Customer = {
      name: name || 'Valued Customer',
      phone: phone || '0712345678',
      email,
      address: address || 'Doorstep Delivery',
      city: selectedCounty,
      county: selectedCounty,
      points: Math.floor(subtotal / 100)
    };

    const newRecNo = `KIP-REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalRef = customTxnRef || (finalPaymentMethod.includes('Card') ? `CARD-AUTH-${Math.floor(100000 + Math.random() * 900000)}` : `COD-${Math.floor(100000 + Math.random() * 900000)}`);

    const order = onPlaceOrder(customer, finalPaymentMethod, notes, {
      transactionRef: finalRef,
      receiptNo: newRecNo,
      deliveryType: 'express'
    });

    if (order) {
      setPlacedOrder(order);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) return;

    if (paymentMethod === 'M-PESA') {
      triggerStkPrompt();
    } else if (paymentMethod === 'Card') {
      if (cardNumber.length < 14) return;
      submitFinalOrder(`Credit Card (****${cardNumber.slice(-4)})`);
    } else {
      submitFinalOrder('Cash on Delivery');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-fade-in">
      
      {placedOrder && (
        <ReceiptModal 
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          order={placedOrder}
          settings={settings}
        />
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto relative border border-gray-200 dark:border-gray-800 animate-scale-up my-auto">
        
        {/* Header */}
        <div className="bg-plum text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base">Express Checkout Portal</h3>
            <p className="text-xs text-white/80">Delivering to {deliveryLocation} County</p>
          </div>
          <button 
            onClick={() => { setPlacedOrder(null); onClose(); }}
            className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {placedOrder ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle className="w-10 h-10 text-green" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">Order Confirmed!</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Receipt <strong className="text-plum font-bold">{placedOrder.receiptNo}</strong> generated.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-left text-xs space-y-2 border border-gray-150 dark:border-gray-700">
              <div className="flex justify-between font-bold">
                <span className="text-gray-500">Total Paid:</span>
                <span className="text-plum dark:text-pink-400 font-extrabold">{formatMoney(placedOrder.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Channel:</span>
                <span className="font-bold">{placedOrder.payment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="font-bold">{placedOrder.customer.address}, {placedOrder.customer.county}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button 
                onClick={() => generatePdfReceipt(placedOrder, settings)}
                className="flex-1 bg-green hover:bg-green-dark text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button 
                onClick={() => setIsReceiptModalOpen(true)}
                className="flex-1 bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>View & Print</span>
              </button>

              <button 
                onClick={() => { setPlacedOrder(null); onClose(); }}
                className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs px-4 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
            
            {/* Customer Information */}
            <div className="space-y-3">
              <h4 className="font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[11px]">Recipient & Address</h4>
              
              <div>
                <label className="block text-gray-500 font-bold mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., John Kamau" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold outline-none focus:border-plum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input 
                      type="tel" 
                      required 
                      placeholder="0712345678" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold outline-none focus:border-plum"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold outline-none focus:border-plum"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Delivery County (47 Counties)</label>
                  <select
                    value={selectedCounty}
                    onChange={e => setSelectedCounty(e.target.value)}
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
                  <label className="block text-gray-500 font-bold mb-1">Delivery Address / Landmark *</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      required 
                      placeholder="Apt, Street, Estate, Landmark" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold outline-none focus:border-plum"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-gray-500 font-bold mb-1 text-[11px] sm:text-xs">Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('M-PESA')}
                    className={`py-2 px-1 sm:px-2 rounded-xl border font-extrabold text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 min-w-0 ${paymentMethod === 'M-PESA' ? 'border-green bg-green-50 dark:bg-green-950/40 text-green' : 'border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    <Smartphone className="w-4 h-4 text-green flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs truncate w-full">M-PESA</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2 px-1 sm:px-2 rounded-xl border font-extrabold text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 min-w-0 ${paymentMethod === 'Card' ? 'border-plum bg-plum/10 text-plum' : 'border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    <CreditCard className="w-4 h-4 text-plum flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs truncate w-full">Card</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('Cash on Delivery')}
                    className={`py-2 px-1 sm:px-2 rounded-xl border font-extrabold text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 min-w-0 ${paymentMethod === 'Cash on Delivery' ? 'border-plum bg-plum/10 text-plum dark:text-pink-300' : 'border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                  >
                    <Building2 className="w-4 h-4 text-plum dark:text-pink-400 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs truncate w-full">Cash</span>
                  </button>
                </div>
              </div>

              {/* M-Pesa Pin Box Sub-Section */}
              {paymentMethod === 'M-PESA' && stkStatus === 'pin_prompt' && (
                <div className="bg-gray-900 text-white p-4 rounded-xl space-y-2 animate-fade-in border border-green-500/40">
                  <p className="text-[11px] font-semibold text-gray-200">
                    Safaricom STK Prompt: Pay KSh {total.toLocaleString()} to KIPCHIMATT.
                  </p>
                  <div>
                    <input 
                      type="password" 
                      maxLength={4} 
                      placeholder="Enter M-Pesa PIN" 
                      value={stkPin} 
                      onChange={e => setStkPin(e.target.value)}
                      className="w-full text-center tracking-widest font-mono text-base py-1.5 rounded-lg bg-black text-green border border-green-500/60 outline-none"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={handleConfirmPin}
                    disabled={stkPin.length < 4}
                    className="w-full bg-green text-white font-bold py-2 rounded-lg cursor-pointer text-xs disabled:opacity-50"
                  >
                    Confirm M-Pesa Payment
                  </button>
                </div>
              )}

              {/* Card Inputs */}
              {paymentMethod === 'Card' && (
                <div className="space-y-2 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <input 
                      type="text" 
                      required 
                      placeholder="Card Number (4111 2222...)" 
                      value={cardNumber} 
                      onChange={e => handleCardNumberChange(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      required 
                      placeholder="MM/YY" 
                      value={cardExpiry} 
                      onChange={e => handleExpiryChange(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-center font-bold"
                    />
                    <input 
                      type="password" 
                      required 
                      maxLength={4}
                      placeholder="CVV" 
                      value={cardCvc} 
                      onChange={e => setCardCvc(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono text-center font-bold"
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-gray-150 dark:border-gray-800 space-y-2">
              <div className="flex justify-between text-gray-600 font-bold">
                <span>Order Total:</span>
                <span className="text-plum dark:text-pink-400 font-black text-sm">{formatMoney(total)}</span>
              </div>

              {stkStatus === 'sending' || stkStatus === 'processing' ? (
                <div className="p-3 text-center text-plum font-bold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-plum" />
                  <span>Processing Safaricom Transaction...</span>
                </div>
              ) : (
                <button 
                  type="submit"
                  className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Pay & Complete Order ({formatMoney(total)})
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
