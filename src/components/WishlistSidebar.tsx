import React from 'react';
import { X, Heart, ShoppingCart, Trash2, Sparkles, TrendingDown } from 'lucide-react';
import { Product } from '../types';
import { formatMoney } from '../data/catalog';

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: number[];
  products: Product[];
  onRemoveWish: (id: number) => void;
  onAddToCart: (p: Product) => void;
  onMoveAllToCart?: () => void;
  onSimulateAlert?: () => void;
}

export default function WishlistSidebar({
  isOpen,
  onClose,
  wishlist,
  products,
  onRemoveWish,
  onAddToCart,
  onMoveAllToCart,
  onSimulateAlert
}: WishlistSidebarProps) {
  if (!isOpen) return null;

  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveAll = () => {
    if (onMoveAllToCart) {
      onMoveAllToCart();
    } else {
      wishedProducts.forEach(p => {
        if (p.stock > 0) {
          onAddToCart(p);
          onRemoveWish(p.id);
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end animate-fade-in">
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
      />

      <aside className="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 animate-slide-left">
        <div className="p-5 border-b border-gray-150 dark:border-gray-800 bg-plum text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-red-400 fill-current" />
            <h2 className="font-extrabold text-base tracking-tight">Saved Wishlist</h2>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {wishedProducts.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {onSimulateAlert && wishedProducts.length > 0 && (
          <div className="bg-plum-fade dark:bg-gray-800 p-3 px-5 border-b border-plum/10 flex items-center justify-between text-xs font-bold text-plum dark:text-pink-300">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-green" />
              <span>Price drop & restock alerts active</span>
            </span>
            <button 
              onClick={onSimulateAlert}
              className="bg-plum text-white hover:bg-plum-dark text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3 h-3 text-yellow" />
              <span>Test Price Drop Alert</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-200">No saved items</h3>
              <p className="text-xs text-gray-500 max-w-xs">Tap the heart icon on any supermarket product to save it here for later.</p>
            </div>
          ) : (
            wishedProducts.map((p) => (
              <div key={p.id} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-150 dark:border-gray-800 rounded-2xl">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800 dark:text-gray-100 truncate">{p.name}</h4>
                    <span className="text-xs font-black text-plum dark:text-pink-400">{formatMoney(p.price)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() => onAddToCart(p)}
                      disabled={p.stock <= 0}
                      className="bg-plum hover:bg-plum-dark text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add to Basket</span>
                    </button>

                    <button 
                      onClick={() => onRemoveWish(p.id)}
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

        {/* Sticky Action Footer when items exist in wishlist */}
        {wishedProducts.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
            <button
              onClick={handleMoveAll}
              className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold text-xs py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 hover:scale-[1.01]"
            >
              <ShoppingCart className="w-4 h-4 text-yellow" />
              <span>Move All ({wishedProducts.length}) to Shopping Cart</span>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
