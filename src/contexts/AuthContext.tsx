import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { User as FirebaseUser } from 'firebase/auth';

interface User {
  uid: string;
  email: string | null;
  superadmin: boolean;
  admin: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Get the ID token to access custom claims
          const idTokenResult = await firebaseUser.getIdTokenResult();
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            superadmin: idTokenResult.claims.superadmin === true,
            admin: idTokenResult.claims.admin === true,
            role: idTokenResult.claims.role as string,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Authentication error'));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}; 