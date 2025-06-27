import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, currentUser } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && !isLoading && !redirecting) {
      redirectToDashboard();
    }
  }, [currentUser, isLoading]);

  const redirectToDashboard = async () => {
    setRedirecting(true);
    setError(null);
    
    try {
      if (!currentUser) {
        setError("Please log in first");
        setRedirecting(false);
        return;
      }
      
      let path = "/login"; // Default fallback
      
      switch (currentUser.role) {
        case "superadmin":
          path = "/superadmin-dashboard";
          break;
        case "admin":
          path = "/admin-dashboard";
          break;
        case "ambassador":
          path = "/ambassador-dashboard";
          break;
        default:
          setError(`Invalid role: ${currentUser.role}`);
          setRedirecting(false);
          return;
      }
      
      navigate(path);
    } catch (error) {
      setError("Something went wrong. Please try logging in again.");
    } finally {
      setRedirecting(false);
    }
  };

  const handleLoginSuccess = () => {
    setTimeout(() => {
      redirectToDashboard();
    }, 300);
  };

  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;