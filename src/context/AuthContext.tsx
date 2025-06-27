import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth } from "../firebase/firebaseConfig";

// Define AuthUser type
interface AuthUser {
  uid: string;
  email: string;
  role: "admin" | "ambassador" | "superadmin";
  firstName?: string;
  lastName?: string;
  accessToken?: string;
  country?: string;
  countryCode?: string;
}

// Define AuthContext type
interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  setCurrentUser: (user: AuthUser | null) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely store user data
const storeUserData = (userData: AuthUser | null) => {
  if (userData) {
    // Store as plain object
    const plainUserData = {
      uid: userData.uid,
      email: userData.email,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      accessToken: userData.accessToken,
      country: userData.country,
      countryCode: userData.countryCode
    };
    localStorage.setItem('user', JSON.stringify(plainUserData));
  } else {
    localStorage.removeItem('user');
  }
};

// Helper function to safely retrieve user data
const retrieveUserData = (): AuthUser | null => {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    if (!user || !user.uid || !user.email || !user.role) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      role: user.role as "admin" | "ambassador" | "superadmin",
      firstName: user.firstName,
      lastName: user.lastName,
      accessToken: user.accessToken,
      country: user.country,
      countryCode: user.countryCode
    };
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

// Provide context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Custom setCurrentUser that handles storage
  const updateCurrentUser = (user: AuthUser | null) => {
    storeUserData(user);
    setCurrentUser(user);
  };

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true);
      try {
        const user = retrieveUserData();
        const token = localStorage.getItem('accessToken');
        
        if (user && token) {
          updateCurrentUser(user);
        } else {
          updateCurrentUser(null);
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        updateCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserFromStorage();
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          localStorage.setItem('accessToken', token);
          
          // Update user data if needed
          const currentStoredUser = retrieveUserData();
          if (!currentStoredUser || currentStoredUser.uid !== user.uid) {
            updateCurrentUser({
              uid: user.uid,
              email: user.email || '',
              role: 'ambassador', // Default role, should be updated from your backend
              accessToken: token
            });
          }
        } catch (error) {
          console.error("Error updating auth state:", error);
          updateCurrentUser(null);
        }
      } else {
        localStorage.removeItem('accessToken');
        updateCurrentUser(null);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  const logout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      updateCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      logout, 
      setCurrentUser: updateCurrentUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

