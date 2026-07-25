import React, { useState } from 'react';
import { 
  X, Heart, ShoppingCart, Share2, Star, Check, Plus, Minus, 
  Truck, ShieldCheck, ArrowRight, MessageSquare, Tag, AlertCircle, Sparkles
} from 'lucide-react';
import { Product, StoreSettings, Customer, Order } from '../types';
import { formatMoney, calcDiscount } from '../data/catalog';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: StoreSettings;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  deliveryLocation: string;
  onNavigateToProduct: (product: Product) => void;
  onAddReview: (productId: number, review: { userName: string; rating: number; comment: string }) => void;
  customer?: Customer | null;
  orders?: Order[];
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  products,
  settings,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  deliveryLocation,
  onNavigateToProduct,
  onAddReview,
  customer
}: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);

  // New review form
  const [reviewerName, setReviewerName] = useState(customer?.name || '');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const discount = calcDiscount(product.price, product.originalPrice);
  const isOutOfStock = product.stock <= 0;
  const isWished = wishlist.includes(product.id);

  // Related items in same category
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCartClick = () => {
    if (isOutOfStock) return;
    onAddToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddReview(product.id, {
      userName: reviewerName.trim() || 'Verified Shopper',
      rating: newRating,
      comment: newComment.trim()
    });
    setNewComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Modal Header Bar */}
        <div className="p-4 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between bg-plum text-white">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-md font-extrabold uppercase">
              {product.brand || 'Kipchimatt'}
            </span>
            <span className="text-xs text-white/80 font-bold uppercase tracking-wider">
              {product.category}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Image Section */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-64 md:h-72 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-plum text-white font-black text-xs px-3 py-1 rounded-lg shadow-md">
                    -{discount}% OFF
                  </span>
                )}
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

              {/* Quick Perks */}
              <div className="space-y-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-150 dark:border-gray-700">
                  <Truck className="w-4 h-4 text-plum shrink-0" />
                  <span>Delivery to {deliveryLocation} in 90 mins</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-150 dark:border-gray-700">
                  <ShieldCheck className="w-4 h-4 text-green shrink-0" />
                  <span>100% Genuine Kenyan Supply</span>
                </div>
              </div>
            </div>

            {/* Right Details Section */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h1>
                
                {/* Rating & Stock */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{product.rating}</span>
                    <span className="text-gray-400">({product.ratingCount || 12} reviews)</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  {isOutOfStock ? (
                    <span className="font-bold text-red bg-red/10 px-2 py-0.5 rounded-md">Out of Stock</span>
                  ) : (
                    <span className="font-bold text-green bg-green/10 px-2 py-0.5 rounded-md">
                      In Stock ({product.stock} units)
                    </span>
                  )}
                </div>
              </div>

              {/* Price section */}
              <div className="flex items-baseline gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-150 dark:border-gray-700">
                <span className="text-2xl md:text-3xl font-black text-plum dark:text-pink-400">
                  {formatMoney(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-black dark:text-black line-through font-extrabold">
                    {formatMoney(product.originalPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-black text-green bg-green/10 px-2.5 py-1 rounded-lg">
                    Save {formatMoney(product.originalPrice - product.price)}
                  </span>
                )}
              </div>

              {/* Quantity & Add to Cart Controls */}
              {!isOutOfStock && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-extrabold text-gray-700 dark:text-gray-300">Quantity</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-250 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-black text-sm text-gray-900 dark:text-white min-w-[36px] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCartClick}
                      className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                        added ? 'bg-green text-white' : 'bg-plum hover:bg-plum-dark text-white'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added to Cart</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 text-white" />
                          <span>Add {qty} Item(s) — {formatMoney(product.price * qty)}</span>
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
                      title={isWished ? 'Saved in wishlist' : 'Save to wishlist'}
                    >
                      <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Navigation Tabs (Overview, Specs, Reviews) */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4 text-xs font-bold mb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'overview' ? 'border-plum text-plum dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs' ? 'border-plum text-plum dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'reviews' ? 'border-plum text-plum dark:text-pink-400' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Customer Reviews ({product.reviews?.length || 0})
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">
                <p>
                  {product.description || `Fresh, authentic ${product.name} sourced directly for Kipchimatt shoppers. Quality guaranteed with 100% genuine Kenyan supply standard.`}
                </p>
                <p className="text-gray-500">
                  Store at recommended temperature. Packaged under safe hygiene guidelines for home consumption.
                </p>
              </div>
            )}

            {/* TAB 2: SPECS */}
            {activeTab === 'specs' && (
              <div className="text-xs space-y-2">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k} className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl flex justify-between border border-gray-150 dark:border-gray-700">
                        <span className="font-bold text-gray-500">{k}</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Standard supermarket specifications apply to this item.</p>
                )}
              </div>
            )}

            {/* TAB 3: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4 text-xs">
                {/* List existing reviews */}
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-2.5">
                    {product.reviews.map(r => (
                      <div key={r.id} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-150 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-gray-900 dark:text-white">{r.userName}</span>
                          <span className="text-[10px] text-gray-400">{r.date}</span>
                        </div>
                        <div className="flex items-center text-amber-500 gap-0.5 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No customer reviews yet. Be the first to leave feedback!</p>
                )}

                {/* Add review form */}
                <form onSubmit={handleReviewSubmit} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 space-y-3">
                  <h4 className="font-extrabold text-gray-900 dark:text-white">Write a Product Review</h4>
                  {reviewSubmitted && (
                    <div className="p-2 bg-green/10 text-green font-bold rounded-lg text-xs">
                      Thank you! Your review was recorded successfully.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-500 font-bold mb-1">Your Name</label>
                      <input 
                        type="text" 
                        value={reviewerName} 
                        onChange={e => setReviewerName(e.target.value)}
                        placeholder="e.g. Mary W."
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 font-bold mb-1">Rating</label>
                      <select 
                        value={newRating} 
                        onChange={e => setNewRating(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs"
                      >
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Very Good</option>
                        <option value={3}>3 Stars - Average</option>
                        <option value={2}>2 Stars - Poor</option>
                        <option value={1}>1 Star - Very Poor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Comments</label>
                    <textarea 
                      rows={2}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Share your experience with this item..."
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-plum hover:bg-plum-dark text-white font-extrabold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Related Products Carousel / Shelf */}
          {relatedProducts.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-xs">
                More in {product.category}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map(rel => (
                  <div 
                    key={rel.id}
                    onClick={() => onNavigateToProduct(rel)}
                    className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-150 dark:border-gray-700 cursor-pointer hover:border-plum transition-all"
                  >
                    <img src={rel.image} alt={rel.name} className="w-full h-20 object-cover rounded-lg mb-1.5" />
                    <p className="font-extrabold text-[11px] text-gray-900 dark:text-white truncate">{rel.name}</p>
                    <p className="font-black text-xs text-plum dark:text-pink-400">{formatMoney(rel.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
