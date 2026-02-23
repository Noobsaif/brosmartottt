import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Order, API_URL, Notification, Invoice, Product } from '../types';
import { motion } from 'framer-motion';

// Mock Data for Fallback (Kept from original)
const MOCK_ORDERS: Order[] = [
  {
    _id: "ord_mock_1", userUid: "1", email: "user@example.com", phone: "01700000000", paymentMethod: "bkash", transactionId: "TRX8892", status: "delivered",
    productId: { ottName: "Netflix", packageName: "4K UHD", offerPrice: 250 } as Product,
    createdAt: new Date().toISOString(),
    deliveryDetails: { ottEmailOrUsername: "user@netflix.com", ottPassword: "password123", deliveredAt: new Date().toISOString() }
  }
];

export const Dashboard: React.FC = () => {
  const { user, firebaseUser } = useAuth();
  const { orders, loading: dataLoading, refreshData } = useData();
  const [localLoading, setLocalLoading] = useState(true);

  // Initial fetch is handled by DataProvider, but we can force refresh on mount
  useEffect(() => {
     if(user) {
        refreshData().then(() => setLocalLoading(false));
     }
  }, [user]);

  // Combine loading states
  const isLoading = localLoading && dataLoading;

  // Filter orders for this user (client side safety, though API does it too)
  const myOrders = orders.filter(o => o.userUid === user?.uid);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4"
        >
           <div>
             <div className="flex items-center gap-3">
               <h1 className="text-3xl font-heading font-bold text-black dark:text-white">Dashboard</h1>
               <span className="flex h-3 w-3 relative" title="Live Updates Active">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
               </span>
             </div>
             <p className="text-slate-800 dark:text-slate-400">Welcome back, {user?.name.split(' ')[0]}</p>
           </div>
           <div className="flex gap-4">
              <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                 <p className="text-xs text-slate-800 uppercase font-bold">Total Orders</p>
                 <p className="text-2xl font-bold text-black dark:text-white">{myOrders.length}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                 <p className="text-xs text-slate-800 uppercase font-bold">Active</p>
                 <p className="text-2xl font-bold text-orange-600">{myOrders.filter(o => o.status === 'delivered').length}</p>
              </div>
           </div>
        </motion.div>

        {/* Orders List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {isLoading ? (
             <div className="text-center py-20 text-slate-400">
                <i className="fa-solid fa-circle-notch animate-spin text-3xl mb-3 text-orange-500"></i>
                <p>Syncing your orders...</p>
             </div>
          ) : myOrders.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🛍️</div>
                <h3 className="text-lg font-bold text-black dark:text-white">No Orders Yet</h3>
                <p className="text-slate-800 mb-6">Start your first premium subscription today.</p>
                <a href="#/products" className="text-orange-600 font-bold hover:underline">Browse Store</a>
             </div>
          ) : (
             myOrders.map((order) => (
               <div key={order._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Order Header */}
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}></div>
                        <span className="text-sm font-mono font-bold text-slate-500">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-slate-400 hidden sm:inline-block">| {new Date(order.createdAt).toLocaleDateString()}</span>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 
                        order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 
                        'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                     }`}>
                        {order.status}
                     </span>
                  </div>

                  <div className="p-6 grid md:grid-cols-12 gap-6">
                     {/* Product Info */}
                     <div className="md:col-span-4 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                           {order.productId?.imageUrl ? (
                              <img src={order.productId.imageUrl} className="w-full h-full object-cover" />
                           ) : <div className="w-full h-full flex items-center justify-center text-slate-400"><i className="fa-solid fa-box"></i></div>}
                        </div>
                        <div>
                           <h3 className="font-bold text-black dark:text-white text-lg">{order.productId?.ottName || order.productSnapshot?.ottName}</h3>
                           <p className="text-slate-800 text-sm">{order.productId?.packageName || order.productSnapshot?.packageName}</p>
                           <p className="text-orange-600 font-bold text-sm mt-1">৳{order.finalPrice || order.productId?.offerPrice}</p>
                        </div>
                     </div>

                     {/* Payment Info */}
                     <div className="md:col-span-3 flex flex-col justify-center text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <p><span className="text-slate-400 uppercase text-xs font-bold mr-2">Method:</span> <span className="capitalize">{order.paymentMethod}</span></p>
                        <p><span className="text-slate-400 uppercase text-xs font-bold mr-2">TrxID:</span> <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{order.transactionId}</span></p>
                     </div>

                     {/* Delivery Card / Status */}
                     <div className="md:col-span-5">
                        {order.status === 'delivered' && order.deliveryDetails ? (
                           <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/20 rounded-full blur-xl -mr-8 -mt-8"></div>
                              <h4 className="text-green-500 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                 <i className="fa-solid fa-unlock-keyhole"></i> Credentials
                              </h4>
                              <div className="space-y-2">
                                 <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                                    <span className="text-slate-500 text-xs font-bold px-2">ID</span>
                                    <code className="text-white font-mono text-sm select-all">{order.deliveryDetails.ottEmailOrUsername}</code>
                                 </div>
                                 <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                                    <span className="text-slate-500 text-xs font-bold px-2">PW</span>
                                    <code className="text-white font-mono text-sm select-all tracking-wider">{order.deliveryDetails.ottPassword}</code>
                                 </div>
                              </div>
                              {order.deliveryDetails.deliveryMessage && (
                                 <p className="text-slate-400 text-xs mt-3 italic">"{order.deliveryDetails.deliveryMessage}"</p>
                              )}
                           </div>
                        ) : order.status === 'pending' ? (
                           <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                              <div className="animate-spin text-amber-500 text-xl mb-2"><i className="fa-solid fa-circle-notch"></i></div>
                              <p className="text-amber-800 dark:text-amber-200 font-bold text-sm">Processing Order</p>
                              <p className="text-amber-600 dark:text-amber-400 text-xs">Usually takes 10-30 mins</p>
                           </div>
                        ) : (
                           <div className="h-full flex items-center justify-center text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm">
                              {order.deliveryDetails?.deliveryMessage || "Order Cancelled"}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
             ))
          )}
        </motion.div>
      </div>
    </div>
  );
};