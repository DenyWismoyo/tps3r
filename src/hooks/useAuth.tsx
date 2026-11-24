'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function checkIsAdminUser(firebaseUser: User): Promise<boolean> {
  try {
    const tokenResult = await firebaseUser.getIdTokenResult();
    if (tokenResult.claims.admin === true) {
      return true;
    }

    const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
    if (adminSnap.exists()) {
      const data = adminSnap.data();
      return data.isActive !== false;
    }
    return false;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const adminOk = await checkIsAdminUser(nextUser);
        setIsAdmin(adminOk);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const adminOk = await checkIsAdminUser(credential.user);
    if (!adminOk) {
      await signOut(auth);
      throw new Error(
        'Akun belum terdaftar sebagai pengurus TPS 3R. Hubungi administrator untuk aktivasi UID di koleksi admins.'
      );
    }
    setIsAdmin(true);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }
  return ctx;
}
