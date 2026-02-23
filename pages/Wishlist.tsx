import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, loading } = useData();

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-8">My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-3xl mx-auto mb-6">
              <i className="fa-regular fa-heart"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Explore our store and find something you love. Add items to your wishlist to easily find them later.</p>
            <Link to="/products">
              <Button size="lg">Browse Store</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.productId;
              if (!product) return null; // In case product was deleted
              
              return (
                <motion.div 
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={product.ottName} />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWishlist(product._id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 text-red-500 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{product.ottName}</h3>
                    <p className="text-sm text-slate-500 mb-4">{product.packageName} - {product.duration}</p>
                    <div className="flex justify-between items-center mb-6 mt-auto">
                      <span className="font-mono font-bold text-orange-600 text-lg">৳{product.offerPrice}</span>
                      {product.price > product.offerPrice && (
                        <span className="text-xs text-slate-400 line-through">৳{product.price}</span>
                      )}
                    </div>
                    <Link to={`/checkout/${product._id}`} className="w-full">
                      <Button className="w-full">Checkout Now</Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
