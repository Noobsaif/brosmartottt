import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { syncUser, notifyLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      await syncUser(token);
      await notifyLogin(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await syncUser(token);
      await notifyLogin(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group">
           <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-arrow-left"></i>
           </div>
           <span className="font-bold text-slate-900 dark:text-white text-sm">Back</span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10">
            <h1 className="text-4xl font-heading font-bold text-black dark:text-white mb-3">Welcome Back</h1>
            <p className="text-slate-800">Enter your credentials to access your account.</p>
          </div>

          {error && <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50 flex items-center gap-2"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}

          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold text-slate-800 dark:text-white"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
              Continue with Google
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">or sign in with email</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="name@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black"
              />
              <div className="space-y-1">
                 <Input 
                   label="Password" 
                   type="password" 
                   placeholder="••••••••" 
                   value={password} 
                   onChange={(e) => setPassword(e.target.value)} 
                   required 
                   className="bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black"
                 />
                 <div className="text-right">
                    <Link to="#" className="text-xs font-semibold text-orange-600 hover:text-orange-700">Forgot password?</Link>
                 </div>
              </div>
              
              <Button type="submit" className="w-full py-4 text-lg rounded-xl shadow-lg shadow-orange-500/20" isLoading={loading}>Log In</Button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-sm mt-8">
            Don't have an account? <Link to="/register" className="font-bold text-black dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors">Create one</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
         
         <div className="relative z-10 max-w-lg">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-3xl mb-8 shadow-glow">
               <i className="fa-solid fa-crown"></i>
            </div>
            <h2 className="text-5xl font-heading font-bold text-white mb-6 leading-tight">Premium Access,<br/>Instant Delivery.</h2>
            <p className="text-xl text-slate-300 leading-relaxed">Join thousands of users who trust BrosMart for their daily entertainment needs. Secure, fast, and reliable.</p>
            
            <div className="mt-12 flex items-center gap-4">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-950"></div>)}
               </div>
               <div className="text-white text-sm font-bold">5000+ Happy Customers</div>
            </div>
         </div>
      </div>
    </div>
  );
};