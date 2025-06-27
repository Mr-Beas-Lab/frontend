import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyRole } from '../api/auth';
import { ApiError } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "ambassador" | "superadmin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const verifyUserRole = async () => {
      // Don't proceed if still loading or already verified
      if (isLoading || verificationAttempted) {
        return;
      }

      setIsVerifying(true);
      
      if (!currentUser) {
        setIsVerifying(false);
        setVerificationAttempted(true);
        return;
      }

      try {
        // First check local role
        const hasLocalRole = currentUser.role && allowedRoles.includes(currentUser.role);
        
        // Then verify with backend
        try {
          const response = await verifyRole();
          const hasBackendRole = response.role && allowedRoles.includes(response.role);
          
          if (hasBackendRole) {
            setIsAuthorized(true);
          } else {
            console.warn('Backend role verification failed:', {
              userRole: response.role,
              allowedRoles
            });
            await logout();
            setIsAuthorized(false);
          }
        } catch (apiError: unknown) {
          const error = apiError as ApiError;
          
          if (error.error === 'unauthorized') {
            console.error('API verified user is unauthorized:', error);
            await logout();
            setIsAuthorized(false);
          } else if (error.error === 'network-error') {
            // For network errors, fall back to local role check
            console.warn('Role verification network error, falling back to local role check');
            setIsAuthorized(hasLocalRole);
          } else {
            // For other errors, also fall back to local role check
            console.warn('Role verification API error, falling back to local role check:', error);
            setIsAuthorized(hasLocalRole);
          }
        }
      } catch (error) {
        console.error('Error in role verification:', error);
        await logout();
        setIsAuthorized(false);
      } finally {
        setIsVerifying(false);
        setVerificationAttempted(true);
      }
    };

    verifyUserRole();
  }, [currentUser, isLoading, allowedRoles, logout, verificationAttempted]);

  // Show loading state while authentication is in progress
  if (isLoading || (isVerifying && !verificationAttempted)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to unauthorized page if not authorized
  if (!isAuthorized) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute; 