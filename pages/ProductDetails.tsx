import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Product, FlashSale, Review, API_URL } from '../types';
import { motion } from 'framer-motion';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, flashSales, wishlist, addToWishlist, removeFromWishlist } = useData();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [activeFlashSale, setActiveFlashSale] = useState<FlashSale | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0 && id) {
       const found = products.find(p => p._id === id);
       setProduct(found || null);

       const sale = flashSales.find(fs => fs.productId._id === id && fs.isActive && new Date(fs.endTime) > new Date());
       setActiveFlashSale(sale || null);
       setLoading(false);
    }
  }, [id, products, flashSales]);

  useEffect(() => {
    if (id) {
       fetch(`${API_URL}/reviews/${id}`)
         .then(res => res.json())
         .then(data => {
           if(Array.isArray(data)) setReviews(data);
         })
         .catch(() => {});
    }
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center dark:text-white">Product not found.</div>;

  const price = activeFlashSale ? activeFlashSale.salePrice : product.offerPrice;
  const oldPrice = activeFlashSale ? product.offerPrice : product.price;
  
  const isInWishlist = wishlist.some(w => w.productId && w.productId._id === product._id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-800 mb-8">
           <Link to="/" className="hover:text-orange-500">Home</Link>
           <i className="fa-solid fa-chevron-right text-xs"></i>
           <Link to="/products" className="hover:text-orange-500">Store</Link>
           <i className="fa-solid fa-chevron-right text-xs"></i>
           <span className="text-slate-900 dark:text-white font-medium">{product.ottName}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
           {/* Image Gallery */}
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="space-y-4"
           >
              <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg aspect-[4/3]">
                 <img src={product.imageUrl} alt={product.ottName} className="w-full h-full object-cover" />
                 {activeFlashSale && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                       ⚡ Flash Sale
                    </div>
                 )}
              </div>
           </motion.div>

           {/* Product Info */}
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex flex-col"
           >
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-2">{product.ottName}</h1>
              <p className="text-xl text-slate-800 dark:text-slate-400 mb-6">{product.packageName} - {product.duration}</p>

              <div className="flex items-center gap-4 mb-8">
                 <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg border border-orange-100 dark:border-orange-900/30">
                    <i className="fa-solid fa-star text-orange-500 text-sm"></i>
                    <span className="font-bold text-black dark:text-white">{product.averageRating || 0}</span>
                    <span className="text-slate-800 text-xs">({product.reviewCount || 0} reviews)</span>
                 </div>
                 <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                 <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                    <i className="fa-solid fa-check-circle"></i> Instant Delivery
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
                 <div className="flex items-end gap-3 mb-2">
                    <span className="text-5xl font-heading font-bold text-black dark:text-white">৳{price}</span>
                    {oldPrice > price && (
                       <span className="text-xl text-slate-400 line-through mb-2">৳{oldPrice}</span>
                    )}
                 </div>
                 <p className="text-slate-800 text-sm">Includes all taxes & fees. No hidden charges.</p>
              </div>

              <div className="space-y-6 mb-8 flex-1">
                 <div>
                    <h3 className="font-bold text-black dark:text-white mb-3 text-lg">Description</h3>
                    <p className="text-slate-900 dark:text-slate-300 leading-relaxed">
                       {product.description || "Get premium access to your favorite entertainment platform. Enjoy high-quality streaming, ad-free experience, and offline downloads."}
                    </p>
                 </div>
                 
                 {product.features && product.features.length > 0 && (
                    <div>
                       <h3 className="font-bold text-black dark:text-white mb-3 text-lg">Key Features</h3>
                       <ul className="grid sm:grid-cols-2 gap-3">
                          {product.features.map((feature, i) => (
                             <li key={i} className="flex items-center gap-3 text-black dark:text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 text-xs shrink-0">
                                   <i className="fa-solid fa-check"></i>
                                </div>
                                {feature}
                             </li>
                          ))}
                       </ul>
                    </div>
                 )}
              </div>

              <div className="flex gap-4">
                 <Link to={`/checkout/${product._id}`} className="flex-1">
                    <Button size="lg" className="w-full py-4 text-lg rounded-xl shadow-lg shadow-orange-500/20">
                       Buy Now <i className="fa-solid fa-arrow-right ml-2"></i>
                    </Button>
                 </Link>
                 <Button 
                   size="lg" 
                   variant="secondary" 
                   className={`px-6 rounded-xl border ${isInWishlist ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30' : 'text-slate-500 hover:text-red-500'}`}
                   onClick={() => isInWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                 >
                   <i className={`fa-${isInWishlist ? 'solid' : 'regular'} fa-heart text-xl`}></i>
                 </Button>
              </div>
           </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Customer Reviews</h2>
           </div>
           <div className="p-8">
              {reviews.length === 0 ? (
                 <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-2xl mx-auto mb-4">
                       <i className="fa-regular fa-comment-dots"></i>
                    </div>
                    <p className="text-slate-500">No reviews yet. Buy this product and be the first to review!</p>
                 </div>
              ) : (
                 <div className="grid md:grid-cols-2 gap-8">
                    {reviews.map(review => (
                       <div key={review._id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                          <div className="flex justify-between items-start mb-4">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
                                   {review.userName.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-bold text-slate-900 dark:text-white">{review.userName}</p>
                                   <div className="flex text-orange-400 text-xs">
                                      {[1,2,3,4,5].map(star => (
                                         <i key={star} className={`fa-solid fa-star ${star <= review.rating ? '' : 'text-slate-300 dark:text-slate-600'}`}></i>
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{review.comment}</p>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
