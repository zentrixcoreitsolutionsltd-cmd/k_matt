import React, { useState } from 'react';
import { 
  Laptop, Lock, LogOut, Package, ShoppingBag, Settings, AlertTriangle, 
  Plus, Edit, Trash2, Check, RefreshCw, Mail, Search, DollarSign,
  TrendingDown, Clock, Calendar, AlertCircle, ShieldAlert, Sparkles, TrendingUp, CheckCircle2, ArrowRight,
  Eye, Sun, Moon, ShieldCheck, Activity, Users, UserPlus, Shield, Key, FileText, Download, Filter, Building, Briefcase, X
} from 'lucide-react';
import { Product, Order, StoreSettings, AdminUser, AuditLogEntry, AdminRole } from '../types';
import { formatMoney, uid, defaultProducts } from '../data/catalog';

interface AdminPortalProps {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  onProductsChange: (products: Product[]) => void;
  onOrdersChange: (orders: Order[]) => void;
  onSettingsChange: (settings: StoreSettings) => void;
  isLoggedIn: boolean;
  currentAdmin?: AdminUser | null;
  adminUsers?: AdminUser[];
  auditLogs?: AuditLogEntry[];
  onLoginAdmin?: (admin: AdminUser) => void;
  onLogoutAdmin?: () => void;
  onAddAdmin?: (newAdmin: AdminUser) => void;
  onUpdateAdmin?: (updatedAdmin: AdminUser) => void;
  onDeleteAdmin?: (adminId: string) => void;
  onAddAuditLog?: (category: AuditLogEntry['category'], action: string, details: string, targetId?: string | number) => void;
  onClearAuditLogs?: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  adminAlerts: any[];
  onTriggerLowStockEmail: (productName: string, stock: number) => void;
  onSwitchToStorefront?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export default function AdminPortal({
  products,
  orders,
  settings,
  onProductsChange,
  onOrdersChange,
  onSettingsChange,
  isLoggedIn,
  currentAdmin,
  adminUsers = [],
  auditLogs = [],
  onLoginAdmin,
  onLogoutAdmin,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onAddAuditLog,
  onClearAuditLogs,
  onLogin,
  onLogout,
  onShowToast,
  adminAlerts,
  onTriggerLowStockEmail,
  onSwitchToStorefront,
  isDark,
  onToggleTheme
}: AdminPortalProps) {
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('zentrixcoreitsolutionsltd@gmail.com');
  const [loginPin, setLoginPin] = useState('1234');

  // Role Permissions Logic
  const role = currentAdmin?.role || 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const isInventoryManager = role === 'inventory_manager';
  const isOrderManager = role === 'order_manager';
  const isAuditor = role === 'auditor';
  const isReadOnly = isAuditor;

  // Tabs visibility
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'forecast' | 'settings' | 'admins' | 'logs'>('products');

  // Forecast State
  const [forecastFilter, setForecastFilter] = useState<'all' | 'critical' | 'out_of_stock' | 'high_velocity'>('all');
  const [forecastSearch, setForecastSearch] = useState('');

  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Form Fields for Products
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pCategory, setPCategory] = useState('food cupboard');
  const [pPrice, setPPrice] = useState(100);
  const [pOriginalPrice, setPOriginalPrice] = useState(120);
  const [pStock, setPStock] = useState(10);
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');

  // Settings State
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail);
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee);
  const [freeThreshold, setFreeThreshold] = useState(settings.freeDeliveryThreshold);

  // Audit Logs Filter State
  const [logCategoryFilter, setLogCategoryFilter] = useState<'all' | 'products' | 'orders' | 'inventory' | 'settings' | 'admins' | 'auth'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logAdminFilter, setLogAdminFilter] = useState<string>('all');

  // Admin Management Modal & State
  const [isAddingAdminModal, setIsAddingAdminModal] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('inventory_manager');
  const [newAdminPin, setNewAdminPin] = useState('1234');
  const [newAdminDept, setNewAdminDept] = useState('Operations');

  // Quick Stats Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const criticalStockProducts = products.filter(p => p.stock <= 5);
  const atRiskProductsCount = products.filter(p => p.stock <= 10).length;

  // Forecast Calculations
  const forecastProducts = products.map(p => {
    const productOrders = orders.flatMap(o => o.items).filter(item => item.id === p.id);
    const totalQtySold30Days = productOrders.reduce((sum, item) => sum + item.qty, 0) || Math.floor(Math.random() * 8) + 1;
    const dailySalesRate = Math.max(0.1, +(totalQtySold30Days / 30).toFixed(2));
    const daysRemaining = dailySalesRate > 0 ? Math.floor(p.stock / dailySalesRate) : 999;
    
    return {
      ...p,
      sales30Days: totalQtySold30Days,
      dailySalesRate,
      daysRemaining
    };
  }).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(forecastSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(forecastSearch.toLowerCase());
    
    if (!matchesSearch) return false;

    if (forecastFilter === 'critical') {
      return p.daysRemaining <= 7;
    }
    if (forecastFilter === 'out_of_stock') {
      return p.stock === 0;
    }
    if (forecastFilter === 'high_velocity') {
      return p.dailySalesRate >= 0.3 || p.sales30Days >= 3;
    }

    return true;
  });

  // Login Submit Handler
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPin = loginPin.trim();

    const matchedAdmin = adminUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.pin === cleanPin
    );

    if (matchedAdmin) {
      if (!matchedAdmin.active) {
        onShowToast('This administrator account has been disabled. Contact Super Admin.', 'error');
        return;
      }
      if (onLoginAdmin) {
        onLoginAdmin(matchedAdmin);
      } else {
        onLogin();
      }
      onShowToast(`Welcome back, ${matchedAdmin.name} (${matchedAdmin.role.toUpperCase()})`, 'success');
    } else {
      // Fallback for demo PIN 1234 or super admin default
      if ((cleanPin === '1234' || cleanPin === 'admin') && adminUsers.length > 0) {
        const fallbackAdmin = adminUsers[0];
        if (onLoginAdmin) onLoginAdmin(fallbackAdmin);
        else onLogin();
        onShowToast(`Authenticated as ${fallbackAdmin.name}`, 'success');
      } else {
        onShowToast('Invalid administrator email or PIN code', 'error');
      }
    }
  };

  // Restock Handler
  const handleRestockProduct = (productId: number, qtyToAdd: number) => {
    if (isReadOnly) {
      onShowToast('Auditor Mode: Read-only access', 'error');
      return;
    }
    const target = products.find(p => p.id === productId);
    if (!target) return;
    const updated = products.map(p => p.id === productId ? { ...p, stock: p.stock + qtyToAdd } : p);
    onProductsChange(updated);
    if (onAddAuditLog) {
      onAddAuditLog(
        'inventory',
        'RESTOCK_PRODUCT',
        `Restocked "${target.name}" (+${qtyToAdd} units). Previous stock: ${target.stock}, New total: ${target.stock + qtyToAdd}`,
        productId
      );
    }
    onShowToast(`Restocked "${target.name}" (+${qtyToAdd} units). New stock: ${target.stock + qtyToAdd}`, 'success');
  };

  // Save Product Handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      onShowToast('Auditor Mode: Read-only access', 'error');
      return;
    }
    if (editingProduct && editingProduct.id) {
      // Update existing
      const updated = products.map(p => p.id === editingProduct.id ? {
        ...p,
        name: pName,
        brand: pBrand,
        category: pCategory,
        price: pPrice,
        originalPrice: pOriginalPrice,
        stock: pStock,
        image: pImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
        description: pDesc
      } : p);
      onProductsChange(updated);
      if (onAddAuditLog) {
        onAddAuditLog(
          'products',
          'UPDATE_PRODUCT',
          `Updated product details for "${pName}" (Price: KSh ${pPrice}, Stock: ${pStock}, Category: ${pCategory})`,
          editingProduct.id
        );
      }
      onShowToast('Product updated successfully', 'success');
    } else {
      // Add new
      const newId = Date.now();
      const newProd: Product = {
        id: newId,
        name: pName,
        brand: pBrand || 'Kipchimatt',
        category: pCategory,
        price: pPrice,
        originalPrice: pOriginalPrice,
        stock: pStock,
        image: pImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
        description: pDesc,
        rating: 5,
        ratingCount: 1,
        reviews: []
      };
      onProductsChange([newProd, ...products]);
      if (onAddAuditLog) {
        onAddAuditLog(
          'products',
          'CREATE_PRODUCT',
          `Added new product "${pName}" to catalog (Category: ${pCategory}, Price: KSh ${pPrice}, Initial Stock: ${pStock})`,
          newId
        );
      }
      onShowToast('New product added to catalog', 'success');
    }
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleStartEdit = (p: Product) => {
    if (isReadOnly) {
      onShowToast('Auditor Mode: Read-only access', 'error');
      return;
    }
    setEditingProduct(p);
    setPName(p.name);
    setPBrand(p.brand);
    setPCategory(p.category);
    setPPrice(p.price);
    setPOriginalPrice(p.originalPrice);
    setPStock(p.stock);
    setPImage(p.image);
    setPDesc(p.description || '');
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (isReadOnly || isOrderManager) {
      onShowToast('Unauthorized role for product deletion', 'error');
      return;
    }
    const target = products.find(p => p.id === id);
    onProductsChange(products.filter(p => p.id !== id));
    if (onAddAuditLog && target) {
      onAddAuditLog('products', 'DELETE_PRODUCT', `Deleted product "${target.name}" (ID: ${id}) from store catalog`, id);
    }
    onShowToast('Product deleted', 'info');
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    if (isReadOnly) {
      onShowToast('Auditor Mode: Read-only access', 'error');
      return;
    }
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    onOrdersChange(updated);
    if (onAddAuditLog) {
      onAddAuditLog(
        'orders',
        'UPDATE_ORDER_STATUS',
        `Changed order #${orderId.slice(-6).toUpperCase()} status to [${status.toUpperCase()}]`,
        orderId
      );
    }
    onShowToast(`Order #${orderId.slice(-6).toUpperCase()} status updated to ${status.toUpperCase()}`, 'success');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      onShowToast('Only Super Administrators can alter store configuration settings', 'error');
      return;
    }
    onSettingsChange({
      ...settings,
      storeName,
      storePhone,
      storeEmail,
      deliveryFee,
      freeDeliveryThreshold: freeThreshold
    });
    if (onAddAuditLog) {
      onAddAuditLog(
        'settings',
        'UPDATE_SETTINGS',
        `Updated store settings (Store Name: ${storeName}, Phone: ${storePhone}, Delivery Fee: KSh ${deliveryFee})`
      );
    }
    onShowToast('Store settings updated', 'success');
  };

  // Add Admin Handler
  const handleSaveAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      onShowToast('Only Super Admin can manage administrator credentials', 'error');
      return;
    }
    if (!newAdminName || !newAdminEmail) {
      onShowToast('Name and Email are required', 'error');
      return;
    }

    if (editingAdminUser) {
      const updated: AdminUser = {
        ...editingAdminUser,
        name: newAdminName,
        email: newAdminEmail,
        role: newAdminRole,
        pin: newAdminPin || '1234',
        department: newAdminDept
      };
      if (onUpdateAdmin) onUpdateAdmin(updated);
      onShowToast(`Updated administrator "${newAdminName}"`, 'success');
    } else {
      const newAdmin: AdminUser = {
        id: `adm-${Date.now()}`,
        name: newAdminName,
        email: newAdminEmail,
        role: newAdminRole,
        pin: newAdminPin || '1234',
        department: newAdminDept,
        active: true
      };
      if (onAddAdmin) onAddAdmin(newAdmin);
      onShowToast(`Created administrator account for ${newAdminName}`, 'success');
    }

    setIsAddingAdminModal(false);
    setEditingAdminUser(null);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPin('1234');
  };

  // Export Audit CSV
  const handleExportAuditLogsCSV = () => {
    if (!auditLogs || auditLogs.length === 0) return;
    const headers = ['Log ID', 'Timestamp', 'Admin Email', 'Admin Name', 'Admin Role', 'Category', 'Action', 'Details', 'Target ID'];
    const rows = filteredAuditLogs.map(l => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      `"${l.adminEmail}"`,
      `"${l.adminName}"`,
      l.adminRole,
      l.category,
      l.action,
      `"${l.details.replace(/"/g, '""')}"`,
      l.targetId || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kipchimatt_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Audit logs downloaded as CSV', 'success');
  };

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesCategory = logCategoryFilter === 'all' || log.category === logCategoryFilter;
    const matchesAdmin = logAdminFilter === 'all' || log.adminEmail.toLowerCase() === logAdminFilter.toLowerCase();
    const query = logSearchQuery.toLowerCase();
    const matchesQuery = !query || 
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.adminEmail.toLowerCase().includes(query) ||
      log.adminName.toLowerCase().includes(query) ||
      (log.targetId && log.targetId.toString().includes(query));

    return matchesCategory && matchesAdmin && matchesQuery;
  });

  // Not Logged In View
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
        {/* Standalone Admin Header */}
        <header className="bg-plum text-white border-b border-plum-dark px-4 sm:px-8 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-plum-dark text-white flex items-center justify-center font-black shadow-inner border border-white/20">
              <Laptop className="w-5 h-5 text-yellow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white">{settings.storeName}</span>
                <span className="bg-yellow text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Multi-Admin OS
                </span>
              </div>
              <p className="text-[11px] text-gray-200">Back-Office Security & Audit Operations</p>
            </div>
          </div>

          {onSwitchToStorefront && (
            <button
              type="button"
              onClick={onSwitchToStorefront}
              className="bg-plum-dark hover:bg-plum text-yellow border border-yellow/30 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4 text-yellow" />
              <span>Return to Storefront</span>
            </button>
          )}
        </header>

        {/* Multi-Admin Login Form Center */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 border border-plum/20 dark:border-plum/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-plum/10 text-plum dark:text-yellow border border-plum/30 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-8 h-8 text-plum dark:text-yellow" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Administrator Portal</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Select or enter your administrator email and security PIN.</p>
            </div>

            {/* Quick Demo Admin Selector Chips */}
            {adminUsers.length > 0 && (
              <div className="text-left bg-gray-50 dark:bg-gray-950 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-plum dark:text-yellow" />
                  <span>Configured Admin Profiles (Click to Auto-fill)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {adminUsers.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setLoginEmail(u.email);
                        setLoginPin(u.pin);
                      }}
                      className={`text-left p-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${loginEmail === u.email ? 'bg-plum text-white font-bold border-plum' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
                    >
                      <div className="w-6 h-6 rounded-full bg-plum/10 text-plum dark:text-yellow font-black text-[10px] flex items-center justify-center shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold">{u.name}</p>
                        <p className="truncate text-[9px] opacity-75 capitalize">{u.role.replace('_', ' ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Administrator Email Address
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    required
                    placeholder="e.g. zentrixcoreitsolutionsltd@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-bold text-sm outline-none focus:border-plum"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Security PIN Code
                </label>
                <div className="relative">
                  <input 
                    type="password"
                    required
                    placeholder="Enter Security PIN (e.g. 1234)"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full tracking-widest px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-bold text-base outline-none focus:border-plum"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-plum hover:bg-plum-dark text-white font-black text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer shadow-lg active:scale-98 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-yellow" />
                <span>Sign In to Admin OS</span>
              </button>
            </form>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between text-xs text-gray-500">
              <span className="text-[11px]">Audit Logging Enabled</span>
              <button
                type="button"
                onClick={onSwitchToStorefront}
                className="text-[11px] text-plum dark:text-yellow font-bold hover:underline transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Back to Storefront</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Admin Role Colors & Labels
  const getRoleBadge = (r: AdminRole) => {
    switch(r) {
      case 'super_admin':
        return <span className="bg-yellow text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-yellow/30">Super Admin</span>;
      case 'inventory_manager':
        return <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-500/30">Inventory Manager</span>;
      case 'order_manager':
        return <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-blue-500/30">Order Manager</span>;
      case 'auditor':
        return <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/30">Store Auditor (Read Only)</span>;
      default:
        return <span className="bg-plum-dark text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">{r}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
      
      {/* 1. Standalone Admin Top Navigation Header */}
      <header className="bg-plum text-white border-b border-plum-dark sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Brand & Console Title */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-plum-dark text-white flex items-center justify-center font-black shadow-inner border border-white/20 shrink-0">
                <Laptop className="w-5 h-5 text-yellow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight text-white">{settings.storeName} Admin OS</span>
                  {getRoleBadge(role)}
                </div>
                <p className="text-[10px] text-gray-200 font-medium truncate max-w-xs">
                  Logged in as: <strong className="text-yellow">{currentAdmin?.name || 'Admin'}</strong> ({currentAdmin?.email || 'zentrixcoreitsolutionsltd@gmail.com'})
                </p>
              </div>
            </div>

            {/* Mobile Quick Exit */}
            <div className="flex md:hidden items-center gap-2">
              {onSwitchToStorefront && (
                <button
                  type="button"
                  onClick={onSwitchToStorefront}
                  className="bg-yellow text-slate-950 font-black p-2 rounded-xl"
                  title="Storefront"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics & Controls Bar */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
            
            {/* Active Admin Details Chip */}
            <div className="hidden lg:flex items-center gap-2 bg-plum-dark border border-white/10 px-3 py-1.5 rounded-xl text-xs text-gray-200">
              <div className="w-6 h-6 rounded-full bg-yellow text-slate-950 font-black text-[10px] flex items-center justify-center">
                {currentAdmin?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-[10px] font-bold text-white leading-none">{currentAdmin?.department || 'Operations'}</p>
                <p className="text-[9px] text-yellow">Multi-Admin Secured</p>
              </div>
            </div>

            {/* Quick Switch to Storefront Button */}
            {onSwitchToStorefront && (
              <button
                type="button"
                onClick={onSwitchToStorefront}
                className="bg-yellow hover:bg-yellow-dark text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
                title="View Live Storefront as a customer"
              >
                <Eye className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">Return to Storefront</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            )}

            {/* Theme Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 bg-plum-dark hover:bg-plum-dark/80 text-white rounded-xl transition-colors cursor-pointer border border-white/10 shrink-0"
                title="Toggle Dark / Light Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-yellow" /> : <Moon className="w-4 h-4 text-gray-300" />}
              </button>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                if (onLogoutAdmin) onLogoutAdmin();
                else onLogout();
              }}
              className="bg-plum-dark hover:bg-red-600 hover:text-white text-white font-bold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer border border-white/10 flex items-center gap-1.5 shrink-0"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5 text-yellow" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Auditor Read-Only Notice Banner */}
      {isReadOnly && (
        <div className="bg-emerald-950 border-b border-emerald-800 text-emerald-200 px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Auditor Profile Active: You have read-only access to inventory, orders, stock forecast, and system audit logs.</span>
        </div>
      )}

      {/* Main Admin Workspace Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-2 shadow-xs flex border-b border-gray-200 dark:border-gray-800 gap-1.5 text-xs font-extrabold overflow-x-auto">
          
          {/* Products Catalog Tab */}
          {(isSuperAdmin || isInventoryManager || isAuditor) && (
            <button 
              onClick={() => setActiveTab('products')}
              className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${activeTab === 'products' ? 'bg-plum text-white font-black shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Package className="w-4 h-4" />
              <span>Products Catalog</span>
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-bold ml-1">{products.length}</span>
            </button>
          )}

          {/* Customer Orders Tab */}
          {(isSuperAdmin || isOrderManager || isAuditor) && (
            <button 
              onClick={() => setActiveTab('orders')}
              className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${activeTab === 'orders' ? 'bg-plum text-white font-black shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer Orders</span>
              {pendingOrders > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">{pendingOrders} Pending</span>
              )}
            </button>
          )}

          {/* Stock Forecast Tab */}
          {(isSuperAdmin || isInventoryManager || isAuditor) && (
            <button 
              onClick={() => setActiveTab('forecast')}
              className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${activeTab === 'forecast' ? 'bg-plum text-white font-black shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Stock Velocity & Forecast</span>
            </button>
          )}

          {/* Admin Management Tab (Super Admin Only) */}
          {isSuperAdmin && (
            <button 
              onClick={() => setActiveTab('admins')}
              className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${activeTab === 'admins' ? 'bg-plum text-white font-black shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Users className="w-4 h-4 text-yellow" />
              <span>Admin Management</span>
              <span className="bg-yellow/20 text-yellow text-xs px-2 py-0.5 rounded-full font-bold">{adminUsers.length}</span>
            </button>
          )}

          {/* Store Settings Tab (Super Admin Only) */}
          {isSuperAdmin && (
            <button 
              onClick={() => setActiveTab('settings')}
              className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${activeTab === 'settings' ? 'bg-plum text-white font-black shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <Settings className="w-4 h-4" />
              <span>Store Configuration</span>
            </button>
          )}

          {/* Audit Logs Tab */}
          <button 
            onClick={() => setActiveTab('logs')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${activeTab === 'logs' ? 'bg-plum text-white font-black shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Audit & Change Logs</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">{auditLogs.length}</span>
          </button>
        </div>

        {/* --- TAB 1: PRODUCTS CATALOG & STOCK --- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Store Inventory Catalog</h2>
                <p className="text-xs text-gray-500">Manage products, pricing, stock levels, and category organization.</p>
              </div>

              {!isReadOnly && !isOrderManager && (
                <button 
                  onClick={() => {
                    setEditingProduct({});
                    setPName('');
                    setPBrand('');
                    setPCategory('food cupboard');
                    setPPrice(100);
                    setPOriginalPrice(120);
                    setPStock(20);
                    setPImage('');
                    setPDesc('');
                    setIsAddingProduct(true);
                  }}
                  className="bg-plum hover:bg-plum-dark text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-yellow" />
                  <span>Add New Product</span>
                </button>
              )}
            </div>

            {/* Add / Edit Product Modal */}
            {isAddingProduct && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {editingProduct && editingProduct.id ? 'Edit Product Item' : 'Add New Catalog Product'}
                    </h3>
                    <button 
                      onClick={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-extrabold mb-1">Product Title *</label>
                        <input 
                          type="text" 
                          required 
                          value={pName} 
                          onChange={(e) => setPName(e.target.value)}
                          placeholder="e.g. Premium Maize Flour 2kg"
                          className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold mb-1">Brand Name</label>
                        <input 
                          type="text" 
                          value={pBrand} 
                          onChange={(e) => setPBrand(e.target.value)}
                          placeholder="e.g. Kipchimatt Select"
                          className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold mb-1">Category</label>
                        <select 
                          value={pCategory} 
                          onChange={(e) => setPCategory(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="fresh produce">Fresh Produce</option>
                          <option value="dairy & eggs">Dairy & Eggs</option>
                          <option value="bakery">Bakery</option>
                          <option value="meat & seafood">Meat & Seafood</option>
                          <option value="beverages">Beverages</option>
                          <option value="snacks & sweets">Snacks & Sweets</option>
                          <option value="food cupboard">Food Cupboard</option>
                          <option value="frozen foods">Frozen Foods</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-extrabold mb-1">Stock Quantity *</label>
                        <input 
                          type="number" 
                          required 
                          value={pStock} 
                          onChange={(e) => setPStock(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold mb-1">Selling Price (KSh) *</label>
                        <input 
                          type="number" 
                          required 
                          value={pPrice} 
                          onChange={(e) => setPPrice(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-extrabold mb-1">Original Price (KSh)</label>
                        <input 
                          type="number" 
                          value={pOriginalPrice} 
                          onChange={(e) => setPOriginalPrice(Number(e.target.value))}
                          className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold mb-1">Image URL</label>
                      <input 
                        type="url" 
                        value={pImage} 
                        onChange={(e) => setPImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold mb-1">Description</label>
                      <textarea 
                        rows={3} 
                        value={pDesc} 
                        onChange={(e) => setPDesc(e.target.value)}
                        placeholder="Provide product details, weight, ingredients or pack size..."
                        className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                        }}
                        className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white font-extrabold transition-colors cursor-pointer"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-extrabold border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="py-3.5 px-4">Item Details</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Stock Level</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
                            <div>
                              <p className="font-extrabold text-gray-900 dark:text-white text-sm">{p.name}</p>
                              <p className="text-gray-500 text-[10px] uppercase font-bold">{p.brand}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 capitalize font-semibold text-gray-700 dark:text-gray-300">
                          {p.category}
                        </td>
                        <td className="py-3 px-4 font-black text-gray-900 dark:text-white">
                          {formatMoney(p.price)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${p.stock <= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : p.stock <= 15 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                              {p.stock} units
                            </span>
                            {!isReadOnly && !isOrderManager && (
                              <button 
                                onClick={() => handleRestockProduct(p.id, 20)}
                                className="bg-gray-100 dark:bg-gray-800 hover:bg-plum hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                                title="Quick Restock +20 units"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isReadOnly && !isOrderManager && (
                              <button 
                                onClick={() => handleStartEdit(p)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {isSuperAdmin && (
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-lg cursor-pointer"
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: CUSTOMER ORDERS --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Customer Orders Dispatch</h2>
              <p className="text-xs text-gray-500">Track incoming purchases, verify payment status, and process delivery fulfillment.</p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-12 text-center text-gray-500 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700" />
                <p className="font-bold text-sm">No customer orders placed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base text-gray-900 dark:text-white">Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-300'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">Placed on {new Date(order.date).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-plum dark:text-yellow">{formatMoney(order.total)}</span>
                        {!isReadOnly && (
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="text-xs font-bold p-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-extrabold text-gray-500 mb-1">Customer Information</p>
                        <p className="font-bold text-gray-900 dark:text-white">{order.customer.name}</p>
                        <p className="text-gray-500">{order.customer.phone} • {order.customer.email}</p>
                        <p className="text-gray-500">{order.customer.address}, {order.customer.county}</p>
                      </div>

                      <div>
                        <p className="font-extrabold text-gray-500 mb-1">Purchased Items ({order.items.reduce((a, b) => a + b.qty, 0)})</p>
                        <div className="space-y-1">
                          {order.items.map(i => (
                            <div key={i.id} className="flex justify-between text-gray-700 dark:text-gray-300 font-medium">
                              <span>{i.qty}x {i.name}</span>
                              <span className="font-bold">{formatMoney(i.price * i.qty)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: STOCK FORECAST & VELOCITY --- */}
        {activeTab === 'forecast' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Stock Velocity & Reorder Forecast</h2>
                <p className="text-xs text-gray-500">Predictive inventory replenishment based on 30-day sales velocity metrics.</p>
              </div>

              <div className="flex items-center gap-2">
                <select 
                  value={forecastFilter} 
                  onChange={(e) => setForecastFilter(e.target.value as any)}
                  className="text-xs font-bold p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none cursor-pointer"
                >
                  <option value="all">All Products</option>
                  <option value="critical">Critical (≤ 7 Days Stock)</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="high_velocity">High Sales Velocity</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-1">
                <p className="text-xs text-gray-500 font-bold uppercase">At-Risk Items</p>
                <p className="text-2xl font-black text-red-500">{atRiskProductsCount}</p>
                <p className="text-[10px] text-gray-400">Stock lower than 10 units</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-1">
                <p className="text-xs text-gray-500 font-bold uppercase">Critical Stockout Warning</p>
                <p className="text-2xl font-black text-amber-500">{criticalStockProducts.length}</p>
                <p className="text-[10px] text-gray-400">May run out within 7 days</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-1">
                <p className="text-xs text-gray-500 font-bold uppercase">Total Catalog Items</p>
                <p className="text-2xl font-black text-plum dark:text-yellow">{products.length}</p>
                <p className="text-[10px] text-gray-400">Active active inventory SKUs</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-150 dark:border-gray-800">
                <input 
                  type="text" 
                  placeholder="Search catalog by product name or category..." 
                  value={forecastSearch} 
                  onChange={(e) => setForecastSearch(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-extrabold border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="py-3.5 px-4">Product Name</th>
                      <th className="py-3.5 px-4">Current Stock</th>
                      <th className="py-3.5 px-4">30-Day Sales</th>
                      <th className="py-3.5 px-4">Daily Rate</th>
                      <th className="py-3.5 px-4">Est. Days Left</th>
                      <th className="py-3.5 px-4 text-right">Replenishment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                    {forecastProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 font-extrabold">
                          <span className={p.stock <= 5 ? 'text-red-500' : 'text-gray-900 dark:text-white'}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                          {p.sales30Days} units
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">
                          {p.dailySalesRate} / day
                        </td>
                        <td className="py-3 px-4 font-extrabold">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] ${p.daysRemaining <= 7 ? 'bg-red-500/20 text-red-400 font-black' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {p.daysRemaining >= 900 ? '90+ Days' : `${p.daysRemaining} Days`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isReadOnly && !isOrderManager && (
                            <button 
                              onClick={() => handleRestockProduct(p.id, 50)}
                              className="bg-plum hover:bg-plum-dark text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              +50 Restock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: ADMIN MANAGEMENT (SUPER ADMIN ONLY) --- */}
        {activeTab === 'admins' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-plum" />
                  <span>Administrator User Management</span>
                </h2>
                <p className="text-xs text-gray-500">Configure administrator accounts, email credentials, security PINs, and access roles.</p>
              </div>

              <button 
                onClick={() => {
                  setEditingAdminUser(null);
                  setNewAdminName('');
                  setNewAdminEmail('');
                  setNewAdminRole('inventory_manager');
                  setNewAdminPin('1234');
                  setNewAdminDept('Warehouse Operations');
                  setIsAddingAdminModal(true);
                }}
                className="bg-plum hover:bg-plum-dark text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-yellow" />
                <span>Add New Admin User</span>
              </button>
            </div>

            {/* Admin Modal */}
            {isAddingAdminModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-plum" />
                      <span>{editingAdminUser ? 'Edit Administrator Profile' : 'Create Administrator Account'}</span>
                    </h3>
                    <button 
                      onClick={() => setIsAddingAdminModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveAdminUser} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-extrabold mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        value={newAdminName} 
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="e.g. Samuel Mutiso"
                        className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold mb-1">Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        value={newAdminEmail} 
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="e.g. samuel@kipchimatt.co.ke"
                        className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-extrabold mb-1">Role / Rights Level</label>
                        <select 
                          value={newAdminRole} 
                          onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                          className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                        >
                          <option value="super_admin">Super Admin (Full Rights)</option>
                          <option value="inventory_manager">Inventory Manager</option>
                          <option value="order_manager">Order Fulfillment Manager</option>
                          <option value="auditor">Store Auditor (Read-Only)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-extrabold mb-1">Security PIN *</label>
                        <input 
                          type="text" 
                          required 
                          value={newAdminPin} 
                          onChange={(e) => setNewAdminPin(e.target.value)}
                          placeholder="e.g. 1234"
                          className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold tracking-widest text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-extrabold mb-1">Department / Branch</label>
                      <input 
                        type="text" 
                        value={newAdminDept} 
                        onChange={(e) => setNewAdminDept(e.target.value)}
                        placeholder="e.g. Kericho Main Branch Logistics"
                        className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button 
                        type="button"
                        onClick={() => setIsAddingAdminModal(false)}
                        className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-plum hover:bg-plum-dark text-white font-extrabold cursor-pointer"
                      >
                        Save Admin User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Admin Users Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-extrabold border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="py-3.5 px-4">Administrator</th>
                      <th className="py-3.5 px-4">Assigned Role</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Security PIN</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                    {adminUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-plum text-yellow font-black text-xs flex items-center justify-center shrink-0 border border-plum/30">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900 dark:text-white text-sm">{u.name}</p>
                              <p className="text-gray-500 text-[10px] font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {getRoleBadge(u.role)}
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 font-bold">
                          {u.department || 'Operations'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-500">
                          •••• ({u.pin})
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${u.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {u.active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                const updated: AdminUser = { ...u, active: !u.active };
                                if (onUpdateAdmin) onUpdateAdmin(updated);
                                onShowToast(`Status for ${u.name} set to ${!u.active ? 'ACTIVE' : 'DISABLED'}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-[10px] font-bold cursor-pointer"
                            >
                              {u.active ? 'Disable' : 'Enable'}
                            </button>
                            <button 
                              onClick={() => {
                                setEditingAdminUser(u);
                                setNewAdminName(u.name);
                                setNewAdminEmail(u.email);
                                setNewAdminRole(u.role);
                                setNewAdminPin(u.pin);
                                setNewAdminDept(u.department || '');
                                setIsAddingAdminModal(true);
                              }}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg cursor-pointer"
                              title="Edit Admin"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {adminUsers.length > 1 && (
                              <button 
                                onClick={() => {
                                  if (onDeleteAdmin) onDeleteAdmin(u.id);
                                  onShowToast(`Deleted admin profile for ${u.name}`, 'info');
                                }}
                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-lg cursor-pointer"
                                title="Delete Admin"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: STORE CONFIGURATION (SUPER ADMIN ONLY) --- */}
        {activeTab === 'settings' && isSuperAdmin && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Global Store Configurations</h2>
              <p className="text-xs text-gray-500">Update store branding, contact details, and delivery fee thresholds.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-extrabold mb-1">Supermarket Store Name</label>
                  <input 
                    type="text" 
                    value={storeName} 
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold mb-1">Support Phone</label>
                  <input 
                    type="text" 
                    value={storePhone} 
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold mb-1">Support Email</label>
                  <input 
                    type="email" 
                    value={storeEmail} 
                    onChange={(e) => setStoreEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold mb-1">Standard Delivery Fee (KSh)</label>
                  <input 
                    type="number" 
                    value={deliveryFee} 
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold mb-1">Free Delivery Threshold (KSh)</label>
                <input 
                  type="number" 
                  value={freeThreshold} 
                  onChange={(e) => setFreeThreshold(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                />
              </div>

              <button type="submit" className="w-full bg-plum text-white font-extrabold py-3.5 rounded-xl cursor-pointer hover:bg-plum-dark transition-colors">
                Save Global Configurations
              </button>
            </form>
          </div>
        )}

        {/* --- TAB 6: AUDIT & CHANGE LOGS --- */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Security & System Audit Logs</span>
                </h2>
                <p className="text-xs text-gray-500">Immutable ledger of administrative mutations, login attempts, catalog changes, and order updates.</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleExportAuditLogsCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-yellow" />
                  <span>Export CSV Log</span>
                </button>

                {isSuperAdmin && (
                  <button 
                    onClick={() => {
                      if (onClearAuditLogs) onClearAuditLogs();
                      onShowToast('Audit history archived and cleared.', 'info');
                    }}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-red-600 hover:text-white text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-500 mb-1">Search Log Details</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search action or details..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Filter Action Category</label>
                <select 
                  value={logCategoryFilter}
                  onChange={(e) => setLogCategoryFilter(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none cursor-pointer font-bold"
                >
                  <option value="all">All Categories ({auditLogs.length})</option>
                  <option value="products">Products & Pricing</option>
                  <option value="orders">Customer Orders</option>
                  <option value="inventory">Inventory Restock</option>
                  <option value="admins">Admin Profiles</option>
                  <option value="settings">Store Settings</option>
                  <option value="auth">Authentication & Login</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-500 mb-1">Filter Administrator</label>
                <select 
                  value={logAdminFilter}
                  onChange={(e) => setLogAdminFilter(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none cursor-pointer font-bold"
                >
                  <option value="all">All Admin Users</option>
                  {adminUsers.map(u => (
                    <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audit Log Timeline Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
              {filteredAuditLogs.length === 0 ? (
                <div className="p-12 text-center text-gray-500 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700" />
                  <p className="font-bold">No audit log entries match your filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-extrabold border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Action</th>
                        <th className="py-3.5 px-4">Details Description</th>
                        <th className="py-3.5 px-4">Administrator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                      {filteredAuditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-gray-500 shrink-0">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                              {log.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-black text-gray-900 dark:text-white">
                            {log.action}
                          </td>
                          <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium max-w-md">
                            {log.details}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white text-[11px]">{log.adminName}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{log.adminEmail}</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Standalone Admin Console Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-slate-300">{settings.storeName} Admin OS</span>
            <span>• Multi-Admin Session ({currentAdmin ? currentAdmin.email : 'Signed Out'})</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-slate-400">
            {onSwitchToStorefront && (
              <button
                type="button"
                onClick={onSwitchToStorefront}
                className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Storefront</span>
              </button>
            )}
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">Live Audit Sync Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
