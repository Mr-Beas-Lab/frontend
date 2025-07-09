import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = memo(({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const { setLoading } = useLoading();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ email, password });
      if (!response.uid || !response.accessToken) {
        throw new Error('Invalid response from server');
      }

      const userData = {
        uid: response.uid,
        email: response.email,
        role: response.role as "admin" | "ambassador" | "superadmin",
        firstName: '',
        lastName: '',
        accessToken: response.accessToken
      };

      setCurrentUser(userData);
      toast.success('Login successful');
      if (onSuccess) {
        onSuccess();
      }
      navigate('/dashboard');
    } catch (err: any) {
      // Handle both Error objects and custom error objects from auth API
      const errorMessage = err.message || err.error?.message || 'An error occurred during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, setCurrentUser, setLoading, navigate, onSuccess]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleNavigation = useCallback((path: string) => () => {
    navigate(path);
  }, [navigate]);

  return (
    <Card className="w-full max-w-md mx-auto bg-black border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Login</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-900 border border-red-700 text-white p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-900 border-gray-700 text-white pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Sign In
          </Button>
          <div className="flex justify-between items-center w-full text-sm">
            <Button
              type="button"
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto font-normal"
              onClick={handleNavigation('/forgot-password')}
            >
              Forgot password?
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-primary hover:text-primary/80 p-0 h-auto font-normal"
              onClick={handleNavigation('/ambassador-register')}
            >
              Register as Agent
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
});

LoginForm.displayName = 'LoginForm';

export default LoginForm;