import React, { useState } from 'react';
import { 
  X, Heart, ShoppingCart, Share2, Star, Check, Plus, Minus, 
  Eye, ExternalLink, ShieldCheck, Truck
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatMoney, calcDiscount } from '../data/catalog';

interface QuickViewDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist: (id: number) => void;
  isWished: boolean;
  onFullDetails: (product: Product) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  settings: StoreSettings;
}

export default function QuickViewDrawer({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWished,
  onFullDetails,
  onShowToast,
  settings
}: QuickViewDrawerProps) {
  if (!isOpen || !product) return null;

  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  const discount = calcDiscount(product.price, product.originalPrice);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= settings.lowStockThreshold;

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        if (onShowToast) onShowToast(`Share link for "${product.name}" copied to clipboard!`, 'success');
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy(url);
      });
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text: string) => {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    setCopied(true);
    if (onShowToast) onShowToast(`Share link for "${product.name}" copied!`, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCartClick = () => {
    if (isOutOfStock) return;
    onAddToCart(product, qty);
    setAdded(true);
    if (onShowToast) onShowToast(`Added ${qty}x ${product.name} to your cart!`, 'success');
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sliding Drawer Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-slide-left">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <span className="bg-plum/10 text-plum dark:bg-pink-900/40 dark:text-pink-300 p-1.5 rounded-lg">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Quick View</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{product.brand || 'Kipchimatt'}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Image & Badges */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center border border-gray-150 dark:border-gray-700">
            <img 
              src={product.image || 'https://via.placeholder.com/400?text=Kipchimatt'} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-plum text-white font-black text-xs px-3 py-1 rounded-lg shadow-md">
                -{discount}% OFF
              </span>
            )}
            
            {/* Quick Share Button on Image */}
            <button 
              onClick={handleShare}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all ${
                copied ? 'bg-green text-white' : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 hover:bg-plum hover:text-white'
              }`}
              title="Share product link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Product Meta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-plum dark:text-pink-400 uppercase tracking-widest">
                {product.category}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{product.rating} / 5</span>
                </div>
              )}
            </div>

            <h2 className="text-lg font-black text-gray-900 dark:text-white leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-black text-plum dark:text-pink-400">
                {formatMoney(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through font-semibold">
                  {formatMoney(product.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-extrabold text-green bg-green/10 px-2 py-0.5 rounded-md">
                  Save {formatMoney(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="pt-1">
              {isOutOfStock ? (
                <span className="inline-block text-xs font-bold text-red bg-red/10 px-2.5 py-1 rounded-md">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-block text-xs font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-1 rounded-md">
                  Only {product.stock} items left
                </span>
              ) : (
                <span className="inline-block text-xs font-bold text-green bg-green/10 px-2.5 py-1 rounded-md">
                  In Stock • Ready for express delivery
                </span>
              )}
            </div>
          </div>

          {/* Short Description */}
          <div className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-150 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
            <p className="font-bold text-gray-900 dark:text-white">Product Highlights</p>
            <p className="leading-relaxed">
              {product.description || `Fresh, authentic ${product.name} sourced directly for Kipchimatt shoppers. Quality guaranteed with 100% genuine Kenyan supply standard.`}
            </p>
          </div>

          {/* Shipping & Delivery perks */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-300 font-medium">
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-150 dark:border-gray-700">
              <Truck className="w-4 h-4 text-plum shrink-0" />
              <span>Under 90 Min Express Delivery</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-150 dark:border-gray-700">
              <ShieldCheck className="w-4 h-4 text-green shrink-0" />
              <span>7-Day Quality Guarantee</span>
            </div>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300">Select Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-250 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-black text-sm text-gray-900 dark:text-white min-w-[32px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500 font-bold">
                  Total: <strong className="text-plum dark:text-pink-400 font-black">{formatMoney(product.price * qty)}</strong>
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/80 space-y-2.5">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
              className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : added
                  ? 'bg-green text-white'
                  : 'bg-plum hover:bg-plum-dark text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Basket</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-yellow" />
                  <span>{isOutOfStock ? 'Out of Stock' : `Add ${qty > 1 ? `${qty} Items` : 'to Cart'}`}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-3 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                isWished
                  ? 'bg-plum text-white border-plum'
                  : 'bg-white dark:bg-gray-800 border-gray-250 dark:border-gray-700 text-plum hover:bg-plum/10'
              }`}
              title={isWished ? 'Saved in wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-xl border bg-white dark:bg-gray-800 border-gray-250 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              title="Share URL"
            >
              {copied ? <Check className="w-5 h-5 text-green" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Full Details Handoff Button */}
          <button
            onClick={() => {
              onClose();
              onFullDetails(product);
            }}
            className="w-full py-2.5 text-xs font-bold text-plum dark:text-pink-300 hover:bg-plum/10 dark:hover:bg-plum/20 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Full Specifications & Reviews</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
