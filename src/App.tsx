import { memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AmbassadorDashboard from "./pages/AmbassadorDashboard";
import LoginPage from "./pages/Login";
import AmbassadorRegister from "./pages/RegisterAmbasador";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import KYCForm from "./components/kyc/KycForm";
import AdminKYCReview from "./pages/AdminKYCReview";
import { useAuth } from "./context/AuthContext";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import { Toaster } from "./components/ui/toaster";
import LoadingSpinner from './components/ui/LoadingSpinner';

// Memoized wrapper component to prevent unnecessary re-renders
const KYCFormWrapper = memo(() => {
  const { currentUser } = useAuth();
  return currentUser ? <KYCForm ambassadorId={currentUser.uid} /> : <Navigate to="/login" replace />;
});

KYCFormWrapper.displayName = 'KYCFormWrapper';

const App = () => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <Router>
          <div className="min-h-screen bg-black text-white">
            <LoadingSpinner fullScreen />
            <Toaster />
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/ambassador-register" element={<AmbassadorRegister />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* KYC Form Route */}
              <Route
                path="/complete-kyc"
                element={
                  <ProtectedRoute allowedRoles={["ambassador"]}>
                    <KYCFormWrapper />
                  </ProtectedRoute>
                }
              />

              {/* Protected routes with role verification */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ambassador-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["ambassador"]}>
                    <AmbassadorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/kyc-review"
                element={
                  <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                    <AdminKYCReview />
                  </ProtectedRoute>
                }
              />
              
              {/* SuperAdmin Dashboard with nested routes */}
              <Route
                path="/superadmin-dashboard/*"
                element={
                  <ProtectedRoute allowedRoles={["superadmin"]}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
};

export default memo(App);