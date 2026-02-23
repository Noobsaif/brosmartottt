import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Order, Product } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboard: React.FC = () => {
  const { role, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { 
    products, coupons, orders, flashSales, adminStats, loading, isOffline, refreshData,
    addProduct, updateProduct, deleteProduct,
    addCoupon, deleteCoupon, updateOrderStatus, cancelOrder,
    addFlashSale, deleteFlashSale
  } = useData();

  // Navigation State
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'inventory' | 'marketing'>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Filters & Actions
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Order Action State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // For Delivery Action
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);   // For View Details
  const [deliveryData, setDeliveryData] = useState({ ottEmailOrUsername: '', ottPassword: '', deliveryMessage: '' });

  // Product Action State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    ottName: '', packageName: '', duration: '', price: 0, offerPrice: 0, description: '', features: '', imageUrl: '', isActive: true
  });

  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        ottName: editingProduct.ottName,
        packageName: editingProduct.packageName,
        duration: editingProduct.duration,
        price: editingProduct.price,
        offerPrice: editingProduct.offerPrice,
        description: editingProduct.description || '',
        features: editingProduct.features.join(', '),
        imageUrl: editingProduct.imageUrl,
        isActive: editingProduct.isActive
      });
    } else {
      setProductForm({
        ottName: '', packageName: '', duration: '', price: 0, offerPrice: 0, description: '', features: '', imageUrl: '', isActive: true
      });
    }
  }, [editingProduct]);

  // Coupon & Flash Sale State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'fixed', discountValue: 0, usageLimit: '' });
  const [flashSaleForm, setFlashSaleForm] = useState({ productId: '', salePrice: 0, endTime: '' });

  // Responsive Check
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- HELPERS ---
  const getOrderProductName = (order: any) => {
    // Priority: Populated Product -> Snapshot -> Fallback
    if (order.productId && order.productId.ottName) return `${order.productId.ottName} - ${order.productId.packageName}`;
    if (order.productSnapshot && order.productSnapshot.ottName) return `${order.productSnapshot.ottName} - ${order.productSnapshot.packageName} (Deleted)`;
    return "Product Deleted/Unknown";
  };
  
  const getOrderPrice = (order: any) => order.finalPrice || (order.productId?.offerPrice) || 0;

  // --- STATS (Fallback to local if adminStats is null/offline) ---
  const localTotalRevenue = orders.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? getOrderPrice(curr) : 0), 0);
  const localPendingOrders = orders.filter(o => o.status === 'pending').length;
  const localTodayRevenue = orders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.status !== 'cancelled')
    .reduce((acc, curr) => acc + getOrderPrice(curr), 0);

  const stats = adminStats || {
    totalRevenue: localTotalRevenue,
    todayRevenue: localTodayRevenue,
    pendingOrders: localPendingOrders,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: 0,
    lowStockAlerts: 0
  };

  // --- FILTERED ORDERS ---
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // --- HANDLERS ---
  
  // Orders
  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmitting(true);
    await updateOrderStatus(selectedOrder._id, 'delivered', { ...deliveryData, deliveredAt: new Date().toISOString() });
    setSelectedOrder(null);
    setDeliveryData({ ottEmailOrUsername: '', ottPassword: '', deliveryMessage: '' });
    setIsSubmitting(false);
    alert("Order Delivered!");
  };

  const handleCancelOrder = async () => {
    if (!viewingOrder) return;
    const reason = window.prompt("Reason for cancellation:");
    if (!reason) return;
    setIsSubmitting(true);
    await cancelOrder(viewingOrder._id, reason);
    setViewingOrder(null);
    setIsSubmitting(false);
    alert("Order Cancelled.");
  };

  // Products
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => setProductForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    } else { alert("File too large (Max 5MB)"); }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload: any = { ...productForm, features: productForm.features.split(',').map(s => s.trim()).filter(Boolean) };
    if (editingProduct) await updateProduct(editingProduct._id, payload);
    else await addProduct(payload);
    setIsProductModalOpen(false);
    setIsSubmitting(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if(confirm("Are you sure you want to permanently delete this product? It will be removed from the store immediately.")) {
      setDeletingProductId(id);
      const success = await deleteProduct(id);
      setDeletingProductId(null);
      if(!success) alert("Failed to delete product. Please check console for errors.");
    }
  }

  // Marketing
  const saveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await addCoupon({ ...couponForm, usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : undefined } as any);
    if (success) {
      alert("Coupon created successfully!");
      setIsCouponModalOpen(false);
      setCouponForm({ code: '', discountType: 'fixed', discountValue: 0, usageLimit: '' });
    } else {
      alert("Failed to create coupon. Code might already exist.");
    }
    setIsSubmitting(false);
  };

  const saveFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!flashSaleForm.productId) return alert("Select product");
    setIsSubmitting(true);
    await addFlashSale(flashSaleForm);
    setFlashSaleForm({ productId: '', salePrice: 0, endTime: '' });
    setIsSubmitting(false);
  };

  if (role !== 'admin') return <div className="h-screen flex items-center justify-center text-red-500 font-bold dark:bg-slate-950">Access Denied</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans transition-colors duration-300">
      
      {/* --- SIDEBAR --- */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? (isMobile ? '100%' : '280px') : '0px', opacity: isSidebarOpen ? 1 : (isMobile ? 0 : 1) }}
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white overflow-hidden shadow-2xl ${!isMobile && !isSidebarOpen ? 'w-0' : ''}`}
        style={{ width: isSidebarOpen ? (isMobile ? '100%' : '280px') : '0px' }}
      >
        <div className="flex flex-col h-full p-6">
           <div className="flex justify-between items-center mb-10">
              <Link to="/" className="flex items-center gap-3">
                 <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                 <span className="text-2xl font-heading font-bold tracking-tight">Bros<span className="text-orange-500">Mart</span></span>
              </Link>
              {isMobile && <button onClick={() => setSidebarOpen(false)} className="text-slate-400"><i className="fa-solid fa-xmark text-2xl"></i></button>}
           </div>

           <nav className="space-y-2 flex-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
                { id: 'orders', label: 'Orders', icon: 'fa-cart-shopping' },
                { id: 'inventory', label: 'Inventory', icon: 'fa-box-open' },
                { id: 'marketing', label: 'Marketing', icon: 'fa-bullhorn' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveView(item.id as any); if(isMobile) setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${activeView === item.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                  {item.label}
                </button>
              ))}
           </nav>

           <div className="border-t border-slate-800 pt-6 mt-6 space-y-4">
              <div className="flex items-center gap-3 px-2">
                 <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-orange-500 font-bold border border-slate-700">
                    {user?.name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                 </div>
              </div>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                 <i className="fa-solid fa-arrow-right-from-bracket w-5"></i> Sign Out
              </button>
           </div>
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative transition-all duration-300 ${isSidebarOpen && !isMobile ? 'ml-[280px]' : ''}`}>
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg">
                   <i className="fa-solid fa-bars text-xl"></i>
              </button>
              <h1 className="text-xl font-bold text-black dark:text-white capitalize font-heading">{activeView}</h1>
           </div>
           
           <div className="flex items-center gap-4">
              {isOffline && <span className="hidden sm:inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-3 py-1 rounded-full font-bold border border-amber-200 dark:border-amber-800">OFFLINE MODE</span>}
              <button onClick={() => refreshData()} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                 <i className={`fa-solid fa-rotate-right ${loading ? 'animate-spin' : ''}`}></i>
              </button>

           </div>
        </header>

        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full">
           
           {/* VIEW: DASHBOARD */}
           {activeView === 'dashboard' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                     { title: "Total Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: "fa-sack-dollar", color: "bg-green-500", sub: "Lifetime Earnings" },
                     { title: "Revenue Today", value: `৳${stats.todayRevenue.toLocaleString()}`, icon: "fa-calendar-day", color: "bg-blue-500", sub: "Last 24 Hours" },
                     { title: "Pending Orders", value: stats.pendingOrders, icon: "fa-clock", color: "bg-amber-500", sub: "Requires Action" },
                     { title: "Total Products", value: stats.totalProducts, icon: "fa-box", color: "bg-purple-500", sub: "In Inventory" }
                   ].map((stat, i) => (
                     <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-10 rounded-bl-[50%] transition-transform group-hover:scale-110`}></div>
                        <div className="relative z-10">
                           <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center text-${stat.color.split('-')[1]}-500 mb-4`}>
                              <i className={`fa-solid ${stat.icon} text-xl`}></i>
                           </div>
                           <h3 className="text-3xl font-bold text-black dark:text-white mb-1">{stat.value}</h3>
                           <p className="text-slate-800 dark:text-slate-400 text-sm font-medium">{stat.title}</p>
                           <p className="text-xs text-slate-700 mt-2">{stat.sub}</p>
                        </div>
                     </div>
                   ))}
                </div>
                
                {/* Recent Activity Summary */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-black dark:text-white mb-4">Latest Activity</h2>
                    <div className="space-y-4">
                       {orders.slice(0, 5).map(order => (
                          <div key={order._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                   <i className={`fa-solid ${order.status === 'delivered' ? 'fa-check' : 'fa-clock'}`}></i>
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-slate-900 dark:text-white">Order #{order._id.slice(-4)}</p>
                                   <p className="text-xs text-slate-500">{getOrderProductName(order)}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">৳{getOrderPrice(order)}</p>
                                <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleTimeString()}</p>
                             </div>
                          </div>
                       ))}
                       {orders.length === 0 && <p className="text-slate-500 text-sm">No recent activity.</p>}
                    </div>
                    <Button variant="secondary" className="w-full mt-4 text-sm" onClick={() => setActiveView('orders')}>View All Orders</Button>
                </div>
             </motion.div>
           )}

           {/* VIEW: ORDERS */}
           {activeView === 'orders' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
               
               {/* Filters */}
               <div className="flex flex-wrap gap-2">
                 {['all', 'pending', 'delivered', 'cancelled'].map(f => (
                   <button 
                     key={f} 
                     onClick={() => setOrderFilter(f as any)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${orderFilter === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'}`}
                   >
                     {f}
                   </button>
                 ))}
               </div>

               {/* Orders List / Table */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                 {filteredOrders.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">No orders found.</div>
                 ) : (
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 text-xs uppercase tracking-wider">
                         <tr>
                           <th className="px-6 py-4">ID & Date</th>
                           <th className="px-6 py-4">Customer</th>
                           <th className="px-6 py-4">Product</th>
                           <th className="px-6 py-4">Payment</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Action</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {filteredOrders.map(order => (
                           <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                             <td className="px-6 py-4">
                               <div className="font-mono text-xs font-bold text-slate-500">#{order._id.slice(-6)}</div>
                               <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                             </td>
                             <td className="px-6 py-4">
                               <div className="text-sm font-medium text-slate-950 dark:text-white">{order.email}</div>
                               <div className="text-xs text-slate-500">{order.phone}</div>
                             </td>
                             <td className="px-6 py-4">
                               <div className="text-sm font-bold text-slate-900 dark:text-white">{getOrderProductName(order)}</div>
                               <div className="text-xs text-slate-500">৳{getOrderPrice(order)}</div>
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-1.5">
                                 <span className="capitalize text-sm font-medium text-slate-700 dark:text-slate-300">{order.paymentMethod}</span>
                               </div>
                               <div className="text-xs font-mono text-slate-400 mt-0.5">{order.transactionId}</div>
                             </td>
                             <td className="px-6 py-4">
                               <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                 order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                                 order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30'
                               }`}>
                                 {order.status}
                               </span>
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex gap-2">
                                 <Button size="sm" variant="secondary" onClick={() => setViewingOrder(order)} className="h-8 px-3 text-xs">Details</Button>
                                 {order.status === 'pending' && (
                                   <Button size="sm" onClick={() => setSelectedOrder(order)} className="h-8 px-3 text-xs bg-orange-600 hover:bg-orange-700 text-white border-0">Deliver</Button>
                                 )}
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </div>
             </motion.div>
           )}

           {/* VIEW: INVENTORY */}
           {activeView === 'inventory' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">Product Catalog</h2>
                    <Button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} size="sm"><i className="fa-solid fa-plus mr-2"></i> Add Product</Button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                       <div key={product._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                          <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                             <img src={product.imageUrl} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.isActive ? 'grayscale opacity-50' : ''}`} alt={product.ottName} />
                             <div className="absolute top-3 right-3 flex gap-2">
                                <button 
                                   onClick={() => updateProduct(product._id, { isActive: !product.isActive })}
                                   className={`px-3 py-1 text-xs font-bold rounded-md backdrop-blur transition-colors ${product.isActive ? 'bg-green-500/90 text-white hover:bg-green-600' : 'bg-slate-500/90 text-white hover:bg-slate-600'}`}
                                >
                                   {product.isActive ? 'Active' : 'Inactive'}
                                </button>
                             </div>
                          </div>
                          <div className="p-4">
                             <h3 className="font-bold text-slate-950 dark:text-white text-lg">{product.ottName}</h3>
                             <p className="text-sm text-slate-500 mb-3">{product.packageName}</p>
                             <div className="flex justify-between items-center mb-4">
                                <span className="font-mono font-bold text-orange-600">৳{product.offerPrice}</span>
                                <span className="text-xs text-slate-400 line-through">৳{product.price}</span>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <Button variant="secondary" size="sm" onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="text-xs">Edit</Button>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={() => handleDeleteProduct(product._id)} 
                                    isLoading={deletingProductId === product._id}
                                    className="text-xs"
                                >
                                    Delete
                                </Button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </motion.div>
           )}

           {/* VIEW: MARKETING */}
           {activeView === 'marketing' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Flash Sales */}
                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                       <h3 className="font-bold text-lg text-slate-950 dark:text-white mb-6 flex items-center gap-2"><i className="fa-solid fa-bolt text-orange-500"></i> Flash Sales</h3>
                       <form onSubmit={saveFlashSale} className="space-y-4 mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <select 
                             className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                             value={flashSaleForm.productId}
                             onChange={e => setFlashSaleForm({ ...flashSaleForm, productId: e.target.value })}
                             required
                          >
                             <option value="">Select Product...</option>
                             {products.filter(p => p.isActive).map(p => <option key={p._id} value={p._id}>{p.ottName} - {p.packageName}</option>)}
                          </select>
                          <div className="grid grid-cols-2 gap-4">
                             <Input label="Sale Price" type="number" value={flashSaleForm.salePrice} onChange={e => setFlashSaleForm({...flashSaleForm, salePrice: Number(e.target.value)})} required />
                             <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                                <input 
                                   type="datetime-local" 
                                   className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                   value={flashSaleForm.endTime}
                                   onChange={e => setFlashSaleForm({...flashSaleForm, endTime: e.target.value})}
                                   required
                                />
                             </div>
                          </div>
                          <Button type="submit" className="w-full" isLoading={isSubmitting}>Create Sale</Button>
                       </form>

                       <div className="space-y-3">
                          {flashSales.map(fs => (
                             <div key={fs._id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                <div>
                                   <p className="font-bold text-sm text-slate-900 dark:text-white">{fs.productId?.ottName || 'Deleted'}</p>
                                   <p className="text-xs text-orange-500 font-bold">৳{fs.salePrice}</p>
                                </div>
                                <Button size="sm" variant="danger" className="px-3 py-1 text-xs h-8" onClick={() => deleteFlashSale(fs._id)}>End</Button>
                             </div>
                          ))}
                          {flashSales.length === 0 && <p className="text-center text-slate-400 text-sm">No active flash sales.</p>}
                       </div>
                    </div>
                 </motion.div>

                 {/* Coupons */}
                 <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                       <h3 className="font-bold text-lg text-slate-950 dark:text-white mb-6 flex items-center gap-2"><i className="fa-solid fa-ticket text-green-500"></i> Coupons</h3>
                       <Button onClick={() => setIsCouponModalOpen(true)} className="w-full mb-6">Create New Coupon</Button>
                       
                       <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                             <thead className="text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                                <tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Usage</th><th className="p-3"></th></tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {coupons.map(c => (
                                   <tr key={c._id}>
                                      <td className="p-3 font-mono font-bold">{c.code}</td>
                                      <td className="p-3 text-green-600 font-bold">{c.discountType === 'percent' ? `${c.discountValue}%` : `৳${c.discountValue}`}</td>
                                      <td className="p-3 text-slate-500">{c.usedCount} / {c.usageLimit || '∞'}</td>
                                      <td className="p-3 text-right">
                                         <button onClick={() => deleteCoupon(c._id)} className="text-red-500 hover:text-red-700"><i className="fa-solid fa-trash"></i></button>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </motion.div>
              </div>
           )}

        </div>
      </main>

      {/* --- MODALS --- */}
      
      {/* 1. Order Details Modal */}
      <AnimatePresence>
      {viewingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="font-bold text-lg dark:text-white">Order Details</h3>
                 <button onClick={() => setViewingOrder(null)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-2xl">📦</div>
                    <div>
                       <p className="font-bold text-slate-900 dark:text-white">{getOrderProductName(viewingOrder)}</p>
                       <p className="text-orange-600 font-bold">৳{getOrderPrice(viewingOrder)}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                       <p className="text-xs text-slate-500 uppercase font-bold">Customer</p>
                       <p className="text-sm dark:text-white truncate">{viewingOrder.email}</p>
                       <p className="text-sm dark:text-white">{viewingOrder.phone}</p>
                    </div>
                    <div className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl">
                       <p className="text-xs text-slate-500 uppercase font-bold">Payment</p>
                       <p className="text-sm dark:text-white capitalize">{viewingOrder.paymentMethod}</p>
                       <p className="text-xs font-mono text-slate-500">{viewingOrder.transactionId}</p>
                    </div>
                 </div>

                 {viewingOrder.deliveryDetails && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                       <p className="text-xs font-bold text-green-800 dark:text-green-300 uppercase mb-2">Delivery Info</p>
                       <p className="text-sm font-mono"><span className="font-bold">ID:</span> {viewingOrder.deliveryDetails.ottEmailOrUsername}</p>
                       <p className="text-sm font-mono"><span className="font-bold">PW:</span> {viewingOrder.deliveryDetails.ottPassword}</p>
                       {viewingOrder.deliveryDetails.deliveryMessage && <p className="text-xs mt-2 italic text-green-700">"{viewingOrder.deliveryDetails.deliveryMessage}"</p>}
                    </div>
                 )}
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                 <Button variant="secondary" onClick={() => setViewingOrder(null)}>Close</Button>
                 {viewingOrder.status === 'pending' && <Button variant="danger" onClick={handleCancelOrder}>Cancel Order</Button>}
              </div>
           </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* 2. Delivery Modal */}
      <AnimatePresence>
      {selectedOrder && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
               <h2 className="text-xl font-bold mb-6 dark:text-white">Deliver Order</h2>
               <form onSubmit={handleDeliver} className="space-y-4">
                  <Input label="Account Email / User" value={deliveryData.ottEmailOrUsername} onChange={e => setDeliveryData({...deliveryData, ottEmailOrUsername: e.target.value})} required />
                  <Input label="Account Password" value={deliveryData.ottPassword} onChange={e => setDeliveryData({...deliveryData, ottPassword: e.target.value})} required />
                  <Input label="Note (Optional)" value={deliveryData.deliveryMessage} onChange={e => setDeliveryData({...deliveryData, deliveryMessage: e.target.value})} />
                  <div className="flex gap-4 mt-8">
                     <Button type="submit" className="flex-1" isLoading={isSubmitting}>Confirm Delivery</Button>
                     <Button type="button" variant="secondary" onClick={() => setSelectedOrder(null)} className="flex-1">Cancel</Button>
                  </div>
               </form>
            </motion.div>
         </div>
      )}
      </AnimatePresence>

      {/* 3. Product Modal */}
      <AnimatePresence>
      {isProductModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 my-8">
               <h2 className="text-2xl font-bold mb-6 dark:text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
               <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Name" value={productForm.ottName} onChange={e => setProductForm({...productForm, ottName: e.target.value})} required className="col-span-2 md:col-span-1" />
                  <Input label="Package" value={productForm.packageName} onChange={e => setProductForm({...productForm, packageName: e.target.value})} required className="col-span-2 md:col-span-1" />
                  <Input label="Duration" value={productForm.duration} onChange={e => setProductForm({...productForm, duration: e.target.value})} required />
                  <Input label="Price (Reg)" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} required />
                  <Input label="Price (Offer)" type="number" value={productForm.offerPrice} onChange={e => setProductForm({...productForm, offerPrice: Number(e.target.value)})} required />
                  <div className="col-span-2">
                     <label className="text-sm font-bold ml-1 mb-2 block dark:text-slate-300">Image</label>
                     <input type="file" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                     <Input label="Or URL" value={productForm.imageUrl} onChange={e => setProductForm({...productForm, imageUrl: e.target.value})} className="mt-2" />
                  </div>
                  <Input label="Features (comma sep)" value={productForm.features} onChange={e => setProductForm({...productForm, features: e.target.value})} className="col-span-2" />
                  <div className="col-span-2 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                     <label className="text-sm font-bold dark:text-slate-300 flex-1">Product Status</label>
                     <button 
                        type="button"
                        onClick={() => setProductForm({...productForm, isActive: !productForm.isActive})}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${productForm.isActive ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}
                     >
                        {productForm.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}
                     </button>
                  </div>
                  <div className="col-span-2 flex gap-4 mt-4">
                     <Button type="submit" className="flex-1" isLoading={isSubmitting}>Save</Button>
                     <Button type="button" variant="secondary" onClick={() => setIsProductModalOpen(false)} className="flex-1">Cancel</Button>
                  </div>
               </form>
            </motion.div>
         </div>
      )}
      </AnimatePresence>

      {/* 4. Coupon Modal */}
      <AnimatePresence>
      {isCouponModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-bold mb-6 dark:text-white">Create Coupon</h2>
                <form onSubmit={saveCoupon} className="space-y-4">
                   <Input label="Code" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} required />
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-sm font-bold ml-1 mb-2 block dark:text-slate-300">Type</label>
                         <select className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white" value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value as any})}>
                            <option value="fixed">Fixed Amount</option>
                            <option value="percent">Percentage</option>
                         </select>
                      </div>
                      <Input label="Value" type="number" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: Number(e.target.value)})} required />
                   </div>
                   <Input label="Usage Limit (Optional)" type="number" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: e.target.value})} />
                   <div className="flex gap-4 mt-6">
                      <Button type="submit" className="flex-1" isLoading={isSubmitting}>Create</Button>
                      <Button type="button" variant="secondary" onClick={() => setIsCouponModalOpen(false)} className="flex-1">Cancel</Button>
                   </div>
                </form>
             </motion.div>
         </div>
      )}
      </AnimatePresence>

    </div>
  );
};