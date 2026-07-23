import React, { useState } from 'react';
import { 
  Laptop, Lock, LogOut, Package, ShoppingBag, Settings, AlertTriangle, 
  Plus, Edit, Trash2, Check, RefreshCw, Mail, Search, DollarSign 
} from 'lucide-react';
import { Product, Order, StoreSettings } from '../types';
import { formatMoney, uid, defaultProducts } from '../data/catalog';

interface AdminPortalProps {
  products: Product[];
  orders: Order[];
  settings: StoreSettings;
  onProductsChange: (products: Product[]) => void;
  onOrdersChange: (orders: Order[]) => void;
  onSettingsChange: (settings: StoreSettings) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  adminAlerts: any[];
  onTriggerLowStockEmail: (productName: string, stock: number) => void;
}

export default function AdminPortal({
  products,
  orders,
  settings,
  onProductsChange,
  onOrdersChange,
  onSettingsChange,
  isLoggedIn,
  onLogin,
  onLogout,
  onShowToast,
  adminAlerts,
  onTriggerLowStockEmail
}: AdminPortalProps) {
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'alerts'>('products');
  
  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Form Fields
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pCategory, setPCategory] = useState('food cupboard');
  const [pPrice, setPPrice] = useState<number>(100);
  const [pOriginalPrice, setPOriginalPrice] = useState<number>(120);
  const [pStock, setPStock] = useState<number>(10);
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');

  // Settings local state
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail);
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee);
  const [freeThreshold, setFreeThreshold] = useState(settings.freeDeliveryThreshold);

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-plum/10 text-plum flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Admin Management Login</h2>
            <p className="text-xs text-gray-500 mt-1">Enter your manager PIN code to manage inventory and orders.</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (password === 'admin' || password === '1234' || password.length > 0) {
              onLogin();
              onShowToast('Logged in as Administrator', 'success');
            } else {
              onShowToast('Invalid PIN', 'error');
            }
          }} className="space-y-4 text-xs">
            <input 
              type="password"
              placeholder="Enter PIN (e.g. 1234)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-center tracking-widest text-lg font-bold px-4 py-3 rounded-xl border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:border-plum"
            />
            <button 
              type="submit"
              className="w-full bg-plum hover:bg-plum-dark text-white font-extrabold uppercase py-3.5 rounded-xl transition-colors cursor-pointer"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
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
      onShowToast('Product updated successfully');
    } else {
      // Add new
      const newProd: Product = {
        id: Date.now(),
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
      onShowToast('New product added to catalog');
    }
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleStartEdit = (p: Product) => {
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
    onProductsChange(products.filter(p => p.id !== id));
    onShowToast('Product deleted', 'info');
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    onOrdersChange(updated);
    onShowToast(`Order #${orderId.slice(-6).toUpperCase()} status updated to ${status}`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSettingsChange({
      ...settings,
      storeName,
      storePhone,
      storeEmail,
      deliveryFee,
      freeDeliveryThreshold: freeThreshold
    });
    onShowToast('Store settings updated');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-plum/10 text-plum rounded-2xl">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white">Admin Console</h1>
            <p className="text-xs text-gray-500">Manage catalog stock, orders, and store configuration.</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Admin</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-2 text-xs font-extrabold">
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'products' ? 'border-plum text-plum' : 'border-transparent text-gray-500'}`}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'orders' ? 'border-plum text-plum' : 'border-transparent text-gray-500'}`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'settings' ? 'border-plum text-plum' : 'border-transparent text-gray-500'}`}
        >
          <Settings className="w-4 h-4" />
          <span>Store Settings</span>
        </button>
      </div>

      {/* Tab: Products Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Inventory Catalog ({products.length} Items)</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch('/api/products/reset', { method: 'POST' });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.products) {
                        onProductsChange(data.products);
                        onShowToast(`Catalog restored to ${data.products.length} items`, 'success');
                        return;
                      }
                    }
                  } catch (e) {}
                  onProductsChange(defaultProducts);
                  onShowToast(`Catalog restored to ${defaultProducts.length} default items`, 'success');
                }}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer border border-gray-200 dark:border-gray-700"
              >
                <RefreshCw className="w-4 h-4 text-plum" />
                <span>Restore Default Catalog</span>
              </button>

              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setPName(''); setPBrand(''); setPPrice(100); setPOriginalPrice(120); setPStock(10); setPImage(''); setPDesc('');
                  setIsAddingProduct(true);
                }}
                className="bg-plum hover:bg-plum-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>
          </div>

          {isAddingProduct && (
            <form onSubmit={handleSaveProduct} className="bg-white dark:bg-gray-900 border border-plum/30 rounded-3xl p-6 space-y-4 text-xs shadow-lg">
              <h3 className="font-extrabold text-sm text-plum">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Product Name</label>
                  <input type="text" required value={pName} onChange={e => setPName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Brand</label>
                  <input type="text" value={pBrand} onChange={e => setPBrand(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Category</label>
                  <select value={pCategory} onChange={e => setPCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum">
                    <option value="food cupboard">Food Cupboard</option>
                    <option value="fresh food">Fresh Food</option>
                    <option value="beverages">Beverages</option>
                    <option value="electronics">Electronics</option>
                    <option value="liquor">Liquor Cellar</option>
                    <option value="baby & kids">Baby & Kids</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Stock Quantity</label>
                  <input type="number" value={pStock} onChange={e => setPStock(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Selling Price (Ksh)</label>
                  <input type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum" />
                </div>
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Original Price (Ksh)</label>
                  <input type="number" value={pOriginalPrice} onChange={e => setPOriginalPrice(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum" />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Image URL</label>
                <input type="url" value={pImage} onChange={e => setPImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-plum" />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setIsAddingProduct(false)} className="px-4 py-2 rounded-xl border border-gray-300 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-xl bg-plum text-white font-extrabold">Save Product</button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800 font-extrabold text-gray-600 dark:text-gray-300 border-b border-gray-150 dark:border-gray-700">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-xl border bg-white" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-400">{p.brand}</p>
                      </div>
                    </td>
                    <td className="p-4 uppercase font-semibold text-[10px] text-gray-500">{p.category}</td>
                    <td className="p-4 font-black text-plum dark:text-pink-400">{formatMoney(p.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${p.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleStartEdit(p)} className="p-1.5 text-gray-500 hover:text-plum"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Customer Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-8">No order transactions placed yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="p-4 border border-gray-150 dark:border-gray-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 dark:text-white">Order #{order.id.slice(-6).toUpperCase()}</span>
                      <span className="text-[10px] font-bold text-gray-400">{order.date}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-semibold mt-1">
                      Customer: {order.customer.name} ({order.customer.phone}) - {order.customer.address}, {order.customer.county}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-black text-plum text-sm">{formatMoney(order.total)}</span>
                    <select 
                      value={order.status}
                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="px-3 py-1.5 rounded-xl border border-gray-250 dark:border-gray-700 font-bold bg-white dark:bg-gray-800"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 max-w-lg space-y-4 text-xs">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Store Parameters</h2>
          
          <div>
            <label className="block text-gray-500 font-bold mb-1">Supermarket Name</label>
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 font-bold mb-1">Support Phone</label>
              <input type="text" value={storePhone} onChange={e => setStorePhone(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1">Support Email</label>
              <input type="email" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 font-bold mb-1">Base Delivery Fee (Ksh)</label>
              <input type="number" value={deliveryFee} onChange={e => setDeliveryFee(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800" />
            </div>
            <div>
              <label className="block text-gray-500 font-bold mb-1">Free Delivery Min (Ksh)</label>
              <input type="number" value={freeThreshold} onChange={e => setFreeThreshold(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800" />
            </div>
          </div>

          <button type="submit" className="w-full bg-plum text-white font-extrabold py-3 rounded-xl">
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
