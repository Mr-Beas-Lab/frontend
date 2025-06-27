import { useAuth } from "../context/AuthContext";  
import { LogOut, Home, Users, FileText } from "lucide-react";  
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const { logout, currentUser } = useAuth();  
  const [needsKYC, setNeedsKYC] = useState(false);

  // Determine user role for conditional rendering
  const isAdmin = currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAmbassador = currentUser?.role === 'ambassador';

  useEffect(() => {
    const checkKYCStatus = async () => {
      if (isAmbassador && currentUser?.uid) {
        try {
          const kycDocRef = doc(db, "kycApplication", currentUser.uid);
          const kycDoc = await getDoc(kycDocRef);
          
          if (kycDoc.exists()) {
            const kycData = kycDoc.data();
            setNeedsKYC(kycData.status !== 'approved');
          } else {
            // If no KYC application exists, they need to complete it
            setNeedsKYC(true);
          }
        } catch (error) {
          console.error("Error checking KYC status:", error);
          setNeedsKYC(true);
        }
      }
    };

    checkKYCStatus();
  }, [currentUser?.uid, isAmbassador]);

  return (
    <nav className="bg-(--color-primary) p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">MRB Fiat Dashboard</h1>
        
        {/* Navigation Links */}
        {currentUser && (
          <div className="flex items-center space-x-6">
            {/* Regular Admin Links */}
            {isAdmin && (
              <>
                <Link to="/admin-dashboard" className="flex items-center text-white hover:text-gray-300">
                  <Home className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <Link to="/admin/kyc-review" className="flex items-center text-white hover:text-gray-300">
                  <FileText className="w-4 h-4 mr-1" />
                  KYC Review
                </Link>
              </>
            )}
            
            {/* Super Admin Links */}
            {isSuperAdmin && (
              <Link to="/superadmin-dashboard" className="flex items-center text-white hover:text-gray-300">
                <Users className="w-4 h-4 mr-1" />
                Super Admin
              </Link>
            )}
            
            {/* Ambassador Links */}
            {isAmbassador && (
              <>
                <Link to="/ambassador-dashboard" className="flex items-center text-white hover:text-gray-300">
                  <Home className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                {needsKYC && (
                  <Link to="/complete-kyc" className="flex items-center text-white hover:text-gray-300">
                    <FileText className="w-4 h-4 mr-1" />
                    Complete KYC
                  </Link>
                )}
              </>
            )}
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center text-white hover:text-gray-300"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;