import { getGlobalCurrency, setGlobalCurrency, CURRENCY_TO_LANG, LANG_TO_CURRENCY } from './catalog';

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'search_placeholder': 'Search over 15,000+ items across Kipchimatt...',
    'deliver_to': 'Deliver to:',
    'all_departments': 'All Departments',
    'todays_deals': "Today's Deals",
    'fresh_produce': 'Fresh Produce',
    'electricals': 'Electricals',
    'everyday_wear': 'Everyday Wear',
    'liquor_cellar': 'Liquor Cellar',
    'free_delivery_over': 'Free Delivery over',
    'storefront': 'Storefront',
    'admin': 'Admin',
    'cart': 'Shopping Cart',
    'wishlist': 'Wishlist',
    'account': 'Account Profile / Orders',
    'language_currency': 'Language & Currency',
    'hello_sign_in': 'Hello, Sign In',
    'hello_customer': 'Hello, Customer',
    'shop_by_category': 'Shop by Department',
    'add_to_cart': 'Add to Cart',
    'quick_view': 'Quick View',
    'in_stock': 'In Stock',
    'save': 'Save',
    'specs': 'Compare specs',
    'checkout': 'Proceed to Checkout',
    'subtotal': 'Subtotal',
    'total': 'Total',
    'search': 'Search',
  },
  sw: {
    'search_placeholder': 'Tafuta zaidi ya bidhaa 15,000+ Kipchimatt...',
    'deliver_to': 'Peleka kwa:',
    'all_departments': 'Idara Zote',
    'todays_deals': 'Punguzo la Leo',
    'fresh_produce': 'Matunda na Mboga',
    'electricals': 'Vifaa vya Umeme',
    'everyday_wear': 'Nguo za Kila Siku',
    'liquor_cellar': 'Duka la Vinywaji',
    'free_delivery_over': 'Usafiri Bure zaidi ya',
    'storefront': 'Duka Kuu',
    'admin': 'Utawala',
    'cart': 'Kikapu cha Ununuzi',
    'wishlist': 'Vitu Nilivyohifadhi',
    'account': 'Akaunti Yangu / Maagizo',
    'language_currency': 'Lugha na Sarafu',
    'hello_sign_in': 'Hujambo, Ingia',
    'hello_customer': 'Hujambo, Mteja',
    'shop_by_category': 'Nunua kwa Idara',
    'add_to_cart': 'Weka Kwenye Kikapu',
    'quick_view': 'Tazama Haraka',
    'in_stock': 'Zipo Dukan',
    'save': 'Okoa',
    'specs': 'Lanisha Sifa',
    'checkout': 'Kamilisha Malipo',
    'subtotal': 'Jumla Ndogo',
    'total': 'Jumla Kuu',
    'search': 'Tafuta',
  },
  fr: {
    'search_placeholder': 'Rechercher parmi plus de 15 000 articles...',
    'deliver_to': 'Livrer à:',
    'all_departments': 'Tous les rayons',
    'todays_deals': 'Offres du jour',
    'fresh_produce': 'Produits frais',
    'electricals': 'Électroménager',
    'everyday_wear': 'Vêtements',
    'liquor_cellar': 'Cave à vin',
    'free_delivery_over': 'Livraison gratuite dès',
    'storefront': 'Boutique',
    'admin': 'Admin',
    'cart': 'Panier',
    'wishlist': 'Favoris',
    'account': 'Compte / Commandes',
    'language_currency': 'Langue et Devise',
    'hello_sign_in': 'Bonjour, Se connecter',
    'hello_customer': 'Bonjour, Client',
    'shop_by_category': 'Parcourir les rayons',
    'add_to_cart': 'Ajouter au panier',
    'quick_view': 'Aperçu rapide',
    'in_stock': 'En stock',
    'save': 'Économisez',
    'specs': 'Comparer les fiches',
    'checkout': 'Commander',
    'subtotal': 'Sous-total',
    'total': 'Total',
    'search': 'Rechercher',
  },
  de: {
    'search_placeholder': 'Über 15.000 Artikel durchsuchen...',
    'deliver_to': 'Liefern an:',
    'all_departments': 'Alle Kategorien',
    'todays_deals': 'Tagesangebote',
    'fresh_produce': 'Frische Produkte',
    'electricals': 'Elektronik',
    'everyday_wear': 'Kleidung',
    'liquor_cellar': 'Getränkemarkt',
    'free_delivery_over': 'Kostenlose Lieferung ab',
    'storefront': 'Geschäft',
    'admin': 'Admin',
    'cart': 'Warenkorb',
    'wishlist': 'Wunschliste',
    'account': 'Konto / Bestellungen',
    'language_currency': 'Sprache & Währung',
    'hello_sign_in': 'Hallo, Anmelden',
    'hello_customer': 'Hallo, Kunde',
    'shop_by_category': 'Kategorien durchsuchen',
    'add_to_cart': 'In den Warenkorb',
    'quick_view': 'Schnellansicht',
    'in_stock': 'Auf Lager',
    'save': 'Sparen',
    'specs': 'Vergleichen',
    'checkout': 'Zur Kasse',
    'subtotal': 'Zwischensumme',
    'total': 'Gesamtsumme',
    'search': 'Suchen',
  },
  es: {
    'search_placeholder': 'Buscar entre más de 15.000 productos...',
    'deliver_to': 'Enviar a:',
    'all_departments': 'Todas las secciones',
    'todays_deals': 'Ofertas de hoy',
    'fresh_produce': 'Productos frescos',
    'electricals': 'Electrodomésticos',
    'everyday_wear': 'Ropa cotidiana',
    'liquor_cellar': 'Bodega de licores',
    'free_delivery_over': 'Envío gratis a partir de',
    'storefront': 'Tienda',
    'admin': 'Administración',
    'cart': 'Carrito',
    'wishlist': 'Lista de deseos',
    'account': 'Cuenta / Pedidos',
    'language_currency': 'Idioma y Moneda',
    'hello_sign_in': 'Hola, Identifícate',
    'hello_customer': 'Hola, Cliente',
    'shop_by_category': 'Comprar por categoría',
    'add_to_cart': 'Añadir al carrito',
    'quick_view': 'Vista rápida',
    'in_stock': 'En stock',
    'save': 'Ahorra',
    'specs': 'Comparar',
    'checkout': 'Tramitar pedido',
    'subtotal': 'Subtotal',
    'total': 'Total',
    'search': 'Buscar',
  },
  ar: {
    'search_placeholder': 'ابحث في أكثر من 15,000 منتج...',
    'deliver_to': 'التوصيل إلى:',
    'all_departments': 'جميع الأقسام',
    'todays_deals': 'عروض اليوم',
    'fresh_produce': 'منتجات طازجة',
    'electricals': 'أجهزة إلكترونية',
    'everyday_wear': 'ملابس يومية',
    'liquor_cellar': 'قسم المشروبات',
    'free_delivery_over': 'توصيل مجاني لأكثر من',
    'storefront': 'المتجر',
    'admin': 'الإدارة',
    'cart': 'سلة التسوق',
    'wishlist': 'قائمة الأمنيات',
    'account': 'الحساب / الطلبات',
    'language_currency': 'اللغة والعملة',
    'hello_sign_in': 'مرحباً، تسجيل الدخول',
    'hello_customer': 'مرحباً، العميل',
    'shop_by_category': 'التسوق حسب القسم',
    'add_to_cart': 'أضف إلى السلة',
    'quick_view': 'نظرة سريعة',
    'in_stock': 'متوفر',
    'save': 'وفر',
    'specs': 'مقارنة المواصفات',
    'checkout': 'متابعة الشراء',
    'subtotal': 'المجموع الفرعي',
    'total': 'الإجمالي',
    'search': 'بحث',
  },
  hi: {
    'search_placeholder': '15,000+ उत्पादों में खोजें...',
    'deliver_to': 'डिलिवरी पता:',
    'all_departments': 'सभी विभाग',
    'todays_deals': 'आज के ऑफ़र',
    'fresh_produce': 'ताजा फल और सब्जियां',
    'electricals': 'इलेक्ट्रॉनिक्स',
    'everyday_wear': 'कपड़े',
    'liquor_cellar': 'पेय पदार्थ',
    'free_delivery_over': 'निःशुल्क डिलीवरी से अधिक पर',
    'storefront': 'स्टोर',
    'admin': 'एडमिन',
    'cart': 'कार्ट',
    'wishlist': 'विशलिस्ट',
    'account': 'खाता / ऑर्डर',
    'language_currency': 'भाषा और मुद्रा',
    'hello_sign_in': 'नमस्ते, साइन इन करें',
    'hello_customer': 'नमस्ते, ग्राहक',
    'shop_by_category': 'श्रेणी अनुसार खरीदें',
    'add_to_cart': 'कार्ट में जोड़ें',
    'quick_view': 'त्वरित देखें',
    'in_stock': 'स्टॉक में उपलब्ध',
    'save': 'बचत',
    'specs': 'तुलना करें',
    'checkout': 'चेकआउट करें',
    'subtotal': 'उप-योग',
    'total': 'कुल योग',
    'search': 'खोजें',
  },
  'zh-CN': {
    'search_placeholder': '搜索超過 15,000+ 種商品...',
    'deliver_to': '配送至：',
    'all_departments': '所有部門',
    'todays_deals': '今日特惠',
    'fresh_produce': '生鮮果蔬',
    'electricals': '家用電器',
    'everyday_wear': '日常服飾',
    'liquor_cellar': '酒類專區',
    'free_delivery_over': '滿額包郵：',
    'storefront': '商店首頁',
    'admin': '管理後臺',
    'cart': '購物車',
    'wishlist': '收藏夾',
    'account': '個人中心 / 訂單',
    'language_currency': '語言與貨幣',
    'hello_sign_in': '您好，請登錄',
    'hello_customer': '您好，尊貴顧客',
    'shop_by_category': '按分類瀏覽',
    'add_to_cart': '加入購物車',
    'quick_view': '快速預覽',
    'in_stock': '有現貨',
    'save': '立省',
    'specs': '對比規格',
    'checkout': '去結算',
    'subtotal': '小計',
    'total': '總計',
    'search': '搜索',
  }
};

let currentLangCode = (() => {
  try {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) return match[1];
    return localStorage.getItem('kipchimatt_lang') || 'en';
  } catch (e) {
    return 'en';
  }
})();

export function getGlobalLang(): string {
  return currentLangCode;
}

export function setGlobalLang(langCode: string) {
  currentLangCode = langCode;
  try {
    localStorage.setItem('kipchimatt_lang', langCode);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('lang-changed', { detail: langCode }));
  }
}

export function applyGoogleTranslate(langCode: string) {
  setGlobalLang(langCode);

  try {
    // Set cookies for root path and host
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;

    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event('change'));
      selectEl.dispatchEvent(new Event('input'));
    } else {
      // Fallback: If translate widget isn't fully ready, reload so cookie translates whole page on boot
      setTimeout(() => {
        const retryEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (retryEl) {
          retryEl.value = langCode;
          retryEl.dispatchEvent(new Event('change'));
          retryEl.dispatchEvent(new Event('input'));
        } else {
          window.location.reload();
        }
      }, 300);
    }
  } catch (e) {
    window.location.reload();
  }
}

export function t(key: string, overrideLang?: string): string {
  const lang = overrideLang || currentLangCode || 'en';
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  return dict[key] || TRANSLATIONS['en'][key] || key;
}
