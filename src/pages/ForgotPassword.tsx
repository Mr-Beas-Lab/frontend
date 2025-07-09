import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios";
import config from "../api/config";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    // Trim email to remove any accidental whitespace
    const trimmedEmail = email.trim();

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/forgot-password`, {
        email: trimmedEmail
      });
      
      setMessage("Password reset link sent! Please check your email inbox and spam folder.");
    } catch (err: any) {
      if (err.response?.data?.message) {
        setMessage(err.response.data.message);
      } else if (err.response?.status === 400) {
            setError("Please enter a valid email address");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection");
      } else {
        setError("An unexpected error occurred. Please try again");
        console.error("Password reset error:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (!validateEmail(email.trim()) || isSubmitting) return;
    
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/auth/forgot-password`, {
        email: email.trim()
      });
      
      setMessage("Password reset link resent! Please check your email inbox and spam folder.");
    } catch (err: any) {
      setError("Failed to resend reset link. Please try again");
      console.error("Resend error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full border border-gray-800 p-8 rounded-lg shadow-[0_0_20px_10px_rgba(0,0,0,0.1)]">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Email address"
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <div className="rounded-md bg-green-900/30 p-4 border border-green-900/50">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-400">{message}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-900/30 p-4 border border-red-900/50">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Send reset link"
              )}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 text-center">
            <button
              onClick={handleResendEmail}
              disabled={isSubmitting}
              className="text-sm font-medium text-primary hover:text-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Didn't receive the email? Click to resend
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;