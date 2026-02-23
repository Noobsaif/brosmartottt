import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { syncUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const token = await userCredential.user.getIdToken();
      await syncUser(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
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
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Left Side - Visual (Flipped for Register) */}
      <div className="hidden lg:flex w-1/2 bg-orange-950 relative overflow-hidden items-center justify-center p-12 order-2 lg:order-1">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593784653277-e4329381c815?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-orange-900/50 to-slate-950"></div>
         
         <div className="relative z-10 max-w-lg text-center">
            <h2 className="text-5xl font-heading font-bold text-white mb-6">Start Your Journey</h2>
            <p className="text-xl text-orange-100 leading-relaxed">Create an account today to unlock exclusive flash sales, track your orders, and get 24/7 support.</p>
            <div className="mt-10 inline-block px-8 py-3 rounded-full border border-orange-500/50 bg-orange-500/10 backdrop-blur text-orange-400 font-bold tracking-widest uppercase text-sm">
               Join the Community
            </div>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative order-1 lg:order-2">
        <Link to="/" className="absolute top-8 right-8 flex items-center gap-2 group">
           <span className="font-bold text-slate-900 dark:text-white text-sm">Cancel</span>
           <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center text-sm font-bold group-hover:rotate-90 transition-transform">
              <i className="fa-solid fa-xmark"></i>
           </div>
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-heading font-bold text-black dark:text-white mb-3">Create Account</h1>
            <p className="text-slate-800">Sign up in seconds. No credit card required.</p>
          </div>

          {error && <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/50">{error}</div>}

          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold text-slate-800 dark:text-white"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
              Sign up with Google
            </button>
            
            <div className="relative flex items-center py-2">
               <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
               <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold tracking-wider">or continue with email</span>
               <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <Input 
                label="Full Name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black"
              />
              <Input 
                label="Email" 
                type="email" 
                placeholder="john@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black"
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="Min 8 characters" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-slate-50 dark:bg-slate-900 border-transparent focus:bg-white dark:focus:bg-black"
              />
              
              <Button type="submit" className="w-full py-4 text-lg rounded-xl shadow-lg shadow-orange-500/20" isLoading={loading}>Get Started</Button>
            </form>
          </div>

          <p className="text-center text-slate-500 text-sm mt-8">
            Already have an account? <Link to="/login" className="font-bold text-black dark:text-white hover:text-orange-600 dark:hover:text-orange-500 transition-colors">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};