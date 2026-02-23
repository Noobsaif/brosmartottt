import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { Button } from './ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadNotifCount } = useData(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Store', path: '/products' },
    { name: 'Guide', path: '/how-to-buy' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`glass rounded-full px-6 py-3 flex justify-between items-center shadow-lg shadow-black/5 dark:shadow-black/20 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80' : 'bg-white/60 dark:bg-slate-950/60'}`}>
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
             <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
             <span className="text-xl font-heading font-bold text-black dark:text-white tracking-tight">
               Bros<span className="text-orange-500">Mart</span>
             </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/50">
             {navLinks.map((link) => (
               <Link 
                 key={link.path}
                 to={link.path} 
                 className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${location.pathname === link.path ? 'bg-white dark:bg-slate-800 text-orange-600 shadow-sm' : 'text-slate-800 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
               >
                 {link.name}
               </Link>
             ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/products"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Search Products"
            >
              <i className="fa-solid fa-search"></i>
            </Link>
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            {user && (
              <Link to="/notifications" className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                 <i className="fa-solid fa-bell"></i>
                 {unreadNotifCount > 0 && (
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-glow"></span>
                 )}
              </Link>
            )}
            
            {!user ? (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-black dark:text-slate-300 hover:text-orange-600 px-2 transition-colors">Log in</Link>
                <Link to="/register">
                  <Button size="sm" className="rounded-full px-6 shadow-orange-500/20">Sign Up</Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-2">
                 <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <div className="flex items-center gap-3 pr-2 pl-1 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                      {user.name.charAt(0)}
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Actions */}
          <div className="md:hidden flex items-center gap-3">
             <Link 
               to="/products"
               className="w-10 h-10 flex items-center justify-center text-black dark:text-white"
             >
               <i className="fa-solid fa-search text-xl"></i>
             </Link>
             <button 
               onClick={toggleTheme}
               className="w-10 h-10 flex items-center justify-center text-black dark:text-white"
             >
               <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
             </button>
             {user && (
              <Link to="/notifications" className="relative w-10 h-10 flex items-center justify-center text-black dark:text-white">
                 <i className="fa-solid fa-bell text-xl"></i>
                 {unreadNotifCount > 0 && (
                   <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-950"></span>
                 )}
              </Link>
            )}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black dark:text-white p-2">
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-24 left-4 right-4 bg-white/90 dark:bg-slate-950/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xl rounded-3xl animate-in slide-in-from-top-4 duration-200 z-50">
           <div className="flex flex-col gap-2">
             {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className="p-4 rounded-2xl hover:bg-orange-50 dark:hover:bg-slate-900 font-bold text-black dark:text-slate-200 flex justify-between items-center transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                  <i className="fa-solid fa-arrow-right text-xs opacity-0 -translate-x-2 hover:opacity-100 hover:translate-x-0 transition-all text-orange-500"></i>
                </Link>
             ))}
             
             <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-2"></div>
             
             {!user ? (
               <div className="grid grid-cols-2 gap-3 mt-2">
                 <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                   <Button variant="secondary" className="w-full justify-center rounded-xl">Log in</Button>
                 </Link>
                 <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                   <Button className="w-full justify-center rounded-xl">Sign Up</Button>
                 </Link>
               </div>
             ) : (
               <>
                 <Link to="/dashboard" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold flex items-center gap-3 text-black dark:text-white" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 text-sm">
                       {user.name.charAt(0)}
                    </div>
                    <span>My Dashboard</span>
                 </Link>
                 
                 {user.role === 'admin' && (
                    <Link to="/admin" className="p-4 rounded-2xl text-orange-600 dark:text-orange-500 font-bold flex justify-between items-center" onClick={() => setIsMenuOpen(false)}>
                       Admin Panel
                       <i className="fa-solid fa-shield-halved"></i>
                    </Link>
                 )}

                 <div className="flex items-center justify-center mt-4">
                   <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-red-500 font-bold text-sm hover:underline flex items-center gap-2">
                      <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
                   </button>
                 </div>
               </>
             )}
           </div>
        </div>
      )}
    </nav>
  );
};