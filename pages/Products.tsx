import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Products: React.FC = () => {
  const { products, loading, wishlist, addToWishlist, removeFromWishlist } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  const filteredProducts = products.filter(p => 
    p.isActive && 
    (p.ottName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.packageName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
           <motion.div 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             className="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-4"
           >
              Official Store
           </motion.div>
           <motion.h1 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-4xl md:text-5xl font-heading font-black text-black dark:text-white mb-6"
           >
             Premium Subscriptions
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-lg text-slate-900 dark:text-slate-400"
           >
             Choose from our verified inventory. Instant delivery enabled for all products marked with <i className="fa-solid fa-bolt text-orange-500"></i>.
           </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-xl mx-auto mb-16 relative"
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-search text-slate-400 group-focus-within:text-orange-500 transition-colors"></i>
            </div>
            <input
              type="text"
              placeholder="Search for Netflix, Spotify, Prime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-black dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
           <div className="flex justify-center items-center py-32">
             <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin"></div>
           </div>
        ) : filteredProducts.length === 0 ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="text-center py-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] border border-slate-200 dark:border-slate-800"
           >
             <div className="text-5xl mb-4">🔍</div>
             <h3 className="text-xl font-bold text-black dark:text-white">No products found</h3>
             <p className="text-slate-700 mt-2">Try adjusting your search query.</p>
           </motion.div>
        ) : (
           <motion.div 
             variants={container}
             initial="hidden"
             animate="show"
             className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
           >
             <AnimatePresence mode="popLayout">
               {filteredProducts.map(product => (
                 <motion.div 
                   variants={item}
                   layout
                   key={product._id} 
                   className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-orange-900/10 hover:-translate-y-1"
                 >
                    <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-950">
                      <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.ottName} />
                      
                      {/* Badge */}
                      <div className="absolute top-4 left-4">
                         <span className="bg-white/95 dark:bg-black/90 backdrop-blur text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                           <i className="fa-regular fa-clock"></i> {product.duration}
                         </span>
                      </div>
                      
                      {/* Wishlist Button */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const isInWishlist = wishlist.some(w => w.productId && w.productId._id === product._id);
                          if (isInWishlist) {
                            removeFromWishlist(product._id);
                          } else {
                            addToWishlist(product._id);
                          }
                        }}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-10"
                      >
                        <i className={`fa-${wishlist.some(w => w.productId && w.productId._id === product._id) ? 'solid text-red-500' : 'regular text-slate-400 hover:text-red-500'} fa-heart text-lg`}></i>
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                       <div className="mb-4">
                         <h3 className="text-xl font-bold text-black dark:text-white group-hover:text-orange-600 transition-colors">{product.ottName}</h3>
                         <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-400">{product.packageName}</p>
                            {product.averageRating && product.averageRating > 0 ? (
                               <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-md">
                                  <i className="fa-solid fa-star"></i> {product.averageRating}
                               </div>
                            ) : null}
                         </div>
                       </div>
                       
                       <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div>
                             <span className="block text-xs text-slate-400 uppercase font-bold">Price</span>
                             <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-heading font-bold text-black dark:text-white">৳{product.offerPrice}</span>
                                {product.price > product.offerPrice && (
                                   <span className="text-xs text-slate-400 line-through">৳{product.price}</span>
                                )}
                             </div>
                          </div>
                          <Link to={`/products/${product._id}`}>
                            <Button size="sm" className="rounded-xl">
                              Buy Now <i className="fa-solid fa-arrow-right ml-2"></i>
                            </Button>
                          </Link>
                       </div>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
           </motion.div>
        )}
      </div>
    </motion.div>
  );
};