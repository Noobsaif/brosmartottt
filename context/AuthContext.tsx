import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../firebase';
import { User, API_URL } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: 'user' | 'admin' | null;
  syncUser: (token: string) => Promise<void>;
  notifyLogin: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = "samyalhassan807@gmail.com";

  const notifyLogin = async (token: string) => {
    try {
      const headers: any = { 'Authorization': `Bearer ${token}` };
      if (auth.currentUser) {
        headers['X-User-Uid'] = auth.currentUser.uid;
        headers['X-User-Email'] = auth.currentUser.email || '';
        headers['X-User-Name'] = auth.currentUser.displayName || 'User';
      }

      await fetch(`${API_URL}/auth/login-notify`, {
        method: 'POST',
        headers: headers
      });
    } catch (e) {
      console.warn("Failed to send login notification", e);
    }
  };

  const syncUser = async (token: string) => {
    try {
      // Use a timeout for the fetch to avoid hanging indefinitely if backend is stuck
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Send user details as fallback headers for preview environment
      if (auth.currentUser) {
        headers['X-User-Uid'] = auth.currentUser.uid;
        headers['X-User-Email'] = auth.currentUser.email || '';
        headers['X-User-Name'] = auth.currentUser.displayName || 'User';
      }

      const res = await fetch(`${API_URL}/auth/sync`, {
        method: 'POST',
        headers: headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        throw new Error('Sync failed with status: ' + res.status);
      }
    } catch (error) {
      // Log as warning instead of error to reduce console noise during dev/offline
      console.warn('Backend sync unavailable (Offline Mode):', error);
      
      // Fallback: Construct user from Firebase token
      if (auth.currentUser) {
         const email = auth.currentUser.email || '';
         // Strict Admin Check
         const isAdmin = email === ADMIN_EMAIL;
         
         setUser({
           uid: auth.currentUser.uid,
           name: auth.currentUser.displayName || 'User',
           email: email,
           role: isAdmin ? 'admin' : 'user', 
           createdAt: new Date().toISOString()
         });
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await syncUser(token);
        } catch (e) {
          console.warn("Auth state change error:", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, role: user?.role || null, syncUser, notifyLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};