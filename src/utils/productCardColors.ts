// Product card color schemes, category accents, and dynamic theming utilities

export type CardColorThemeId = 'category' | 'plum' | 'emerald' | 'amber' | 'sapphire' | 'midnight';

export interface CardColorTheme {
  id: CardColorThemeId;
  name: string;
  description: string;
  primaryHex: string;
  secondaryHex: string;
  swatchBg: string;
  priceClass: string;
  btnClass: string;
  btnAddedClass: string;
  borderHoverClass: string;
  glowClass: string;
  badgeBgClass: string;
}

export interface CategoryColorDef {
  key: string;
  label: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
  hoverGlow: string;
  lightBg: string;
  gradient: string;
}

// Category-specific color mapping for high-contrast, visually pleasing department recognition
export const CATEGORY_COLORS: Record<string, CategoryColorDef> = {
  'food cupboard': {
    key: 'food cupboard',
    label: 'Food Cupboard',
    accentHex: '#d97706',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    borderAccent: 'border-amber-300',
    hoverGlow: 'hover:border-amber-400 hover:shadow-amber-500/10',
    lightBg: 'bg-amber-50/60',
    gradient: 'from-amber-500 to-amber-600',
  },
  'fresh food': {
    key: 'fresh food',
    label: 'Fresh Food',
    accentHex: '#059669',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    borderAccent: 'border-emerald-300',
    hoverGlow: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
    lightBg: 'bg-emerald-50/60',
    gradient: 'from-emerald-500 to-green-600',
  },
  'beverages': {
    key: 'beverages',
    label: 'Beverages',
    accentHex: '#0284c7',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-800',
    borderAccent: 'border-sky-300',
    hoverGlow: 'hover:border-sky-400 hover:shadow-sky-500/10',
    lightBg: 'bg-sky-50/60',
    gradient: 'from-sky-500 to-blue-600',
  },
  'liquor': {
    key: 'liquor',
    label: 'Liquor Cellar',
    accentHex: '#7c3aed',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    borderAccent: 'border-purple-300',
    hoverGlow: 'hover:border-purple-400 hover:shadow-purple-500/10',
    lightBg: 'bg-purple-50/60',
    gradient: 'from-purple-600 to-indigo-700',
  },
  'baby & kids': {
    key: 'baby & kids',
    label: 'Baby & Kids',
    accentHex: '#ec4899',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-800',
    borderAccent: 'border-pink-300',
    hoverGlow: 'hover:border-pink-400 hover:shadow-pink-500/10',
    lightBg: 'bg-pink-50/60',
    gradient: 'from-pink-500 to-rose-500',
  },
  'electronics': {
    key: 'electronics',
    label: 'Electronics',
    accentHex: '#4f46e5',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-800',
    borderAccent: 'border-indigo-300',
    hoverGlow: 'hover:border-indigo-400 hover:shadow-indigo-500/10',
    lightBg: 'bg-indigo-50/60',
    gradient: 'from-indigo-600 to-blue-600',
  },
  'cleaning': {
    key: 'cleaning',
    label: 'Household & Cleaning',
    accentHex: '#0d9488',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800',
    borderAccent: 'border-teal-300',
    hoverGlow: 'hover:border-teal-400 hover:shadow-teal-500/10',
    lightBg: 'bg-teal-50/60',
    gradient: 'from-teal-500 to-emerald-600',
  },
  'beauty': {
    key: 'beauty',
    label: 'Beauty & Cosmetics',
    accentHex: '#db2777',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-800',
    borderAccent: 'border-rose-300',
    hoverGlow: 'hover:border-rose-400 hover:shadow-rose-500/10',
    lightBg: 'bg-rose-50/60',
    gradient: 'from-rose-500 to-pink-600',
  },
  'health': {
    key: 'health',
    label: 'Health & Pharmacy',
    accentHex: '#e11d48',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    borderAccent: 'border-red-300',
    hoverGlow: 'hover:border-red-400 hover:shadow-red-500/10',
    lightBg: 'bg-red-50/60',
    gradient: 'from-red-500 to-rose-600',
  },
  'stationery': {
    key: 'stationery',
    label: 'Stationery & Books',
    accentHex: '#ca8a04',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-800',
    borderAccent: 'border-yellow-300',
    hoverGlow: 'hover:border-yellow-400 hover:shadow-yellow-500/10',
    lightBg: 'bg-yellow-50/60',
    gradient: 'from-yellow-600 to-amber-600',
  },
  'pet': {
    key: 'pet',
    label: 'Pet Care',
    accentHex: '#ea580c',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    borderAccent: 'border-orange-300',
    hoverGlow: 'hover:border-orange-400 hover:shadow-orange-500/10',
    lightBg: 'bg-orange-50/60',
    gradient: 'from-orange-500 to-amber-600',
  },
  'hardware': {
    key: 'hardware',
    label: 'Hardware & DIY',
    accentHex: '#475569',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    borderAccent: 'border-slate-300',
    hoverGlow: 'hover:border-slate-400 hover:shadow-slate-500/10',
    lightBg: 'bg-slate-50/60',
    gradient: 'from-slate-600 to-zinc-700',
  },
  'furniture': {
    key: 'furniture',
    label: 'Home & Furniture',
    accentHex: '#b45309',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    borderAccent: 'border-amber-300',
    hoverGlow: 'hover:border-amber-400 hover:shadow-amber-500/10',
    lightBg: 'bg-amber-50/60',
    gradient: 'from-amber-700 to-orange-700',
  },
  'apparel': {
    key: 'apparel',
    label: 'Apparel & Fashion',
    accentHex: '#8b5cf6',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800',
    borderAccent: 'border-violet-300',
    hoverGlow: 'hover:border-violet-400 hover:shadow-violet-500/10',
    lightBg: 'bg-violet-50/60',
    gradient: 'from-violet-500 to-purple-600',
  },
  'sports': {
    key: 'sports',
    label: 'Sports & Outdoors',
    accentHex: '#16a34a',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800',
    borderAccent: 'border-green-300',
    hoverGlow: 'hover:border-green-400 hover:shadow-green-500/10',
    lightBg: 'bg-green-50/60',
    gradient: 'from-green-600 to-emerald-700',
  },
  'books': {
    key: 'books',
    label: 'Books & Media',
    accentHex: '#0891b2',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-800',
    borderAccent: 'border-cyan-300',
    hoverGlow: 'hover:border-cyan-400 hover:shadow-cyan-500/10',
    lightBg: 'bg-cyan-50/60',
    gradient: 'from-cyan-600 to-teal-700',
  },
};

// Fallback for unspecified categories
const DEFAULT_CATEGORY_COLOR: CategoryColorDef = {
  key: 'default',
  label: 'Groceries',
  accentHex: '#782045',
  badgeBg: 'bg-plum/10',
  badgeText: 'text-plum',
  borderAccent: 'border-plum/20',
  hoverGlow: 'hover:border-plum/40 hover:shadow-plum/10',
  lightBg: 'bg-plum-fade/40',
  gradient: 'from-plum to-plum-dark',
};

export function getCategoryColorDef(category: string): CategoryColorDef {
  const norm = (category || '').toLowerCase().trim();
  return CATEGORY_COLORS[norm] || DEFAULT_CATEGORY_COLOR;
}

// 6 Available Product Card Color Themes
export const CARD_COLOR_THEMES: Record<CardColorThemeId, CardColorTheme> = {
  category: {
    id: 'category',
    name: 'Dynamic Category Colors',
    description: 'Each card receives vibrant, intuitive color accents matching its department (Fresh = Emerald, Drinks = Sky, etc.)',
    primaryHex: '#059669',
    secondaryHex: '#7c3aed',
    swatchBg: 'bg-gradient-to-tr from-emerald-500 via-amber-500 to-purple-600',
    priceClass: 'text-gray-900',
    btnClass: 'bg-gray-900 hover:bg-black text-white',
    btnAddedClass: 'bg-emerald-600 text-white',
    borderHoverClass: '',
    glowClass: '',
    badgeBgClass: '',
  },
  plum: {
    id: 'plum',
    name: 'Classic K-Matt Plum',
    description: 'Signature Kenyan supermarket brand theme with rich burgundy plum and rose accents',
    primaryHex: '#782045',
    secondaryHex: '#9b2c5b',
    swatchBg: 'bg-[#782045]',
    priceClass: 'text-plum',
    btnClass: 'bg-plum hover:bg-plum-dark text-white',
    btnAddedClass: 'bg-plum-dark text-white',
    borderHoverClass: 'hover:border-plum/40',
    glowClass: 'hover:shadow-plum/15',
    badgeBgClass: 'bg-plum text-white',
  },
  emerald: {
    id: 'emerald',
    name: 'Fresh Eco Emerald',
    description: 'Lush organic supermarket green with vibrant herbal highlights and clean eco-tones',
    primaryHex: '#059669',
    secondaryHex: '#10b981',
    swatchBg: 'bg-emerald-600',
    priceClass: 'text-emerald-700',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    btnAddedClass: 'bg-emerald-800 text-white',
    borderHoverClass: 'hover:border-emerald-500/50',
    glowClass: 'hover:shadow-emerald-500/15',
    badgeBgClass: 'bg-emerald-600 text-white',
  },
  amber: {
    id: 'amber',
    name: 'Warm Sunset Amber',
    description: 'Vibrant golden hour glow with warm harvest amber and rich copper highlights',
    primaryHex: '#d97706',
    secondaryHex: '#f59e0b',
    swatchBg: 'bg-amber-500',
    priceClass: 'text-amber-700',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    btnAddedClass: 'bg-amber-800 text-white',
    borderHoverClass: 'hover:border-amber-500/50',
    glowClass: 'hover:shadow-amber-500/15',
    badgeBgClass: 'bg-amber-600 text-white',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Modern Sapphire Blue',
    description: 'High-tech premium ocean blue with clean cyan contrasts and cool modern aesthetics',
    primaryHex: '#0284c7',
    secondaryHex: '#0ea5e9',
    swatchBg: 'bg-sky-600',
    priceClass: 'text-sky-700',
    btnClass: 'bg-sky-600 hover:bg-sky-700 text-white',
    btnAddedClass: 'bg-sky-800 text-white',
    borderHoverClass: 'hover:border-sky-500/50',
    glowClass: 'hover:shadow-sky-500/15',
    badgeBgClass: 'bg-sky-600 text-white',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Velvet',
    description: 'Striking ultraviolet and deep indigo contrast styling',
    primaryHex: '#8b5cf6',
    secondaryHex: '#a855f7',
    swatchBg: 'bg-purple-600',
    priceClass: 'text-purple-700',
    btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    btnAddedClass: 'bg-purple-800 text-white',
    borderHoverClass: 'hover:border-purple-500/60',
    glowClass: 'hover:shadow-purple-500/20',
    badgeBgClass: 'bg-purple-600 text-white',
  },
};
