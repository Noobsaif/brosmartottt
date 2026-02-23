import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';

export const Notifications: React.FC = () => {
  const { notifications, markNotificationRead, refreshData } = useData();

  useEffect(() => {
     // Refresh data when entering to get latest
     refreshData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
         <motion.div 
           initial={{ opacity: 0, y: -20 }} 
           animate={{ opacity: 1, y: 0 }}
           className="mb-8"
         >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Stay updated with your latest orders and offers.</p>
         </motion.div>

         {notifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-800">
               <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">
                  <i className="fa-regular fa-bell-slash"></i>
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Notifications</h3>
               <p className="text-slate-500 text-sm mt-1">You're all caught up!</p>
            </div>
         ) : (
            <div className="space-y-4">
               {notifications.map((notif, idx) => (
                  <motion.div
                     key={notif._id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     onClick={() => markNotificationRead(notif._id)}
                     className={`relative p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                        !notif.isRead 
                           ? 'bg-white dark:bg-slate-900 border-orange-200 dark:border-orange-900/50 shadow-sm' 
                           : 'bg-slate-50 dark:bg-slate-900/50 border-transparent dark:border-slate-800 opacity-80'
                     }`}
                  >
                     {!notif.isRead && (
                        <div className="absolute top-5 right-5 w-2 h-2 bg-orange-500 rounded-full"></div>
                     )}
                     <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                           notif.title.includes("Cancelled") ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                           notif.title.includes("Delivered") ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                           'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                           <i className={`fa-solid ${
                              notif.title.includes("Cancelled") ? 'fa-xmark' :
                              notif.title.includes("Delivered") ? 'fa-check' :
                              'fa-info'
                           }`}></i>
                        </div>
                        <div>
                           <h3 className={`font-bold text-base ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                              {notif.title}
                           </h3>
                           <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed">{notif.message}</p>
                           <p className="text-xs text-slate-400 mt-2 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};