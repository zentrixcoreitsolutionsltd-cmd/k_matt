import React from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Truck, ArrowLeft, Sparkles } from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { formatMoney } from '../data/catalog';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  settings: StoreSettings;
  onQtyChange: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  settings,
  onQtyChange,
  onRemoveItem,
  onCheckout
}: CartSidebarProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee = subtotal > 0 ? (isFreeDelivery ? 0 : settings.deliveryFee) : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end animate-fade-in">
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <aside className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-gray-150 dark:border-gray-800 bg-plum text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-yellow" />
            <h2 className="font-extrabold text-base tracking-tight">Your Shopping Basket</h2>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((sum, i) => sum + i.qty, 0)}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        <div className="bg-plum-fade dark:bg-gray-850 p-3 border-b border-plum/10 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300">
          {isFreeDelivery ? (
            <p className="flex items-center gap-2 text-green font-extrabold">
              <Truck className="w-4 h-4" />
              <span>🎉 Congratulations! You unlocked FREE express delivery!</span>
            </p>
          ) : (
            <p className="flex items-center gap-2 font-medium">
              <Truck className="w-4 h-4 text-plum" />
              <span>Add <strong>{formatMoney(settings.freeDeliveryThreshold - subtotal)}</strong> more for FREE delivery.</span>
            </p>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-plum/10 dark:bg-plum/20 text-plum dark:text-pink-400 flex items-center justify-center shadow-inner">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 bg-yellow text-plum p-1.5 rounded-full shadow-md animate-bounce">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-100">Your basket is empty</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                  Looks like you haven't added any supermarket groceries or products yet. Discover everyday low prices today!
                </p>
              </div>

              <button 
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-2 bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-yellow" />
                <span>Back to Shopping</span>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-gray-800 rounded-2xl">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100 truncate">{item.name}</h4>
                    <span className="text-xs font-black text-plum dark:text-pink-400">{formatMoney(item.price)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 px-2 py-0.5">
                      <button 
                        onClick={() => onQtyChange(item.id, -1)}
                        className="text-gray-500 hover:text-plum font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-extrabold text-gray-800 dark:text-gray-100">{item.qty}</span>
                      <button 
                        onClick={() => onQtyChange(item.id, 1)}
                        className="text-gray-500 hover:text-plum font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400 font-semibold">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400 font-semibold">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-green">FREE</strong> : formatMoney(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
                <span>Total</span>
                <span className="text-plum dark:text-pink-400">{formatMoney(total)}</span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-plum hover:bg-plum-dark text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
