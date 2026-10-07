import React, { useState, useMemo } from 'react';
import { 
  X, Heart, ShoppingCart, Share2, Star, Check, Plus, Minus, 
  Eye, ExternalLink, ShieldCheck, Truck, Building2, MapPin, Sparkles
} from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { formatMoney, calcDiscount } from '../data/catalog';
import { BRANCHES, getProductStockForBranch } from '../data/branches';

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
  selectedBranchId?: string;
  products?: Product[];
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
  settings,
  selectedBranchId = 'kericho',
  products = []
}: QuickViewDrawerProps) {
  if (!isOpen || !product) return null;

  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const [addedCompanionId, setAddedCompanionId] = useState<number | null>(null);

  // Frequently bought together items with this product
  const companionProducts = useMemo(() => {
    if (!products || !product) return [];
    return products
      .filter(p => p.id !== product.id && p.stock > 0 && p.category === product.category)
      .slice(0, 2);
  }, [product, products]);

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
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-slide-left">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="bg-plum/10 text-plum p-1.5 rounded-lg">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-gray-900">Quick View</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{product.brand || 'K-Matt'}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Image & Badges */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-64 flex items-center justify-center border border-gray-150">
            <img 
              src={product.image || 'https://via.placeholder.com/400?text=K-Matt'} 
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
                copied ? 'bg-green text-white' : 'bg-white/90 text-gray-700 hover:bg-plum hover:text-white'
              }`}
              title="Share product link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Product Meta */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-plum uppercase tracking-widest">
                {product.category}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1 text-xs font-bold text-plum">
                  <Star className="w-4 h-4 fill-plum text-plum" />
                  <span className="font-black text-plum">{product.rating} / 5</span>
                </div>
              )}
            </div>

            <h2 className="text-lg font-black text-gray-900 leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-black text-plum">
                {formatMoney(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-400 line-through font-extrabold">
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
            <div className="pt-1 space-y-2">
              {(() => {
                const activeBranchId = selectedBranchId || 'kericho';
                const activeBranch = BRANCHES.find(b => b.id === activeBranchId) || BRANCHES[0];
                const bStock = getProductStockForBranch(product, activeBranchId);

                return (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                      <Building2 className="w-4 h-4 text-plum" />
                      <span>{activeBranch.name}</span>
                      {bStock <= 0 ? (
                        <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded font-black">Out of Stock</span>
                      ) : qty >= bStock ? (
                        <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-black text-xs border border-amber-300">Max stock reached ({bStock} available)</span>
                      ) : null}
                    </div>

                    {/* Regional Branch Breakdown Pills */}
                    <div className="mt-2 text-[10px] space-y-1">
                      <span className="text-gray-500 font-bold block">Other K-Matt Branch Stocks:</span>
                      <div className="flex flex-wrap gap-1">
                        {BRANCHES.filter(b => b.id !== activeBranchId).map(b => {
                          const bs = getProductStockForBranch(product, b.id);
                          return (
                            <span 
                              key={b.id}
                              className={`px-2 py-0.5 rounded-md border font-semibold ${
                                bs > 0 
                                  ? 'bg-gray-100 border-gray-200 text-gray-700' 
                                  : 'bg-red-50/50 border-red-100 text-red-400 line-through'
                              }`}
                            >
                              {b.town}: {bs > 0 ? `${bs} left` : '0'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Short Description */}
          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-150 text-xs text-gray-600 space-y-1.5">
            <p className="font-bold text-gray-900">Product Highlights</p>
            <p className="leading-relaxed">
              {product.description || `Fresh, authentic ${product.name} sourced directly for K-Matt shoppers. Quality guaranteed with 100% genuine Kenyan supply standard.`}
            </p>
          </div>

          {/* Shipping & Delivery perks */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 font-medium">
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-150">
              <Truck className="w-4 h-4 text-plum shrink-0" />
              <span>Under 90 Min Express Delivery</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-150">
              <ShieldCheck className="w-4 h-4 text-green shrink-0" />
              <span>7-Day Quality Guarantee</span>
            </div>
          </div>

          {/* Frequently Bought Together with this item */}
          {companionProducts.length > 0 && (
            <div className="bg-plum-fade/40 border border-plum/20 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-gray-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-plum" />
                  <span>Frequently Bought Together</span>
                </span>
                <span className="text-[9px] text-plum font-extrabold uppercase">
                  Often Paired
                </span>
              </div>
              <div className="space-y-2">
                {companionProducts.map(cp => (
                  <div key={cp.id} className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-plum/15 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={cp.image} alt={cp.name} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-150" />
                      <div className="min-w-0">
                        <p className="font-extrabold text-[11px] text-gray-900 truncate">{cp.name}</p>
                        <p className="font-black text-xs text-plum">{formatMoney(cp.price)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(cp, 1);
                        setAddedCompanionId(cp.id);
                        if (onShowToast) onShowToast(`Added ${cp.name} to your cart!`, 'success');
                        setTimeout(() => setAddedCompanionId(null), 1500);
                      }}
                      className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                        addedCompanionId === cp.id
                          ? 'bg-plum-dark text-white'
                          : 'bg-plum hover:bg-plum-dark text-white shadow-xs'
                      }`}
                    >
                      {addedCompanionId === cp.id ? 'Added' : '+ Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-gray-700">Select Quantity</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-250 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2.5 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-black text-sm text-gray-900 min-w-[32px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="p-2.5 text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500 font-bold">
                  Total: <strong className="text-plum font-black">{formatMoney(product.price * qty)}</strong>
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-150 bg-gray-50 space-y-2.5">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCartClick}
              disabled={isOutOfStock}
              className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : added
                  ? 'bg-plum-dark text-white ring-2 ring-plum/40'
                  : 'bg-plum hover:bg-plum-dark text-white shadow-plum/25 hover:shadow-lg hover:shadow-plum/35'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Basket</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-white" />
                  <span>{isOutOfStock ? 'Out of Stock' : `Add ${qty > 1 ? `${qty} Items` : 'to Cart'}`}</span>
                </>
              )}
            </button>

            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-3 rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                isWished
                  ? 'bg-plum text-white border-plum'
                  : 'bg-white border-gray-250 text-plum hover:bg-plum/10'
              }`}
              title={isWished ? 'Saved in wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-xl border bg-white border-gray-250 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
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
            className="w-full py-2.5 text-xs font-bold text-plum hover:bg-plum/10 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Full Specifications & Reviews</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
