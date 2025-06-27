import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  requiredRole: "admin" | "ambassador" | "superadmin";
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    console.log("ProtectedRoute - Redirecting to login (no user)");
    return <Navigate to="/login" replace />;
  }

  console.log(`ProtectedRoute - Current User Role: ${currentUser.role}, Required Role: ${requiredRole}`); // Debugging

  if (currentUser.role !== requiredRole) {
    console.log(`ProtectedRoute - Invalid role (${currentUser.role}). Redirecting...`);

    // Redirect based on the user's role
    switch (currentUser.role) {
      case "superadmin":
        return <Navigate to="/superadmin-dashboard" replace />;
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      case "ambassador":
        return <Navigate to="/ambassador-dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;