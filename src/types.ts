export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Branch {
  id: string;
  name: string;
  town: string;
  county: string;
  address: string;
  phone: string;
  isMain?: boolean;
  lat?: number;
  lng?: number;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  branchId?: string; // Primary branch assignment if applicable
  branchStock?: Record<string, number>; // Maps branchId -> stock count
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
  password?: string;
  isVerified?: boolean;
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
  pointsRedeemed?: number;
  couponCode?: string;
  deliveryType?: 'express' | 'pickup';
  pickupBranch?: string;
  branchId?: string;
  branchName?: string;
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
  cardColorTheme?: 'category' | 'plum' | 'emerald' | 'amber' | 'sapphire' | 'midnight';
}

export interface CategoryMeta {
  key: string;
  label: string;
  icon: string;
  image?: string;
}

export type AdminRole = 'super_admin' | 'inventory_manager' | 'order_manager' | 'auditor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  pin: string;
  avatar?: string;
  lastLogin?: string;
  active: boolean;
  department?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  category: 'products' | 'orders' | 'settings' | 'admins' | 'inventory' | 'auth';
  details: string;
  targetId?: string | number;
  ipAddress?: string;
}
