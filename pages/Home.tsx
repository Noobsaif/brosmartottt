import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';

export const Home: React.FC = () => {
  const { products, loading, flashSales, wishlist, addToWishlist, removeFromWishlist } = useData();
  // Sort by rating or review count for "Trending"
  const displayProducts = [...products]
    .filter(p => p.isActive)
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 3);
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);

  useEffect(() => {
    if(flashSales.length > 0) {
       const timer = setInterval(() => {
          const sale = flashSales[0];
          if(sale) {
             const diff = new Date(sale.endTime).getTime() - new Date().getTime();
             if(diff > 0) {
               setTimeLeft({
                  h: Math.floor(diff / (1000 * 60 * 60)),
                  m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                  s: Math.floor((diff % (1000 * 60)) / 1000)
               });
             } else { setTimeLeft(null); }
          }
       }, 1000);
       return () => clearInterval(timer);
    }
  }, [flashSales]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-24 lg:pt-52 lg:pb-40 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
           <div className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-900/10 rounded-full blur-[100px]"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-10 mix-blend-overlay"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:w-1/2 text-center lg:text-left z-10"
            >
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-lg shadow-orange-500/5 mb-8">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </span>
                <span className="text-sm font-bold text-black dark:text-slate-200 tracking-wide">Premium Digital Store</span>
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-heading font-black text-black dark:text-white leading-[1] mb-8 tracking-tighter">
                Upgrade <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 relative">
                  Your Life
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-orange-500 opacity-80" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.0832 2.83331 77.5002 -2.50003 198.001 4.49997" stroke="currentColor" strokeWidth="3"/></svg>
                </span>
              </h1>
              
              <p className="text-xl text-slate-900 dark:text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Authentic subscriptions for Netflix, Spotify, Prime & more. Instant delivery via automated systems. Pay securely with bKash.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <Link to="/products">
                  <Button size="lg" className="w-full sm:w-auto px-12 py-4 text-lg rounded-full shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-transform">
                    Explore Store
                  </Button>
                </Link>
                <Link to="/how-to-buy">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto px-10 py-4 text-lg rounded-full border-2 hover:border-slate-300 dark:hover:border-slate-600 bg-transparent backdrop-blur-sm">
                    How It Works
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 relative"
            >
               {/* Hero Floating Cards */}
               <div className="relative z-10 w-full max-w-lg mx-auto animate-float">
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-red-600 rounded-[3rem] rotate-6 opacity-30 blur-2xl"></div>
                  <div className="bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4 pt-8">
                           <div className="bg-slate-900 dark:bg-black rounded-2xl p-4 shadow-lg border border-slate-800 transform rotate-[-4deg] hover:rotate-0 transition-transform duration-300">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png" className="h-8 object-contain mb-2 opacity-90" />
                              <p className="text-slate-400 text-xs">Premium 4K</p>
                              <p className="text-white font-bold text-lg">৳250 <span className="text-xs line-through opacity-50">৳450</span></p>
                           </div>
                           <div className="bg-green-950 dark:bg-black rounded-2xl p-4 shadow-lg border border-slate-800 transform rotate-[2deg] hover:rotate-0 transition-transform duration-300">
                              <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" className="h-8 object-contain mb-2" />
                              <p className="text-slate-400 text-xs">Individual</p>
                              <p className="text-white font-bold text-lg">৳120</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div className="bg-blue-950 dark:bg-black rounded-2xl p-4 shadow-lg border border-slate-800 transform rotate-[4deg] hover:rotate-0 transition-transform duration-300">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/2560px-Amazon_Prime_Video_logo.svg.png" className="h-6 object-contain mb-4 filter invert" />
                              <p className="text-slate-400 text-xs">Private Profile</p>
                              <p className="text-white font-bold text-lg">৳150</p>
                           </div>
                           <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 shadow-lg flex flex-col justify-center items-center text-center transform rotate-[-2deg]">
                              <i className="fa-solid fa-bolt text-3xl text-white mb-2 animate-pulse"></i>
                              <p className="text-white font-bold text-lg leading-tight">Instant<br/>Delivery</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FLASH SALES --- */}
      {flashSales.length > 0 && (
         <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-900 dark:bg-black skew-y-3 transform origin-top-left scale-110"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                  <div>
                     <div className="flex items-center gap-3 mb-2 text-orange-500 font-bold tracking-widest uppercase text-sm">
                        <span className="w-8 h-[2px] bg-orange-500"></span> Live Offers
                     </div>
                     <h2 className="text-4xl md:text-5xl font-heading font-bold text-white">Flash Deals ⚡</h2>
                  </div>
                  {timeLeft && (
                     <div className="flex gap-3 text-white">
                        {['h', 'm', 's'].map((unit, i) => (
                           <div key={unit} className="text-center">
                              <div className="bg-slate-800 border border-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-mono font-bold shadow-lg">
                                 {timeLeft[unit as keyof typeof timeLeft].toString().padStart(2, '0')}
                              </div>
                              <span className="text-xs uppercase text-slate-500 mt-2 font-bold block">{unit === 'h' ? 'Hours' : unit === 'm' ? 'Mins' : 'Secs'}</span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {flashSales.map(fs => (
                     <Link to={`/products/${fs.productId._id}`} key={fs._id} className="group relative bg-slate-800 rounded-[2rem] border border-slate-700 overflow-hidden hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20">
                        <div className="absolute top-0 right-0 bg-red-600 text-white font-bold px-4 py-2 rounded-bl-2xl z-20">
                           -{Math.round(((fs.productId?.offerPrice - fs.salePrice) / fs.productId?.offerPrice) * 100)}% OFF
                        </div>
                        <div className="h-56 overflow-hidden relative">
                           <img src={fs.productId?.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1" />
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
                        </div>
                        <div className="p-6 relative -mt-12">
                           <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white text-xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                              <i className="fa-solid fa-fire"></i>
                           </div>
                           <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">{fs.productId?.ottName}</h3>
                           <p className="text-slate-400 mb-6">{fs.productId?.packageName}</p>
                           <div className="flex justify-between items-center border-t border-slate-700 pt-4">
                              <div>
                                 <span className="text-3xl font-heading font-bold text-white">৳{fs.salePrice}</span>
                                 <span className="text-sm text-slate-500 line-through ml-2">৳{fs.productId?.offerPrice}</span>
                              </div>
                              <span className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                                 <i className="fa-solid fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform"></i>
                              </span>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            </div>
         </section>
      )}

      {/* --- WHY US (Dark Section) --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-900/50 skew-x-12"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto">
               <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-heading font-bold text-black dark:text-white mb-6">Why we are the <span className="text-orange-500">#1 Choice?</span></h2>
                  <p className="text-slate-800 dark:text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                     We don't just sell accounts; we provide a reliable service. With automated delivery systems and dedicated support, your entertainment is guaranteed.
                  </p>
               </div>
               <ul className="grid md:grid-cols-3 gap-8">
                  {[
                     { title: "Instant Delivery", desc: "Credentials sent to your dashboard within seconds.", icon: "fa-bolt" },
                     { title: "Official Payments", desc: "Secure bKash & Nagad merchant payments.", icon: "fa-shield-halved" },
                     { title: "Warranty Support", desc: "Full term warranty with instant replacements.", icon: "fa-headset" }
                  ].map((item, i) => (
                     <li key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-orange-500/30 transition-colors shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-orange-500 text-2xl mb-6 shadow-lg shadow-orange-500/10">
                           <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <h4 className="text-black dark:text-white font-bold text-xl mb-3">{item.title}</h4>
                        <p className="text-slate-700 dark:text-slate-500 leading-relaxed">{item.desc}</p>
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </section>

      {/* --- TRENDING PRODUCTS --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-2xl mx-auto mb-16">
             <h2 className="text-4xl font-heading font-bold text-black dark:text-white mb-4">Trending Now</h2>
             <p className="text-slate-800 dark:text-slate-400 text-lg">Top rated subscriptions chosen by our community.</p>
           </div>

           {displayProducts.length > 0 ? (
             <div className="grid md:grid-cols-3 gap-8">
                {displayProducts.map((product) => (
                  <Link to={`/products/${product._id}`} key={product._id} className="group relative">
                     <div className="absolute inset-0 bg-orange-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-4 h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-2">
                        <div className="relative h-64 rounded-[1.5rem] overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800">
                           <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                           <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                             {product.duration}
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
                             <i className={`fa-${wishlist.some(w => w.productId && w.productId._id === product._id) ? 'solid text-red-500' : 'regular text-slate-500 hover:text-red-500'} fa-heart text-lg`}></i>
                           </button>
                        </div>
                        <div className="px-2 pb-2 flex-1 flex flex-col">
                           <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-1 group-hover:text-orange-600 transition-colors">{product.ottName}</h3>
                           <p className="text-slate-600 dark:text-slate-500 text-sm mb-4">{product.packageName}</p>
                           <div className="mt-auto flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Price</span>
                                 <span className="text-2xl font-heading font-bold text-slate-950 dark:text-white">৳{product.offerPrice}</span>
                              </div>
                              <Button className="rounded-xl px-6 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-none group-hover:shadow-lg group-hover:shadow-orange-500/30">
                                 Buy
                              </Button>
                           </div>
                        </div>
                     </div>
                  </Link>
                ))}
             </div>
           ) : (
             <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No trending products at the moment.</p>
             </div>
           )}
           
           <div className="text-center mt-16">
              <Link to="/products">
                 <Button variant="outline" size="lg" className="rounded-full px-10 border-2 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black">
                    View Full Catalog
                 </Button>
              </Link>
           </div>
        </div>
      </section>

    </div>
  );
};