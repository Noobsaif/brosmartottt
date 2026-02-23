import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Product, Coupon, Order, FlashSale, Notification, AdminStats, API_URL, Wishlist } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
  flashSales: FlashSale[];
  notifications: Notification[];
  wishlist: Wishlist[];
  adminStats: AdminStats | null;
  unreadNotifCount: number;
  loading: boolean;
  isOffline: boolean;
  refreshData: () => Promise<void>;
  // Product Actions
  addProduct: (product: Omit<Product, '_id' | 'createdAt'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  // Coupon Actions
  addCoupon: (coupon: Omit<Coupon, '_id' | 'usedCount' | 'isActive'>) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<boolean>;
  verifyCoupon: (code: string, productId: string) => Promise<{ valid: boolean; discountAmount: number; finalPrice: number; message?: string }>;
  // Order Actions
  addOrder: (order: any) => Promise<boolean>;
  updateOrderStatus: (id: string, status: 'pending' | 'delivered' | 'cancelled', deliveryDetails?: any) => Promise<boolean>;
  cancelOrder: (id: string, reason?: string) => Promise<boolean>;
  // Flash Sale Actions
  addFlashSale: (data: any) => Promise<boolean>;
  deleteFlashSale: (id: string) => Promise<boolean>;
  // Notification Actions
  markNotificationRead: (id: string) => Promise<void>;
  // Review Actions
  addReview: (productId: string, rating: number, comment: string) => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;
  // Wishlist Actions
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- INITIAL MOCK DATA ---
const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_COUPONS: Coupon[] = [];
const INITIAL_FLASH_SALES: FlashSale[] = [];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  
  // Ref to track if component is mounted for interval cleanup
  const isMounted = useRef(true);

  const refreshData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // 1. Fetch Products
      // Admin gets ALL products (active/inactive) via secure endpoint if possible
      // User gets ONLY active products via public endpoint
      let prodRes;
      try {
        if (role === 'admin' && firebaseUser) {
           const token = await firebaseUser.getIdToken();
           prodRes = await fetch(`${API_URL}/products/admin/all`, { headers: { 'Authorization': `Bearer ${token}` } });
        }
        
        // Fallback to public if admin fetch failed or not admin
        if (!prodRes || !prodRes.ok) {
           prodRes = await fetch(`${API_URL}/products`);
        }

        if (prodRes.ok) setProducts(await prodRes.json());
        else throw new Error();
      } catch {
        if (products.length === 0) setProducts(INITIAL_PRODUCTS);
        setIsOffline(true);
      }

      // 2. Fetch Active Flash Sales (Public)
      try {
        const fsRes = await fetch(`${API_URL}/flash-sales`);
        if (fsRes.ok) setFlashSales(await fsRes.json());
      } catch {
        setFlashSales(INITIAL_FLASH_SALES);
      }

      // 3. Fetch User-Specific / Admin Data
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const headers = { 'Authorization': `Bearer ${token}` };
          
          // User Notifications & Wishlist
          const [notifRes, wishRes] = await Promise.all([
             fetch(`${API_URL}/notifications`, { headers }),
             fetch(`${API_URL}/wishlist`, { headers })
          ]);
          if (notifRes.ok) setNotifications(await notifRes.json());
          if (wishRes.ok) setWishlist(await wishRes.json());

          if (role === 'admin') {
             // Admin Data
             const [coupRes, ordRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/coupons`, { headers }),
                fetch(`${API_URL}/orders/admin/all`, { headers }),
                fetch(`${API_URL}/admin/stats`, { headers })
             ]);

             if (coupRes.ok) setCoupons(await coupRes.json());
             if (ordRes.ok) setOrders(await ordRes.json());
             if (statsRes.ok) setAdminStats(await statsRes.json());
          } 
        } catch {
          setIsOffline(true);
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial Fetch & Polling Setup
  useEffect(() => {
    isMounted.current = true;
    refreshData();

    // Poll every 15 seconds to keep data dynamic
    const intervalId = setInterval(() => {
       if(isMounted.current && !document.hidden) {
          refreshData(true); // Silent refresh
       }
    }, 15000);

    return () => {
       isMounted.current = false;
       clearInterval(intervalId);
    };
  }, [firebaseUser, role]);

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  // --- ACTIONS ---

  const addProduct = async (productData: any) => {
    const newProduct = { ...productData, _id: Date.now().toString(), isActive: true, createdAt: new Date().toISOString() };
    if (isOffline) {
      setProducts(prev => [newProduct, ...prev]);
      return true;
    }
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(productData)
      });
      if (res.ok) { refreshData(true); return true; }
    } catch {
      setProducts(prev => [newProduct, ...prev]); // Optimistic offline
      return true;
    }
    return false;
  };

  const updateProduct = async (id: string, updates: any) => {
    if (isOffline) {
      setProducts(prev => prev.map(p => p._id === id ? { ...p, ...updates } : p));
      return true;
    }
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      if (res.ok) { refreshData(true); return true; }
    } catch {
      setProducts(prev => prev.map(p => p._id === id ? { ...p, ...updates } : p));
      return true;
    }
    return false;
  };

  const deleteProduct = async (id: string) => {
    if (isOffline) {
      setProducts(prev => prev.filter(p => p._id !== id));
      return true;
    }
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`${API_URL}/products/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Delete failed:", errData);
        return false;
      }
      
      // Update local state immediately upon success
      setProducts(prev => prev.filter(p => p._id !== id));
      refreshData(true); // Sync fully
      return true;
    } catch (e) {
      console.error("Network error deleting product:", e);
      // Fallback for visual responsiveness in case of network issues if appropriate
      setProducts(prev => prev.filter(p => p._id !== id));
      return true; 
    }
  };

  const addCoupon = async (couponData: any) => {
    const newCoupon = { ...couponData, _id: Date.now().toString(), usedCount: 0, isActive: true };
    if (isOffline) {
      setCoupons(prev => [newCoupon, ...prev]);
      return true;
    }
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`${API_URL}/coupons`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(couponData)
      });
      if (res.ok) {
        refreshData(true);
        return true;
      }
      return false;
    } catch {
      setCoupons(prev => [newCoupon, ...prev]);
      return true;
    }
  };

  const deleteCoupon = async (id: string) => {
    if (isOffline) {
      setCoupons(prev => prev.filter(c => c._id !== id));
      return true;
    }
    try {
      const token = await firebaseUser?.getIdToken();
      await fetch(`${API_URL}/coupons/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      refreshData(true);
      return true;
    } catch {
      setCoupons(prev => prev.filter(c => c._id !== id));
      return true;
    }
  };

  const verifyCoupon = async (code: string, productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return { valid: false, discountAmount: 0, finalPrice: 0, message: "Product not found" };

    if (isOffline) {
      const coupon = coupons.find(c => c.code === code.toUpperCase() && c.isActive);
      const flashSale = flashSales.find(fs => fs.productId._id === productId && fs.isActive);
      const basePrice = flashSale ? flashSale.salePrice : product.offerPrice;

      if (coupon) {
        let discount = coupon.discountType === 'percent' 
           ? Math.round((basePrice * coupon.discountValue) / 100) 
           : coupon.discountValue;
        return { valid: true, discountAmount: discount, finalPrice: basePrice - discount };
      }
      return { valid: false, discountAmount: 0, finalPrice: basePrice, message: "Invalid Code (Offline Check)" };
    }

    // Online verification
    try {
       const token = await firebaseUser?.getIdToken();
       const res = await fetch(`${API_URL}/coupons/verify`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify({ code, productId })
       });
       const data = await res.json();
       if (res.ok && data.valid) return data;
       throw new Error(data.message);
    } catch {
       return { valid: false, discountAmount: 0, finalPrice: 0, message: "Verification failed" };
    }
  };

  const addOrder = async (orderData: any) => {
    const productRef = orderData.productId_populated;
    const newOrderLocal = { 
       ...orderData, 
       _id: Date.now().toString(), 
       status: 'pending', 
       createdAt: new Date().toISOString(),
       productId: productRef,
       productSnapshot: {
         ottName: productRef.ottName,
         packageName: productRef.packageName,
         duration: productRef.duration
       }
    };

    if (isOffline) {
       setOrders(prev => [newOrderLocal, ...prev]);
       return true;
    }
    try {
       const token = await firebaseUser?.getIdToken();
       const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(orderData)
       });
       if(res.ok) { refreshData(true); return true; }
    } catch {
       setOrders(prev => [newOrderLocal, ...prev]);
       return true;
    }
    return false;
  };

  const updateOrderStatus = async (id: string, status: string, deliveryDetails: any) => {
     if(isOffline) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: status as any, deliveryDetails } : o));
        return true;
     }
     try {
        const token = await firebaseUser?.getIdToken();
        await fetch(`${API_URL}/orders/${id}/deliver`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
           body: JSON.stringify(deliveryDetails)
        });
        refreshData(true);
        return true;
     } catch {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: status as any, deliveryDetails } : o));
        return true;
     }
  };

  const cancelOrder = async (id: string, reason?: string) => {
    if (isOffline) {
       setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled', deliveryDetails: { ...o.deliveryDetails, deliveryMessage: reason } as any } : o));
       return true;
    }
    try {
       const token = await firebaseUser?.getIdToken();
       const res = await fetch(`${API_URL}/orders/${id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ reason })
       });
       if(res.ok) { refreshData(true); return true; }
    } catch {
       setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled', deliveryDetails: { ...o.deliveryDetails, deliveryMessage: reason } as any } : o));
       return true;
    }
    return false;
  };

  const addFlashSale = async (data: any) => {
    if (isOffline) {
      const product = products.find(p => p._id === data.productId);
      if(!product) return false;
      const newSale = { 
        ...data, 
        _id: Date.now().toString(), 
        isActive: true, 
        productId: product 
      };
      setFlashSales(prev => [...prev.filter(fs => fs.productId._id !== data.productId), newSale]);
      return true;
    }
    try {
      const token = await firebaseUser?.getIdToken();
      await fetch(`${API_URL}/flash-sales`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
         body: JSON.stringify(data)
      });
      refreshData(true);
      return true;
    } catch { return false; }
  };

  const deleteFlashSale = async (id: string) => {
    if (isOffline) {
      setFlashSales(prev => prev.filter(fs => fs._id !== id));
      return true;
    }
    try {
      const token = await firebaseUser?.getIdToken();
      await fetch(`${API_URL}/flash-sales/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      refreshData(true);
      return true;
    } catch { return false; }
  };

  const markNotificationRead = async (id: string) => {
     setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
     if(!isOffline && firebaseUser) {
        try {
           const token = await firebaseUser.getIdToken();
           await fetch(`${API_URL}/notifications/${id}/read`, { 
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}` }
           });
        } catch(e) {}
     }
  };

  const addReview = async (productId: string, rating: number, comment: string) => {
    if (isOffline) return false;
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId, rating, comment })
      });
      if (res.ok) {
        refreshData(true); // Refresh products to update rating
        return true;
      }
      return false;
    } catch { return false; }
  };

  const deleteReview = async (id: string) => {
    if (isOffline) return false;
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData(true);
        return true;
      }
      return false;
    } catch { return false; }
  };

  const addToWishlist = async (productId: string) => {
    if (isOffline) return false;
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`${API_URL}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        refreshData(true);
        return true;
      }
      return false;
    } catch { return false; }
  };

  const removeFromWishlist = async (productId: string) => {
    if (isOffline) return false;
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        refreshData(true);
        return true;
      }
      return false;
    } catch { return false; }
  };

  return (
    <DataContext.Provider value={{ 
      products, coupons, orders, flashSales, 
      notifications, wishlist, adminStats, unreadNotifCount,
      loading, isOffline, refreshData,
      addProduct, updateProduct, deleteProduct,
      addCoupon, deleteCoupon, verifyCoupon,
      addOrder, updateOrderStatus, cancelOrder,
      addFlashSale, deleteFlashSale,
      markNotificationRead,
      addReview, deleteReview,
      addToWishlist, removeFromWishlist
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};