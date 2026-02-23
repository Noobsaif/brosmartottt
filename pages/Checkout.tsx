import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Product, FlashSale, Review, API_URL } from '../types';
import { motion } from 'framer-motion';

export const Checkout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { products, flashSales, verifyCoupon, addOrder, addReview } = useData();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [activeFlashSale, setActiveFlashSale] = useState<FlashSale | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Review State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    // Look up product in global context instead of fetching locally
    if (products.length > 0 && id) {
       const found = products.find(p => p._id === id);
       setProduct(found || null);

       // Check if this product has an active flash sale
       const sale = flashSales.find(fs => fs.productId._id === id && fs.isActive && new Date(fs.endTime) > new Date());
       setActiveFlashSale(sale || null);
    }
  }, [id, products, flashSales]);

  useEffect(() => {
    if (id) {
       fetch(`${API_URL}/reviews/${id}`).then(res => res.json()).then(data => {
         if(Array.isArray(data)) setReviews(data);
       }).catch(() => {});
    }
  }, [id]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !id) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const result = await verifyCoupon(couponCode, id);
      if (result.valid) {
        setDiscountAmount(result.discountAmount);
        setCouponApplied(couponCode.toUpperCase());
        setCouponError('');
      } else {
        setCouponError(result.message || 'Invalid coupon');
      }
    } catch (err) {
      setCouponError('Failed to verify coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setLoading(true);
    
    // Construct Order Payload
    const orderPayload = {
      productId: id,
      paymentMethod,
      transactionId,
      phone,
      couponCode: couponApplied || undefined,
      userUid: user?.uid,
      email: user?.email,
      productId_populated: product // Used for display in offline mode
    };

    const success = await addOrder(orderPayload);
    
    if (success) {
      navigate('/dashboard');
    } else {
      alert("Order failed. Please try again.");
    }
    setLoading(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setReviewSubmitting(true);
    const success = await addReview(id, userRating, userComment);
    if (success) {
       fetch(`${API_URL}/reviews/${id}`).then(res => res.json()).then(setReviews);
       setUserComment('');
       setUserRating(5);
    } else {
       alert("Failed to post review. You may have already reviewed this product.");
    }
    setReviewSubmitting(false);
  };

  if (!products.length) return <div className="p-10 text-center dark:text-white">Loading store...</div>;
  if (!product) return <div className="p-10 text-center dark:text-white">Product not found in inventory.</div>;
  
  // Determine base price (Flash Sale or Regular Offer)
  const basePrice = activeFlashSale ? activeFlashSale.salePrice : product.offerPrice;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 dark:text-white mb-8"
        >
          Checkout
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
             <h2 className="text-lg font-semibold dark:text-white">Order Summary</h2>
             {activeFlashSale && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                   ⚡ Flash Sale Active
                </span>
             )}
          </div>
          <div className="p-6">
             <div className="flex items-center gap-4 mb-6">
               <img src={product.imageUrl} alt={product.ottName} className="w-16 h-16 rounded-lg object-cover" />
               <div className="flex-1">
                 <p className="font-bold text-slate-900 dark:text-white">{product.ottName}</p>
                 <p className="text-sm text-slate-500 dark:text-slate-400">{product.packageName} - {product.duration}</p>
                 <div className="flex items-center gap-1 mt-1">
                    <i className="fa-solid fa-star text-orange-400 text-xs"></i>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{product.averageRating || 0}</span>
                    <span className="text-xs text-slate-400">({product.reviewCount || 0} reviews)</span>
                 </div>
               </div>
               <div className="text-right">
                  {(discountAmount > 0 || activeFlashSale) && <p className="text-sm text-slate-400 line-through">৳{product.offerPrice}</p>}
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">৳{finalPrice}</p>
               </div>
             </div>

             {/* Coupon Input */}
             <div className="flex gap-2 items-start max-w-sm">
                <div className="flex-1">
                  <Input 
                    label="Have a Coupon?" 
                    placeholder="Enter code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!couponApplied}
                    className="py-2"
                  />
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  {couponApplied && <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-bold">Coupon Applied: -৳{discountAmount}</p>}
                </div>
                <div className="mt-7">
                  {couponApplied ? (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="py-2.5 text-xs bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400"
                      onClick={() => { setCouponApplied(''); setDiscountAmount(0); setCouponCode(''); }}
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="py-2.5 text-xs dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      onClick={handleApplyCoupon}
                      isLoading={couponLoading}
                    >
                      Apply
                    </Button>
                  )}
                </div>
             </div>
          </div>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-12"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold dark:text-white">Payment Details</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please send money to <span className="font-mono bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1 rounded">01700000000</span> (Personal)</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-3">Select Method</label>
              <div className="grid grid-cols-3 gap-4">
                {['bkash', 'nagad', 'rocket'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method as any)}
                    className={`py-3 px-4 rounded-xl border font-medium capitalize transition-all ${
                      paymentMethod === method 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 ring-1 ring-orange-500' 
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-200 dark:hover:border-orange-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <Input 
              label="Contact Number" 
              placeholder="01XXXXXXXXX" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Input 
              label="Transaction ID (TrxID)" 
              placeholder="e.g. 9G7D5..." 
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
            />
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex justify-end items-center gap-4">
            <p className="text-slate-600 dark:text-slate-300 text-sm">Total to Pay: <span className="font-bold text-slate-900 dark:text-white text-lg">৳{finalPrice}</span></p>
            <Button type="submit" isLoading={loading} className="w-full sm:w-auto">Confirm Order</Button>
          </div>
        </motion.form>

        {/* --- REVIEWS SECTION --- */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
           <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold dark:text-white">Customer Reviews</h2>
              <div className="flex items-center gap-2 mt-2">
                 <div className="flex text-orange-400 text-sm">
                    {[1,2,3,4,5].map(star => (
                       <i key={star} className={`fa-solid fa-star ${star <= (product.averageRating || 0) ? '' : 'text-slate-300 dark:text-slate-700'}`}></i>
                    ))}
                 </div>
                 <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{product.averageRating || 0} out of 5</span>
                 <span className="text-sm text-slate-500">({product.reviewCount || 0} ratings)</span>
              </div>
           </div>

           <div className="p-6">
              {/* Review Form */}
              <form onSubmit={handleReviewSubmit} className="mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                 <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Write a Review</h3>
                 <div className="flex gap-2 mb-4">
                    {[1,2,3,4,5].map(star => (
                       <button 
                         key={star} 
                         type="button" 
                         onClick={() => setUserRating(star)}
                         className={`text-xl transition-colors ${star <= userRating ? 'text-orange-400' : 'text-slate-300 dark:text-slate-600'}`}
                       >
                          <i className="fa-solid fa-star"></i>
                       </button>
                    ))}
                 </div>
                 <textarea 
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    rows={3}
                    placeholder="Share your experience..."
                    value={userComment}
                    onChange={e => setUserComment(e.target.value)}
                    required
                 ></textarea>
                 <div className="mt-3 text-right">
                    <Button type="submit" size="sm" isLoading={reviewSubmitting}>Post Review</Button>
                 </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-6">
                 {reviews.length === 0 ? (
                    <p className="text-center text-slate-500 py-4">No reviews yet. Be the first to review!</p>
                 ) : (
                    reviews.map(review => (
                       <div key={review._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-6 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs">
                                   {review.userName.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-bold text-sm text-slate-900 dark:text-white">{review.userName}</p>
                                   <div className="flex text-orange-400 text-xs">
                                      {[1,2,3,4,5].map(star => (
                                         <i key={star} className={`fa-solid fa-star ${star <= review.rating ? '' : 'text-slate-200 dark:text-slate-700'}`}></i>
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-11">{review.comment}</p>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};