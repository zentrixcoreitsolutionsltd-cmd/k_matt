export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  image: string;
  description?: string;
  specifications?: Record<string, string>;
  rating: number;
  ratingCount?: number;
  reviews?: Review[];
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  county: string;
  points?: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: Customer;
  payment: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  date: string;
  receiptNo?: string;
  transactionRef?: string;
  discountAmount?: number;
  couponCode?: string;
  deliveryType?: 'express' | 'pickup';
  pickupBranch?: string;
  vatAmount?: number;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  adminEmailForNotifications?: string;
  lowStockEmailEnabled?: boolean;
  lowStockThreshold: number;
}

export interface CategoryMeta {
  key: string;
  label: string;
  icon: string;
  image?: string;
}
