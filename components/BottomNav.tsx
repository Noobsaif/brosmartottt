import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { name: 'Store', path: '/products', icon: 'fa-shop' },
    { name: 'Home', path: user && user.role === 'admin' ? '/admin' : '/dashboard', icon: 'fa-house' },
    { name: 'Wishlist', path: '/wishlist', icon: 'fa-heart' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 md:hidden">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isHome = item.name === 'Home';
          
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-orange-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <div className={`flex items-center justify-center ${isHome ? 'w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg -mt-6 border-4 border-white dark:border-slate-950' : 'text-xl mb-1'}`}>
                <i className={`fa-solid ${item.icon} ${isHome ? 'text-xl' : ''}`}></i>
              </div>
              {!isHome && <span className="text-[10px] font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
