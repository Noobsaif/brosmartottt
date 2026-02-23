import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-400 pt-20 pb-24 md:pb-10 border-t border-slate-200 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Brand */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
              <span className="text-3xl font-heading font-bold text-black dark:text-white">
                Bros<span className="text-orange-500">Mart</span>
              </span>
            </Link>
            <p className="text-slate-800 dark:text-slate-400 leading-relaxed">
              Experience the best in digital entertainment. We provide premium OTT subscriptions with instant delivery, secure payments, and uncompromised quality.
            </p>
            <div className="flex gap-4">
              {['facebook-f', 'whatsapp', 'telegram', 'instagram'].map((icon) => (
                <a key={icon} href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-900 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all duration-300 text-slate-700 dark:text-slate-300">
                  <i className={`fa-brands fa-${icon}`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Links 1 */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-black dark:text-white font-bold mb-6 font-heading">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="hover:text-orange-500 transition-colors">All Products</Link></li>
              <li><Link to="/products" className="hover:text-orange-500 transition-colors">Best Sellers</Link></li>
              <li><Link to="/products" className="hover:text-orange-500 transition-colors">New Arrivals</Link></li>
              <li><Link to="/discounts" className="hover:text-orange-500 transition-colors">Discounts</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="md:col-span-2">
            <h4 className="text-black dark:text-white font-bold mb-6 font-heading">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/how-to-buy" className="hover:text-orange-500 transition-colors">How to Buy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-orange-500 transition-colors">Refund Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-black dark:text-white font-bold mb-6 font-heading">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot text-orange-500 mt-1"></i>
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-phone text-orange-500 mt-1"></i>
                <span className="font-mono text-slate-900 dark:text-slate-300">+880 1700-000000</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-envelope text-orange-500 mt-1"></i>
                <span>support@brosmart.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200 dark:border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} BrosMart. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-slate-500">Secured by</span>
            <div className="flex gap-2">
               <i className="fa-brands fa-cc-visa text-slate-900 dark:text-white text-xl"></i>
               <i className="fa-brands fa-cc-mastercard text-slate-900 dark:text-white text-xl"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};