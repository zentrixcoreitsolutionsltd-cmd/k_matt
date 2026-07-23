import React, { useRef, useState, useEffect } from 'react';
import { 
  LayoutGrid, Boxes, Carrot, Coffee, Baby, Plug, Sparkles, Wine, 
  Pencil, PawPrint, Wrench, Armchair, ChevronLeft, ChevronRight, 
  Heart, ShoppingCart, Check, Star, AlertCircle, Sparkle,
  HeartPulse, Shirt, Trophy, BookOpen, Share2, Eye, ArrowUpDown
} from 'lucide-react';
import { Product, StoreSettings, Order, Customer, CartItem } from '../types';
import { categoryMeta, formatMoney, calcDiscount } from '../data/catalog';
import QuickViewDrawer from './QuickViewDrawer';

interface StorefrontProps {
  products: Product[];
  settings: StoreSettings;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onCategorySelect: (cat: string) => void;
  onBrandSelect: (brand: string) => void;
  onProductClick: (product: Product) => void;
  activeCategory: string;
  activeSearch: string;
  comparedProductIds: number[];
  onToggleCompare: (product: Product) => void;
  orders?: Order[];
  currentCustomer?: Customer | null;
  cart: CartItem[];
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function Storefront({
  products,
  settings,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onCategorySelect,
  onBrandSelect,
  onProductClick,
  activeCategory,
  activeSearch,
  comparedProductIds,
  onToggleCompare,
  orders = [],
  currentCustomer = null,
  cart,
  onShowToast
}: StorefrontProps) {
  
  // Carousel DOM refs
  const dealsRef = useRef<HTMLDivElement>(null);
  const freshRef = useRef<HTMLDivElement>(null);
  const beverageRef = useRef<HTMLDivElement>(null);
  const liquorRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Quick feedback state for Add to Cart
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  // Quick View drawer & product share states
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [copiedProductId, setCopiedProductId] = useState<number | null>(null);

  const handleShareProduct = (p: Product) => {
    const url = `${window.location.origin}${window.location.pathname}?product=${p.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedProductId(p.id);
        if (onShowToast) onShowToast(`Share link for "${p.name}" copied to clipboard!`, 'success');
        setTimeout(() => setCopiedProductId(null), 2000);
      }).catch(() => {
        fallbackCopyProduct(p);
      });
    } else {
      fallbackCopyProduct(p);
    }
  };

  const fallbackCopyProduct = (p: Product) => {
    const url = `${window.location.origin}${window.location.pathname}?product=${p.id}`;
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    setCopiedProductId(p.id);
    if (onShowToast) onShowToast(`Share link for "${p.name}" copied!`, 'success');
    setTimeout(() => setCopiedProductId(null), 2000);
  };

  // Sorting and Loading Skeleton states
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState(false);

  // Trigger quick simulated loading skeleton on category, search or sorting change
  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const timer = setTimeout(() => {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
    return () => clearTimeout(timer);
  }, [activeCategory, activeSearch, sortBy]);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, dir: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir * 420, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5" />;
      case 'Boxes': return <Boxes className="w-5 h-5" />;
      case 'Carrot': return <Carrot className="w-5 h-5" />;
      case 'Coffee': return <Coffee className="w-5 h-5" />;
      case 'Baby': return <Baby className="w-5 h-5" />;
      case 'Plug': return <Plug className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Wine': return <Wine className="w-5 h-5" />;
      case 'Pencil': return <Pencil className="w-5 h-5" />;
      case 'PawPrint': return <PawPrint className="w-5 h-5" />;
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'Armchair': return <Armchair className="w-5 h-5" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5" />;
      case 'Shirt': return <Shirt className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      default: return <LayoutGrid className="w-5 h-5" />;
    }
  };

  // Filter products based on search or category
  const getFilteredProducts = () => {
    let list = [...products];
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    } else if (activeCategory && activeCategory !== 'all') {
      list = list.filter(p => p.category === activeCategory);
    }

    // Apply active sort select choice
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  };

  // Find recommended products based on categories of items in the wishlist and previous purchases
  const getRecommendedProducts = () => {
    // 1. Check purchased categories from previous orders
    let purchasedCategories: string[] = [];
    
    // Find orders for current customer
    const customerOrders = currentCustomer && orders
      ? orders.filter(o => o.customer.phone.trim().toLowerCase() === currentCustomer.phone.trim().toLowerCase())
      : [];
      
    if (customerOrders.length > 0) {
      const purchasedItemNames = new Set<string>();
      customerOrders.forEach(o => {
        o.items.forEach(item => {
          purchasedItemNames.add(item.name.toLowerCase());
          // Find the product to get its category
          const prod = products.find(p => p.name.toLowerCase() === item.name.toLowerCase() || p.id === item.id);
          if (prod && !purchasedCategories.includes(prod.category)) {
            purchasedCategories.push(prod.category);
          }
        });
      });
    }

    // 2. Check wishlist categories
    const wishlistedProds = products.filter(p => wishlist.includes(p.id));
    const wishlistCategories = Array.from(new Set(wishlistedProds.map(p => p.category)));

    // Combined preferred categories (purchased first, then wishlist)
    const preferredCategories = Array.from(new Set([...purchasedCategories, ...wishlistCategories]));

    if (preferredCategories.length === 0) {
      // Fallback: high-rated trending items
      return {
        isFallback: true,
        reason: 'trending',
        items: products.filter(p => (p.rating || 0) >= 4.7 && !wishlist.includes(p.id)).slice(0, 5)
      };
    }

    // Get suggestions from these categories, excluding products already purchased or wishlisted
    const alreadyPurchasedIds = new Set<number>();
    customerOrders.forEach(o => o.items.forEach(item => alreadyPurchasedIds.add(item.id)));

    const suggestions = products.filter(p => 
      preferredCategories.includes(p.category) && 
      !wishlist.includes(p.id) &&
      !alreadyPurchasedIds.has(p.id)
    );

    if (suggestions.length > 0) {
      return {
        isFallback: false,
        reason: purchasedCategories.length > 0 ? 'purchased' : 'wishlist',
        items: suggestions.slice(0, 5)
      };
    }
    
    return {
      isFallback: true,
      reason: 'trending',
      items: products.filter(p => (p.rating || 0) >= 4.7 && !wishlist.includes(p.id)).slice(0, 5)
    };
  };

  const recommendationData = getRecommendedProducts();

  const getFrequentlyBoughtTogether = () => {
    if (cart.length === 0) return [];

    const cartProductIds = new Set(cart.map(item => item.id));
    const coOccurrences: Record<number, number> = {};

    orders.forEach(order => {
      const hasCartProduct = order.items.some(item => cartProductIds.has(item.id));
      if (hasCartProduct) {
        order.items.forEach(item => {
          if (!cartProductIds.has(item.id)) {
            coOccurrences[item.id] = (coOccurrences[item.id] || 0) + item.qty;
          }
        });
      }
    });

    let recommended = Object.entries(coOccurrences)
      .map(([idStr, score]) => {
        const id = Number(idStr);
        const product = products.find(p => p.id === id);
        return { product, score };
      })
      .filter((item): item is { product: Product; score: number } => !!item.product && item.product.stock > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    if (recommended.length < 3) {
      const cartCategories = new Set(
        cart.map(item => {
          const prod = products.find(p => p.id === item.id);
          return prod ? prod.category : '';
        }).filter(Boolean)
      );
      const complementary = products.filter(p => 
        !cartProductIds.has(p.id) && 
        p.stock > 0 &&
        (cartCategories.has(p.category) || p.rating >= 4.7)
      );
      const existingIds = new Set(recommended.map(p => p.id));
      complementary.forEach(p => {
        if (!existingIds.has(p.id)) {
          recommended.push(p);
        }
      });
    }

    return recommended.slice(0, 3);
  };

  const handleAddToCartClick = (p: Product) => {
    onAddToCart(p);
    setAddedProductId(p.id);
    setTimeout(() => setAddedProductId(null), 1200);
  };

  // Render standard product card
  const renderProductCard = (p: Product, showBadge = false) => {
    const isWished = wishlist.includes(p.id);
    const discount = calcDiscount(p.price, p.originalPrice);
    const isOutOfStock = p.stock <= 0;
    const isLowStock = !isOutOfStock && p.stock <= settings.lowStockThreshold;

    return (
      <div 
        key={p.id} 
        className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-150 dark:border-gray-800 hover:border-plum/30 dark:hover:border-pink-500/30 hover:shadow-xl transition-all duration-300 flex flex-col group relative h-full"
      >
        <div 
          onClick={() => onProductClick(p)}
          className="h-44 sm:h-48 bg-gray-50 dark:bg-gray-850 flex items-center justify-center relative overflow-hidden cursor-pointer shrink-0"
        >
          <img 
            src={p.image || 'https://via.placeholder.com/400?text=Kipchimatt'} 
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Grocery';
            }}
          />
          
          {discount > 0 && (
            <span className="absolute top-2.5 left-2.5 bg-plum text-white font-black text-[10px] px-2.5 py-1 rounded shadow-sm">
              -{discount}%
            </span>
          )}

          {showBadge && discount > 0 && (
            <span className="absolute top-2.5 left-16 bg-plum text-white font-black text-[9px] px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm flex items-center gap-1 border border-white/20">
              <Sparkle className="w-2.5 h-2.5 text-white fill-white" />
              <span>Deal</span>
            </span>
          )}

          {/* Quick View Button on Image */}
          <button 
            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(p); }}
            className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-gray-900/90 hover:bg-plum hover:text-white text-gray-800 dark:text-gray-100 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg shadow-md cursor-pointer transition-all flex items-center gap-1 backdrop-blur-xs opacity-90 hover:opacity-100 hover:scale-105"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5 text-plum group-hover:text-white" />
            <span>Quick View</span>
          </button>

          {/* Top-Right Action Controls (Share + Wishlist) */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            <button 
              onClick={(e) => { e.stopPropagation(); handleShareProduct(p); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all duration-200 hover:scale-110 ${copiedProductId === p.id ? 'bg-green text-white' : 'bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-200 hover:bg-plum hover:text-white'}`}
              title="Share product link"
            >
              {copiedProductId === p.id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform duration-200 hover:scale-115 ${isWished ? 'bg-plum text-white' : 'bg-white/95 dark:bg-gray-800/95 text-plum hover:bg-plum hover:text-white'}`}
              title={isWished ? 'Remove from wishlist' : 'Save for later'}
            >
              <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] text-plum dark:text-pink-400 font-black uppercase tracking-widest truncate">
                {p.brand || 'Kipchimatt'}
              </span>
              {p.rating && (
                <div className="flex items-center gap-0.5 text-xs text-plum dark:text-pink-400 font-bold" title={`${p.rating} / 5 Customer Rating`}>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= Math.round(p.rating || 0);
                      return (
                        <Star 
                          key={starVal} 
                          className={`w-2.5 h-2.5 ${isFilled ? 'fill-plum text-plum dark:fill-pink-400 dark:text-pink-400' : 'text-gray-200 dark:text-gray-700'}`} 
                        />
                      );
                    })}
                  </div>
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 font-black ml-1">({p.rating})</span>
                </div>
              )}
            </div>
            <h4 
              onClick={() => onProductClick(p)}
              className="font-black text-gray-800 dark:text-gray-100 text-xs sm:text-sm line-clamp-2 h-9 sm:h-10 leading-tight mb-2 group-hover:text-plum dark:group-hover:text-pink-300 transition-colors cursor-pointer"
            >
              {p.name}
            </h4>

            <div className="mb-3">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base font-extrabold text-plum dark:text-pink-400">
                  {formatMoney(p.price)}
                </span>
                {p.originalPrice > p.price && (
                  <span className="text-[11px] text-black dark:text-black line-through font-extrabold">
                    {formatMoney(p.originalPrice)}
                  </span>
                )}
              </div>
              {p.originalPrice > p.price && (
                <span className="text-[10px] text-plum dark:text-pink-400 font-extrabold block mt-0.5">
                  Save {formatMoney(p.originalPrice - p.price)} ({discount}%)
                </span>
              )}
              
              <label className="flex items-center gap-1.5 mt-2.5 cursor-pointer select-none text-[11px] font-bold text-black dark:text-black hover:text-plum">
                <input 
                  type="checkbox"
                  checked={comparedProductIds.includes(p.id)}
                  onChange={(e) => { e.stopPropagation(); onToggleCompare(p); }}
                  className="rounded border-gray-350 dark:border-gray-700 text-plum focus:ring-plum w-3.5 h-3.5 cursor-pointer"
                />
                <span className="text-black dark:text-black font-extrabold">Compare specs</span>
              </label>
            </div>
          </div>

          <div className="mt-auto pt-2">
            {isOutOfStock ? (
              <div className="text-center text-[10px] font-bold text-plum bg-plum/10 dark:bg-pink-950/40 py-1 rounded-md mb-2 flex items-center justify-center gap-1.5 border border-plum/20">
                <AlertCircle className="w-3.5 h-3.5 text-plum" />
                <span>Sold Out</span>
              </div>
            ) : isLowStock ? (
              <div className="text-center text-[10px] font-bold text-plum bg-plum/5 dark:bg-pink-950/20 py-1 rounded-md mb-2 border border-plum/20">
                Only {p.stock} left in stock
              </div>
            ) : null}

            <button 
              onClick={() => handleAddToCartClick(p)}
              disabled={isOutOfStock}
              className={`w-full py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors uppercase tracking-wider ${isOutOfStock ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : addedProductId === p.id ? 'bg-plum-dark text-white' : 'bg-plum hover:bg-plum-dark text-white'}`}
            >
              {addedProductId === p.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-white" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render secondary product card using the same standard product card renderer
  const renderSecondaryProductCard = (p: Product) => {
    return renderProductCard(p);
  };

  const getSecondaryPartProducts = () => {
    const primaryCategories = ['food cupboard', 'fresh food', 'beverages', 'liquor'];
    return products.filter(p => !primaryCategories.includes(p.category)).slice(0, 10);
  };

  // Filter lists for shelfs
  const deals = products.filter(p => p.originalPrice > p.price);
  const fresh = products.filter(p => p.category === 'fresh food');
  const beverages = products.filter(p => p.category === 'beverages');
  const liquor = products.filter(p => p.category === 'liquor');

  // Groups for Brand Chips section
  const brandGroupCategories = [
    { title: 'Food Cupboard', cat: 'food cupboard' },
    { title: 'Fresh Food & Dairy', cat: 'fresh food' },
    { title: 'Beverages', cat: 'beverages' },
    { title: 'Baby & Kids', cat: 'baby & kids' },
    { title: 'Electronics', cat: 'electronics' },
    { title: 'Beauty & Personal Care', cat: 'beauty' },
  ];

  const categoryBanners: Record<string, { title: string; subtitle: string; bg: string }> = {
    'all': {
      title: 'Our Premium Digital Catalog',
      subtitle: 'Browse thousands of authentic local products, handpicked quality groceries, electronics, and daily essentials with same-day express delivery.',
      bg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200'
    },
    'food cupboard': {
      title: 'Pantry & Food Cupboard Essentials',
      subtitle: 'Stock up your kitchen with high-quality grains, unga, cooking oils, premium spices, pastas, and premium shelf-stable ingredients.',
      bg: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1200'
    },
    'fresh food': {
      title: 'Fresh Food, Farm Fruits & Dairy',
      subtitle: 'Crisp organic vegetables, sweet seasonal fruits, local pasture milk, delicious yogurts, and farm-fresh poultry products delivered chilled.',
      bg: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=1200'
    },
    'beverages': {
      title: 'Energizing Beverages & Fine Coffees',
      subtitle: 'Rich Kenyan highland coffees, organic calming herbal teas, freshly squeezed fruit juices, and carbonated sodas for any celebration.',
      bg: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=1200'
    },
    'baby & kids': {
      title: 'Nurturing Baby & Kids Essentials',
      subtitle: 'Safe organic baby foods, ultra-soft diapers, gentle derm-care lotions, and creative educational toys designed to spark early imaginations.',
      bg: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=1200'
    },
    'electronics': {
      title: 'Smart Electronics & Home Gadgets',
      subtitle: 'Enhance your lifestyle with state-of-the-art mobile accessories, kitchen appliances, and high-quality entertainment setups.',
      bg: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&q=80&w=1200'
    },
    'cleaning': {
      title: 'Effective Home Care & Cleaning Gear',
      subtitle: 'Keep your sanctuary sparkling and sanitized with eco-safe powerful detergents, multi-surface sprays, and sturdy cleaning tools.',
      bg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=1200'
    },
    'beauty': {
      title: 'Beauty, Cosmetics & Personal Wellness',
      subtitle: 'Glow with dermatologist-loved skincare serums, refreshing hygiene products, rich body oils, and elegant makeup essentials.',
      bg: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1200'
    },
    'liquor': {
      title: 'Premium Spirits, Craft Beers & Wines',
      subtitle: 'Treat yourself to curated fine wines, single malt scotch whiskeys, craft rums, and perfectly brewed cold lagers.',
      bg: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1200'
    },
    'stationery': {
      title: 'School & Corporate Office Stationery',
      subtitle: 'Excellent writing utensils, executive notebooks, colorful organization binders, art sketchpads, and helpful office desk accessories.',
      bg: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1200'
    },
    'pet': {
      title: 'Gourmet Pet Food & Loving Care Supplies',
      subtitle: 'Only the best crunchy kibbles, tasty cat treats, orthopedic pet beds, safe grooming brushes, and fun active toys for your fur family.',
      bg: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1200'
    },
    'hardware': {
      title: 'Robust Hardware & DIY Repair Tools',
      subtitle: 'Equip your home workshop with reliable power drills, heavy-duty hammer kits, screwdrivers, fast-curing adhesives, and anchors.',
      bg: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=1200'
    },
    'furniture': {
      title: 'Modern Furniture & Intimate Home Decor',
      subtitle: 'Lounge in style with hand-tufted statement sofas, ergonomic workstations, atmospheric lamps, and elegant organizational shelving.',
      bg: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200'
    }
  };

  const currentBanner = categoryBanners[activeCategory] || categoryBanners['all'];

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {loading ? (
          /* PREMIUM SHIMMERING SKELETON UI FOR BOTH HOME AND FILTER VIEW */
          <div className="space-y-12 py-6">
            {/* Banner skeleton */}
            <div className="w-full h-44 sm:h-56 md:h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            
            {/* Category tiles skeleton */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-4 text-center space-y-2 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mx-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel shelves skeleton */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-64 animate-pulse" />
                <div className="flex gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="min-w-[210px] bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 rounded-2xl space-y-4 animate-pulse">
                    <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeSearch || (activeCategory && activeCategory !== 'all') ? (
          <section className="py-6 min-h-[400px]">
            
            {/* STUNNING CATEGORY HERO BANNER */}
            {!activeSearch && (
              <div 
                className="w-full h-44 sm:h-56 md:h-64 rounded-3xl overflow-hidden mb-8 relative flex items-center justify-start p-6 sm:p-10 shadow-lg border border-gray-100 dark:border-gray-800 transition-all group hover:shadow-xl"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(120, 32, 69, 0.95) 20%, rgba(120, 32, 69, 0.7) 50%, rgba(0, 0, 0, 0.2) 100%), url(${currentBanner.bg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="max-w-xl text-white space-y-2 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-gray-900 px-3 py-1 rounded-full inline-block mb-1 shadow-md">
                    Featured Category
                  </span>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow-md text-white">
                    {currentBanner.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-150 leading-relaxed font-semibold drop-shadow max-w-lg opacity-90">
                    {currentBanner.subtitle}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-yellow-300 uppercase tracking-widest">
                    <span>Express 45-Min Shipping</span>
                    <span>•</span>
                    <span>100% Quality Guaranteed</span>
                  </div>
                </div>
                {/* Visual accent circles */}
                <div className="absolute right-10 bottom-10 w-24 h-24 rounded-full border-4 border-white/10 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute right-16 top-10 w-12 h-12 rounded-full border border-white/5 pointer-events-none group-hover:translate-x-3 transition-transform duration-500" />
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-plum/5 rounded-xl text-plum">
                  <LayoutGrid className="w-5 h-5 text-plum" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-800 flex items-center gap-2">
                    <span>
                      {activeSearch 
                        ? `Search Results for "${activeSearch}"` 
                        : activeCategory === 'all'
                        ? 'All Kikapu Products'
                        : categoryMeta.find(c => c.key === activeCategory)?.label || 'Products'}
                    </span>
                    <span className="text-xs bg-plum/10 text-plum font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {getFilteredProducts().length} Items
                    </span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
                {/* SORTING SELECT DROPDOWN */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-plum dark:text-pink-400" />
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Sort by:</span>
                  <select 
                    id="store-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-extrabold px-3 py-1.5 rounded-xl outline-none focus:border-plum focus:ring-1 focus:ring-plum cursor-pointer shadow-xs"
                  >
                    <option value="default">Default / Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Rating: High to Low</option>
                  </select>
                </div>

                {(activeSearch || activeCategory !== 'all' || sortBy !== 'default') && (
                  <button 
                    onClick={() => { onCategorySelect('all'); onBrandSelect(''); setSortBy('default'); }}
                    className="text-xs font-black text-plum bg-plum/5 hover:bg-plum/10 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              /* PREMIUM SHIMMERING SKELETON UI */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, sIdx) => (
                  <div key={sIdx} className="bg-white rounded-2xl overflow-hidden border border-gray-150 p-4 space-y-4 animate-pulse">
                    <div className="h-44 bg-gray-100 rounded-xl w-full" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="h-4 bg-gray-100 rounded w-5/6" />
                      <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-9 bg-gray-100 rounded-lg w-full mt-4" />
                  </div>
                ))}
              </div>
            ) : getFilteredProducts().length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {getFilteredProducts().map(p => renderProductCard(p, true))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-150 p-8 max-w-md mx-auto shadow-sm">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-extrabold text-gray-800 text-base mb-1">No products found</h3>
                <p className="text-gray-500 text-xs mb-6">We couldn't find matches for your search. Try adjusting terms or selecting a category.</p>
                <button 
                  onClick={() => { onCategorySelect('all'); onBrandSelect(''); }}
                  className="bg-plum hover:bg-plum-dark text-white text-xs font-bold px-6 py-2.5 rounded-full cursor-pointer transition-colors shadow-sm"
                >
                  Show All Products
                </button>
              </div>
            )}
          </section>
        ) : (
          /* Storefront Homepage view */
          <>
            {/* Shop by Category - Smoothly Swipeable across all screen sizes */}
            <section className="py-6">
              <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-900 p-3.5 sm:p-4 rounded-2xl border-l-4 border-l-plum border border-gray-200 dark:border-gray-800 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-plum text-white flex items-center justify-center shadow-md">
                    <LayoutGrid className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-plum dark:text-pink-300 flex items-center gap-2">
                      <span>Shop by Category</span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-plum/10 text-plum dark:text-pink-300 px-2.5 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3 text-yellow fill-yellow" />
                        Swipe to explore
                      </span>
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Explore departments with premium Kipchimatt quality
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-plum dark:text-pink-300 font-bold mr-1 flex items-center gap-1">
                    <span>Swipe</span>
                    <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => scrollCarousel(categoryRef, -1)}
                      className="w-8 h-8 rounded-xl border border-plum/30 bg-white dark:bg-gray-800 text-plum dark:text-pink-300 hover:bg-plum hover:text-white flex items-center justify-center active:scale-95 cursor-pointer shadow-xs transition-colors"
                      aria-label="Scroll categories left"
                      title="Scroll Left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel(categoryRef, 1)}
                      className="w-8 h-8 rounded-xl border border-plum/30 bg-white dark:bg-gray-800 text-plum dark:text-pink-300 hover:bg-plum hover:text-white flex items-center justify-center active:scale-95 cursor-pointer shadow-xs transition-colors"
                      aria-label="Scroll categories right"
                      title="Scroll Right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Swipeable track */}
              <div 
                ref={categoryRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 pb-4 pt-1 px-1 scroll-smooth no-scrollbar select-none touch-pan-x cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categoryMeta.map(c => {
                  const isSelected = activeCategory === c.key;
                  return (
                    <div 
                      key={c.key}
                      onClick={() => onCategorySelect(c.key)}
                      className={`min-w-[120px] sm:min-w-[140px] md:min-w-[155px] lg:min-w-[165px] flex-shrink-0 snap-start rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 select-none active:scale-95 group flex flex-col border-2 ${
                        isSelected 
                          ? 'bg-plum text-white border-plum shadow-xl scale-[1.02]' 
                          : 'bg-white dark:bg-gray-900 text-plum-dark dark:text-pink-200 border-plum/20 hover:border-plum hover:shadow-lg hover:-translate-y-1'
                      }`}
                    >
                      {/* Image Thumbnail with Plum Tint */}
                      <div className="relative h-18 sm:h-22 w-full bg-plum/5 dark:bg-gray-800 overflow-hidden">
                        <img 
                          src={c.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'} 
                          alt={c.label}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className={`absolute inset-0 ${isSelected ? 'bg-plum/70' : 'bg-gradient-to-t from-plum-dark/80 via-plum-dark/30 to-transparent'}`} />
                        
                        {/* Icon Badge */}
                        <div className={`absolute top-2 left-2 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-md transition-colors ${
                          isSelected ? 'bg-white text-plum' : 'bg-white/95 text-plum group-hover:bg-plum group-hover:text-white'
                        }`}>
                          {getCategoryIcon(c.icon)}
                        </div>

                        {/* Selected Checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-white text-plum p-1 rounded-full shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Category Label */}
                      <div className={`p-2.5 text-center flex-1 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-plum text-white font-black' : 'bg-white dark:bg-gray-900 text-plum dark:text-pink-300 font-extrabold group-hover:bg-plum group-hover:text-white'
                      }`}>
                        <span className="text-[11px] sm:text-xs line-clamp-2 leading-tight">
                          {c.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Frequently Bought Together Add-ons */}
            {cart.length > 0 && getFrequentlyBoughtTogether().length > 0 && (
              <section className="py-6 bg-plum/5 dark:bg-pink-950/10 rounded-3xl p-5 border border-plum/15 dark:border-pink-800/20 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-sm font-black text-plum dark:text-pink-300 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-plum fill-plum animate-pulse" />
                      <span>Frequently Bought Together Add-ons</span>
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold">
                      Based on items currently in your cart, customers also buy these items together:
                    </p>
                  </div>
                  <span className="text-[9px] bg-plum text-white font-black uppercase px-2.5 py-1 rounded-full tracking-wider self-start sm:self-auto shadow-sm">
                    Kikapu Smart Suggest
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-none snap-x snap-mandatory">
                  {getFrequentlyBoughtTogether().map(p => (
                    <div key={p.id} className="min-w-[210px] max-w-[210px] sm:min-w-[220px] sm:max-w-[220px] snap-start flex-shrink-0">
                      {renderProductCard(p, true)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Kikapu Chapchap Deals Carousel */}
            {deals.length > 0 && (
              <section className="py-6" id="deals-shelf">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-plum fill-plum" />
                    <span>Kikapu Chapchap Deals</span>
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => scrollCarousel(dealsRef, -1)}
                      className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-plum hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel(dealsRef, 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-plum hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div 
                  ref={dealsRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
                >
                  {deals.slice(0, 10).map(p => (
                    <div key={p.id} className="min-w-[210px] max-w-[210px] sm:min-w-[220px] sm:max-w-[220px] snap-start flex-shrink-0">
                      {renderProductCard(p, true)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Products Grid */}
            <section className="py-6">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-base font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-plum" />
                  <span>Popular Products</span>
                </h2>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-plum dark:text-pink-400" />
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Sort by:</span>
                  <select 
                    id="homepage-popular-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-extrabold px-3 py-1.5 rounded-xl outline-none focus:border-plum focus:ring-1 focus:ring-plum cursor-pointer shadow-xs"
                  >
                    <option value="default">Default / Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating-desc">Rating: High to Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {getFilteredProducts().slice(0, 10).map(p => renderProductCard(p))}
              </div>
            </section>

            {/* Lifestyle & Household Essentials (Second Part of All Products - Different Combination) */}
            <section className="py-8 border-y border-gray-150 my-6 bg-gray-50/30 p-5 rounded-2xl dark:bg-gray-900/10">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-plum" />
                  <h2 className="text-base font-black text-gray-850 flex items-center gap-2">
                    <span>Lifestyle & Household Staples</span>
                    <span className="text-[9px] bg-plum-fade text-plum font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-plum/15">
                      Collection 2
                    </span>
                  </h2>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Explore a different combination of premium electronics, home wellness, baby care, pet supplies, and study essentials.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {getSecondaryPartProducts().map(p => renderSecondaryProductCard(p))}
              </div>
            </section>

            {/* Fresh Food Carousel */}
            {fresh.length > 0 && (
              <section className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Carrot className="w-5 h-5 text-plum fill-plum/20" />
                    <span>Fresh from the Farm</span>
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => scrollCarousel(freshRef, -1)}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-plum hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel(freshRef, 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-plum hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div 
                  ref={freshRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
                >
                  {fresh.slice(0, 8).map(p => (
                    <div key={p.id} className="min-w-[210px] max-w-[210px] sm:min-w-[220px] sm:max-w-[220px] snap-start flex-shrink-0">
                      {renderProductCard(p, true)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Beverages Carousel */}
            {beverages.length > 0 && (
              <section className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-plum" />
                    <span>Beverages</span>
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => scrollCarousel(beverageRef, -1)}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-plum hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel(beverageRef, 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-plum hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div 
                  ref={beverageRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
                >
                  {beverages.slice(0, 8).map(p => (
                    <div key={p.id} className="min-w-[210px] max-w-[210px] sm:min-w-[220px] sm:max-w-[220px] snap-start flex-shrink-0">
                      {renderProductCard(p, true)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Liquor Carousel */}
            {liquor.length > 0 && (
              <section className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Wine className="w-5 h-5 text-plum" />
                    <span>Liquor & Spirits</span>
                    <span className="text-[10px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold px-2 py-0.5 rounded border border-red-100 dark:border-red-900/40 uppercase tracking-widest">
                      18+ Only
                    </span>
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => scrollCarousel(liquorRef, -1)}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-plum hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => scrollCarousel(liquorRef, 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-plum hover:text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div 
                  ref={liquorRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
                >
                  {liquor.slice(0, 8).map(p => (
                    <div key={p.id} className="min-w-[210px] max-w-[210px] sm:min-w-[220px] sm:max-w-[220px] snap-start flex-shrink-0">
                      {renderProductCard(p, true)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recommended for You Section based on Previous Purchases/Wishlist (Positioned perfectly at the bottom) */}
            <section className="py-6 border-t border-gray-150 mt-4">
              <div className="mb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-plum fill-plum animate-pulse" />
                      <span>Recommended For You</span>
                      {!recommendationData.isFallback && (
                        <span className="text-[9px] bg-plum text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {recommendationData.reason === 'purchased' ? 'Based on Purchases' : 'Based on Wishlist'}
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {recommendationData.isFallback 
                        ? 'Trending supermarket favorites we think you will love.' 
                        : recommendationData.reason === 'purchased'
                        ? 'Selected products based on your previously purchased categories.'
                        : 'Curated products matching categories in your wishlist.'}
                    </p>
                  </div>
                </div>
              </div>

              {recommendationData.isFallback && (
                <div className="mb-5 p-4 bg-plum/5 border border-plum/15 rounded-2xl text-xs text-gray-600 font-semibold flex items-center gap-2.5">
                  <Heart className="w-5 h-5 text-plum fill-plum" />
                  <span>
                    <strong>Personalize:</strong> Tap the heart icon on your favorite items or complete your first order to unlock smart, tailored recommendations matching your taste!
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recommendationData.items.map(p => (
                  <div key={p.id}>
                    {renderProductCard(p)}
                  </div>
                ))}
              </div>
            </section>

            {/* Shop by Brand Sections */}
            <section className="py-6 border-t border-gray-150 mt-4" id="brands-section">
              <div className="mb-6">
                <h2 className="text-base font-extrabold text-black dark:text-black flex items-center gap-2">
                  <Star className="w-5 h-5 text-plum fill-plum" />
                  <span className="text-black dark:text-black">Shop by Brand</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Explore by selecting your favorite domestic or international brand.</p>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-950/20 p-6 rounded-2xl border border-gray-150 dark:border-gray-800">
                <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
                  {Array.from(
                    new Set(
                      products
                        .map(p => p.brand)
                        .filter(Boolean)
                    )
                  ).sort((a, b) => a.localeCompare(b)).map(brand => (
                    <button
                      key={brand}
                      onClick={() => onBrandSelect(brand)}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-plum hover:text-plum font-extrabold text-xs px-5 py-2.5 rounded-full cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-95 text-black dark:text-black"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

      </div>

      {/* Lightweight Quick View Drawer */}
      <QuickViewDrawer 
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(product, qty) => {
          onAddToCart(product, qty);
        }}
        onToggleWishlist={onToggleWishlist}
        isWished={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onFullDetails={(product) => {
          setQuickViewProduct(null);
          onProductClick(product);
        }}
        onShowToast={onShowToast}
        settings={settings}
      />
    </div>
  );
}
