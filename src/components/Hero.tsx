import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Truck, ShieldCheck, Clock, Tag, Zap, ArrowRight, ChevronLeft, ChevronRight, CheckCircle2, ShoppingBag 
} from 'lucide-react';

interface HeroProps {
  onExploreCategory: (category: string) => void;
  onScrollToDeals: () => void;
  onScrollToBrands: () => void;
}

const SLIDES = [
  {
    id: 1,
    title: "Fresh Supermarket Harvest",
    subtitle: "Directly Sourced From Top Farmers & Local Producers",
    tagline: "UP TO 30% OFF FRESH PRODUCE",
    bgGradient: "from-plum-dark via-plum to-[#3a0d21]",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    badge: "Weekly Special",
    category: "fresh food",
    dealText: "Ksh 120 / kg Fresh Tomatoes"
  },
  {
    id: 2,
    title: "90-Minute Express Delivery",
    subtitle: "Fastest Grocery Fulfillment Direct to Your Doorstep",
    tagline: "FREE SHIPPING ON ORDERS ABOVE KSH 2,000",
    bgGradient: "from-[#4a102a] via-plum to-plum-dark",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&q=80",
    badge: "Super Speed",
    category: "food cupboard",
    dealText: "Unbeatable Grain & Unga Deals"
  },
  {
    id: 3,
    title: "Household & Home Appliances",
    subtitle: "Quality Brands & Kitchenware at Kenya's Lowest Prices",
    tagline: "M-PESA PAYMENT ON DELIVERY ACCEPTED",
    bgGradient: "from-plum via-[#541230] to-plum-dark",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
    badge: "Hot Mega Deals",
    category: "electronics",
    dealText: "100% Genuine Certified Goods"
  },
  {
    id: 4,
    title: "Premium Beverages & Refreshments",
    subtitle: "Juices, Teas, Coffees & Sodas Delivered Chilled",
    tagline: "ALWAYS FRESH & ICE COLD",
    bgGradient: "from-[#3a0d21] via-plum to-plum-dark",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
    badge: "Thirst Quenchers",
    category: "beverages",
    dealText: "Top Brands at Wholesale Prices"
  }
];

const QUICK_CATEGORY_CHIPS = [
  { label: 'Fresh Food', key: 'fresh food', icon: '🥦' },
  { label: 'Food Cupboard', key: 'food cupboard', icon: '🌾' },
  { label: 'Beverages', key: 'beverages', icon: '☕' },
  { label: 'Electronics', key: 'electronics', icon: '🔌' },
  { label: 'Liquor Cellar', key: 'liquor', icon: '🍷' },
];

export default function Hero({ onExploreCategory, onScrollToDeals, onScrollToBrands }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  const handlePrev = () => {
    setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative bg-plum-dark text-white overflow-hidden shadow-2xl border-b border-plum/40">
      
      {/* Rich Deep Plum Background Gradient & Ambient Mesh */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient} transition-all duration-700 opacity-98`} />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.08]" />
      
      {/* Decorative Plum & Gold Glowing Ambient Orbs */}
      <div className="absolute -top-28 -left-28 w-96 h-96 bg-plum rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 w-96 h-96 bg-[#942352] rounded-full blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-yellow/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10">
        
        {/* Main Hero Grid */}
        <div className="grid grid-cols-12 gap-2 sm:gap-4 md:gap-8 items-center">
          
          {/* Left Text & CTA Section */}
          <div className="col-span-7 space-y-2 sm:space-y-4 md:space-y-5 text-left pr-1 sm:pr-0 z-10">
            
            {/* Top Badge & Promo Line */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 bg-yellow text-gray-950 font-black px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-wider shadow-md">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-gray-950 shrink-0" />
                <span className="truncate">{slide.badge}</span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-pink-200 tracking-wider uppercase hidden xs:inline-block">
                {slide.tagline}
              </span>
            </div>

            {/* Title & Headline */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-base sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                {slide.title}
              </h1>
              <p className="text-[11px] sm:text-xs md:text-base text-white/90 font-medium max-w-xl line-clamp-2 sm:line-clamp-none leading-relaxed">
                {slide.subtitle} — Fresh vegetables, pantry staples, bakery treats, drinks & electronics.
              </p>
            </div>

            {/* Quick Jump Category Chips in Hero Banner */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-pink-200/80 mr-1">Popular:</span>
              {QUICK_CATEGORY_CHIPS.map(chip => (
                <button
                  key={chip.key}
                  onClick={() => onExploreCategory(chip.key)}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-[10px] md:text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={onScrollToDeals}
                className="bg-yellow hover:bg-yellow-400 text-gray-950 font-black text-[10px] sm:text-xs md:text-sm px-3.5 sm:px-6 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-xl transition-all transform hover:scale-105 cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 group"
              >
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-gray-950 group-hover:animate-bounce" />
                <span>Shop Today's Deals</span>
              </button>

              <button
                onClick={() => onExploreCategory(slide.category)}
                className="bg-plum/50 hover:bg-plum/80 text-white border border-white/25 font-bold text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-5 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
              >
                <span>Browse {slide.category}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={onScrollToBrands}
                className="hidden lg:inline-block text-xs font-bold text-white/80 hover:text-white underline underline-offset-4 px-1 py-1 cursor-pointer transition-colors"
              >
                Featured Brands
              </button>
            </div>

            {/* Slide Navigation Controls */}
            <div className="flex items-center gap-3 pt-1 sm:pt-3">
              <div className="flex gap-1.5 items-center">
                {SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide ? 'w-6 sm:w-9 bg-yellow shadow-md' : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs font-black text-white/70 tracking-widest uppercase">
                0{currentSlide + 1} / 0{SLIDES.length}
              </span>
            </div>
          </div>

          {/* Right Image Showcase Section */}
          <div className="col-span-5 relative">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 group bg-plum-dark/40">
              
              {/* Main Image */}
              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-28 xs:h-36 sm:h-52 md:h-72 lg:h-80 object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/90 via-plum-dark/20 to-transparent" />
              
              {/* Floating Top Badge */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/60 backdrop-blur-md text-white font-black text-[9px] sm:text-xs px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1 shadow-md">
                <ShoppingBag className="w-3 h-3 text-yellow" />
                <span className="truncate max-w-[110px] xs:max-w-none">{slide.dealText}</span>
              </div>

              {/* Slide Arrow Navigation Overlay */}
              <div className="absolute inset-y-0 left-1 right-1 flex items-center justify-between pointer-events-none">
                <button
                  onClick={handlePrev}
                  className="pointer-events-auto w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-plum/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer hover:scale-110 shadow-lg"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="pointer-events-auto w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-plum/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer hover:scale-110 shadow-lg"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Badge overlay on image */}
              <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between text-white text-[9px] sm:text-xs font-bold">
                <span className="bg-plum-dark/90 backdrop-blur-md px-2 py-1 rounded-lg sm:rounded-xl border border-white/20 truncate max-w-[65%] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green shrink-0" />
                  <span className="truncate">Kipchimatt Certified</span>
                </span>
                <span className="bg-green text-white font-black px-2 py-1 rounded-lg shrink-0 shadow-sm">
                  In Stock
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Feature Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-8 pt-3 sm:pt-6 border-t border-white/15 text-xs text-white/90">
          <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-plum/40 backdrop-blur-md border border-white/15 hover:bg-plum/60 transition-colors shadow-sm">
            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-yellow shrink-0" />
            <div className="min-w-0">
              <p className="font-black text-white text-[11px] sm:text-xs truncate">Under 90 Min</p>
              <p className="text-[9px] sm:text-[10px] text-white/70 truncate font-semibold">Fast rider delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-plum/40 backdrop-blur-md border border-white/15 hover:bg-plum/60 transition-colors shadow-sm">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-yellow shrink-0" />
            <div className="min-w-0">
              <p className="font-black text-white text-[11px] sm:text-xs truncate">100% Genuine</p>
              <p className="text-[9px] sm:text-[10px] text-white/70 truncate font-semibold">Authentic Kenyan goods</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-plum/40 backdrop-blur-md border border-white/15 hover:bg-plum/60 transition-colors shadow-sm">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow shrink-0" />
            <div className="min-w-0">
              <p className="font-black text-white text-[11px] sm:text-xs truncate">Open 24/7 Online</p>
              <p className="text-[9px] sm:text-[10px] text-white/70 truncate font-semibold">Daily order dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 p-2 sm:p-3 rounded-2xl bg-plum/40 backdrop-blur-md border border-white/15 hover:bg-plum/60 transition-colors shadow-sm">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-yellow shrink-0" />
            <div className="min-w-0">
              <p className="font-black text-white text-[11px] sm:text-xs truncate">Smart Rewards</p>
              <p className="text-[9px] sm:text-[10px] text-white/70 truncate font-semibold">Earn points on carts</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


