import React from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Truck, ArrowLeft, Sparkles, Bookmark } from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { formatMoney } from '../data/catalog';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  savedForLater?: CartItem[];
  settings: StoreSettings;
  onQtyChange: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onSaveForLater?: (id: number) => void;
  onMoveToCart?: (id: number) => void;
  onRemoveSavedItem?: (id: number) => void;
  onCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  savedForLater = [],
  settings,
  onQtyChange,
  onRemoveItem,
  onSaveForLater,
  onMoveToCart,
  onRemoveSavedItem,
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
            <ShoppingCart className="w-5 h-5 text-white" />
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {cart.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-plum/10 dark:bg-plum/20 text-plum dark:text-pink-400 flex items-center justify-center shadow-inner">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 bg-white text-plum p-1 rounded-full shadow-md">
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-100">Your basket is empty</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                  No active products in your basket. Add groceries or move items from your Saved list below!
                </p>
              </div>

              <button 
                onClick={onClose}
                className="mt-1 inline-flex items-center gap-2 bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-white" />
                <span>Back to Shopping</span>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-2">
                <div className="flex gap-3">
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
                          className="text-gray-500 hover:text-plum font-bold cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-extrabold text-gray-800 dark:text-gray-100">{item.qty}</span>
                        <button 
                          onClick={() => onQtyChange(item.id, 1)}
                          className="text-gray-500 hover:text-plum font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {onSaveForLater && (
                          <button 
                            type="button"
                            onClick={() => onSaveForLater(item.id)}
                            className="text-[11px] font-bold text-plum dark:text-pink-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                            title="Move item to Saved for Later"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-plum dark:text-pink-400" />
                            <span>Save for later</span>
                          </button>
                        )}

                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Saved for Later Dedicated Section */}
          {savedForLater && savedForLater.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-plum dark:text-pink-400" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                    Saved for Later ({savedForLater.length})
                  </h3>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Held for future purchase</span>
              </div>

              <div className="space-y-2.5">
                {savedForLater.map((savedItem) => (
                  <div key={savedItem.id} className="flex gap-2.5 p-2.5 bg-plum/5 dark:bg-gray-800/80 border border-plum/15 dark:border-gray-700/80 rounded-2xl items-center">
                    <img 
                      src={savedItem.image} 
                      alt={savedItem.name} 
                      className="w-12 h-12 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100 truncate">{savedItem.name}</h4>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs font-black text-plum dark:text-pink-400">{formatMoney(savedItem.price)}</span>
                        <span className="text-[10px] text-gray-500 font-bold">Qty: {savedItem.qty}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onMoveToCart && (
                        <button
                          type="button"
                          onClick={() => onMoveToCart(savedItem.id)}
                          className="bg-plum hover:bg-plum-dark text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="Move back to active basket"
                        >
                          <ShoppingCart className="w-3 h-3 text-white" />
                          <span>Move to Basket</span>
                        </button>
                      )}

                      {onRemoveSavedItem && (
                        <button
                          type="button"
                          onClick={() => onRemoveSavedItem(savedItem.id)}
                          className="p-1 text-gray-400 hover:text-red transition-colors cursor-pointer"
                          title="Remove saved item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

