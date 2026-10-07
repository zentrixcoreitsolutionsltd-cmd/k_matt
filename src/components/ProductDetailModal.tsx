import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Heart, ShoppingCart, Share2, Star, Check, Plus, Minus, 
  Truck, ShieldCheck, ArrowRight, MessageSquare, Tag, AlertCircle, Sparkles, Building2, MapPin
} from 'lucide-react';
import { Product, StoreSettings, Customer, Order } from '../types';
import { formatMoney, calcDiscount } from '../data/catalog';
import { BRANCHES, getProductStockForBranch } from '../data/branches';

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
  selectedBranchId?: string;
  onOpenBranchModal?: () => void;
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
  customer,
  selectedBranchId = 'kericho',
  onOpenBranchModal
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

  // Frequently bought together complementary items
  const frequentlyBoughtTogetherItems = useMemo(() => {
    const pairedCategories: Record<string, string[]> = {
      'food cupboard': ['fresh food', 'food cupboard', 'beverages'],
      'fresh food': ['food cupboard', 'fresh food', 'beverages'],
      'beverages': ['food cupboard', 'beverages', 'fresh food'],
      'cleaning': ['cleaning', 'beauty'],
      'beauty': ['beauty', 'cleaning', 'health'],
      'baby & kids': ['baby & kids', 'cleaning'],
      'electronics': ['electronics', 'hardware'],
      'hardware': ['hardware', 'electronics'],
    };
    const targetCats = pairedCategories[product.category] || ['food cupboard', 'fresh food'];
    return products
      .filter(p => p.id !== product.id && p.stock > 0 && targetCats.includes(p.category))
      .slice(0, 2);
  }, [product, products]);

  const allBundleProducts = useMemo(() => {
    return [product, ...frequentlyBoughtTogetherItems];
  }, [product, frequentlyBoughtTogetherItems]);

  const [bundleSelectedIds, setBundleSelectedIds] = useState<number[]>([product.id]);
  const [bundleAdded, setBundleAdded] = useState(false);

  useEffect(() => {
    setBundleSelectedIds([product.id, ...frequentlyBoughtTogetherItems.map(p => p.id)]);
    setBundleAdded(false);
  }, [product, frequentlyBoughtTogetherItems]);

  const bundleTotal = useMemo(() => {
    return allBundleProducts
      .filter(p => bundleSelectedIds.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
  }, [allBundleProducts, bundleSelectedIds]);

  const handleAddBundleToCart = () => {
    const selected = allBundleProducts.filter(p => bundleSelectedIds.includes(p.id));
    selected.forEach(p => onAddToCart(p, 1));
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2000);
  };

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
      <div className="bg-white border border-gray-150 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Modal Header Bar */}
        <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-plum text-white">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-md font-extrabold uppercase">
              {product.brand || 'K-Matt'}
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
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-64 md:h-72 border border-gray-200 flex items-center justify-center">
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
                    copied ? 'bg-green text-white' : 'bg-white/90 text-gray-700 hover:bg-plum hover:text-white'
                  }`}
                  title="Share product link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick Perks */}
              <div className="space-y-2 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-150">
                  <Truck className="w-4 h-4 text-plum shrink-0" />
                  <span>Delivery to {deliveryLocation} in 90 mins</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-150">
                  <ShieldCheck className="w-4 h-4 text-green shrink-0" />
                  <span>100% Genuine Kenyan Supply</span>
                </div>
              </div>
            </div>

            {/* Right Details Section */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h1>
                
                {/* Rating & Stock */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-plum font-bold">
                    <Star className="w-4 h-4 fill-plum text-plum" />
                    <span className="font-black text-plum">{product.rating}</span>
                    <span className="text-gray-400">({product.ratingCount || 12} reviews)</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  {isOutOfStock ? (
                    <span className="font-bold text-red bg-red/10 px-2 py-0.5 rounded-md">Out of Stock</span>
                  ) : qty >= product.stock ? (
                    <span className="font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md text-xs border border-amber-300">
                      Max available stock reached ({product.stock} units)
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Price section */}
              <div className="flex items-baseline gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-150">
                <span className="text-2xl md:text-3xl font-black text-plum">
                  {formatMoney(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-gray-400 line-through font-extrabold">
                    {formatMoney(product.originalPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-black text-green bg-green/10 px-2.5 py-1 rounded-lg">
                    Save {formatMoney(product.originalPrice - product.price)}
                  </span>
                )}
              </div>

              {/* Regional K-Matt Branch Stock Breakdown Card */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-plum" />
                    <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                      Branch Inventory Availability
                    </h4>
                  </div>
                  {onOpenBranchModal && (
                    <button
                      onClick={onOpenBranchModal}
                      className="text-[11px] font-black text-plum hover:underline flex items-center gap-1"
                    >
                      <span>Switch Branch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BRANCHES.map((b) => {
                    const bStock = getProductStockForBranch(product, b.id);
                    const isCurrent = b.id === (selectedBranchId || 'kericho');

                    return (
                      <div
                        key={b.id}
                        className={`p-2.5 rounded-xl border text-xs transition-all ${
                          isCurrent
                            ? 'bg-plum-fade/80 border-plum font-extrabold'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-bold text-gray-800 truncate">
                            {b.town}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] bg-plum text-white font-black px-1.5 py-0.2 rounded shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[11px]">
                          {bStock > 0 ? (
                            <span className="text-emerald-700 font-black">
                              {bStock} in stock
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Add to Cart Controls */}
              {!isOutOfStock && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-extrabold text-gray-700">Quantity</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-250 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="p-3 text-gray-600 hover:bg-gray-200 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-black text-sm text-gray-900 min-w-[36px] text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="p-3 text-gray-600 hover:bg-gray-200 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCartClick}
                      className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                        added ? 'bg-plum-dark text-white ring-2 ring-plum/40' : 'bg-plum hover:bg-plum-dark text-white shadow-plum/25 hover:shadow-lg hover:shadow-plum/35'
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
                          : 'bg-white border-gray-250 text-plum hover:bg-plum/10'
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
          <div className="border-t border-gray-200 pt-4">
            <div className="flex border-b border-gray-200 gap-4 text-xs font-bold mb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'overview' ? 'border-plum text-plum' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs' ? 'border-plum text-plum' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'reviews' ? 'border-plum text-plum' : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Customer Reviews ({product.reviews?.length || 0})
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="text-xs text-gray-700 space-y-2 leading-relaxed">
                <p>
                  {product.description || `Fresh, authentic ${product.name} sourced directly for K-Matt shoppers. Quality guaranteed with 100% genuine Kenyan supply standard.`}
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
                      <div key={k} className="p-2.5 bg-gray-50 rounded-xl flex justify-between border border-gray-150">
                        <span className="font-bold text-gray-500">{k}</span>
                        <span className="font-extrabold text-gray-900">{v}</span>
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
                      <div key={r.id} className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-extrabold text-gray-900">{r.userName}</span>
                          <span className="text-[10px] text-gray-400">{r.date}</span>
                        </div>
                        <div className="flex items-center text-plum gap-0.5 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-plum text-plum' : 'text-plum/20 fill-plum/5'}`} />
                          ))}
                        </div>
                        <p className="text-gray-600">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No customer reviews yet. Be the first to leave feedback!</p>
                )}

                {/* Add review form */}
                <form onSubmit={handleReviewSubmit} className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3">
                  <h4 className="font-extrabold text-gray-900">Write a Product Review</h4>
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
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-250 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 font-bold mb-1">Rating</label>
                      <select 
                        value={newRating} 
                        onChange={e => setNewRating(Number(e.target.value))}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-250 bg-white text-xs"
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
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-250 bg-white text-xs outline-none"
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

          {/* FREQUENTLY BOUGHT TOGETHER BUNDLE */}
          {frequentlyBoughtTogetherItems.length > 0 && (
            <div className="pt-5 border-t border-gray-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-gray-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-plum" />
                    <span>Frequently Bought Together</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Shoppers who bought {product.name.split(' ')[0]} frequently add these items together
                  </p>
                </div>
                <span className="text-[9px] bg-plum/10 text-plum font-black px-2.5 py-0.5 rounded-full uppercase">
                  Frequently Bought
                </span>
              </div>

              {/* Bundle Items Visual with '+' separator */}
              <div className="bg-plum-fade/30 border border-plum/20 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
                  {allBundleProducts.map((bp, idx) => {
                    const isChecked = bundleSelectedIds.includes(bp.id);
                    const isCurrent = bp.id === product.id;

                    return (
                      <React.Fragment key={bp.id}>
                        {idx > 0 && (
                          <div className="w-6 h-6 rounded-full bg-plum/15 text-plum font-black text-xs flex items-center justify-center shrink-0">
                            +
                          </div>
                        )}
                        <div 
                          className={`relative p-2.5 rounded-xl border transition-all shrink-0 w-28 sm:w-32 bg-white ${
                            isChecked ? 'border-plum shadow-xs' : 'border-gray-200 opacity-60'
                          }`}
                        >
                          <div className="relative h-18 sm:h-20 w-full mb-1.5 rounded-lg overflow-hidden bg-gray-100">
                            <img src={bp.image} alt={bp.name} className="w-full h-full object-cover" />
                            {isCurrent && (
                              <span className="absolute top-1 left-1 bg-plum text-white text-[8px] font-black px-1.5 py-0.2 rounded-xs uppercase">
                                This Item
                              </span>
                            )}
                          </div>
                          <p className="font-extrabold text-[10px] text-gray-900 truncate leading-tight">{bp.name}</p>
                          <p className="font-black text-xs text-plum mt-0.5">{formatMoney(bp.price)}</p>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Checkbox list */}
                <div className="space-y-1.5 pt-1 border-t border-plum/15 text-xs">
                  {allBundleProducts.map(bp => {
                    const isChecked = bundleSelectedIds.includes(bp.id);
                    const isCurrent = bp.id === product.id;

                    return (
                      <label 
                        key={bp.id} 
                        className="flex items-center gap-2 cursor-pointer select-none text-gray-700 hover:text-plum"
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setBundleSelectedIds(prev => 
                              prev.includes(bp.id) ? prev.filter(id => id !== bp.id) : [...prev, bp.id]
                            );
                          }}
                          className="rounded border-plum/40 text-plum focus:ring-plum w-4 h-4 cursor-pointer accent-plum"
                        />
                        <span className="text-[11px] font-medium leading-tight">
                          <strong>{isCurrent ? 'This item: ' : ''}{bp.name}</strong> — <span className="font-black text-plum">{formatMoney(bp.price)}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Bundle Total & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-plum/15">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">
                      Bundle Total ({bundleSelectedIds.length} items):
                    </span>
                    <span className="text-lg font-black text-plum">
                      {formatMoney(bundleTotal)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBundleToCart}
                    disabled={bundleSelectedIds.length === 0}
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                      bundleAdded
                        ? 'bg-plum-dark text-white ring-2 ring-plum/40'
                        : 'bg-plum hover:bg-plum-dark text-white shadow-plum/25'
                    }`}
                  >
                    {bundleAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Bundle Added to Basket!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 text-white" />
                        <span>Add Selected ({bundleSelectedIds.length}) to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Related Products Carousel / Shelf */}
          {relatedProducts.length > 0 && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <h4 className="font-black text-gray-900 uppercase tracking-wider text-xs">
                More in {product.category}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map(rel => (
                  <div 
                    key={rel.id}
                    onClick={() => onNavigateToProduct(rel)}
                    className="p-2 bg-gray-50 rounded-xl border border-gray-150 cursor-pointer hover:border-plum transition-all"
                  >
                    <img src={rel.image} alt={rel.name} className="w-full h-20 object-cover rounded-lg mb-1.5" />
                    <p className="font-extrabold text-[11px] text-gray-900 truncate">{rel.name}</p>
                    <p className="font-black text-xs text-plum">{formatMoney(rel.price)}</p>
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
