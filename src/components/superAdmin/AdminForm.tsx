import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AdminData } from '../../api/adminService';
import { getAdminById, createAdmin, updateAdmin } from '../../api/adminService';
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import LoadingSpinner from "../ui/LoadingSpinner";

interface AdminFormProps {
  adminId?: string; // If provided, we're editing an existing admin
}

const AdminForm: React.FC<AdminFormProps> = ({ adminId }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Omit<AdminData, 'id' | 'createdAt' | 'updatedAt'>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    isActive: true,
    phone: '',
    tgUsername: '',
  });

  // Fetch admin data if we're editing
  useEffect(() => {
    const fetchAdminData = async () => {
      if (!adminId) return;
      
      setFetchLoading(true);
      setError(null);
      
      try {
        const adminData = await getAdminById(adminId);
        
        setFormData({
          firstName: adminData.firstName || '',
          lastName: adminData.lastName || '',
          email: adminData.email || '',
          password: '', // We don't receive the password
          isActive: adminData.isActive,
          phone: adminData.phone || '',
          tgUsername: adminData.tgUsername || '',
        });
      } catch (error: any) {
        console.error('Error fetching admin data:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load admin data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAdminData();
  }, [adminId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add handler for toggle switch
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!adminId && !formData.password?.trim()) return 'Password is required';
    if (!adminId && formData.password && formData.password.length < 8) return 'Password must be at least 8 characters';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare data - omit password if empty (for editing)
      const adminData = { ...formData };
      if (adminData.password === '') {
        const { password, ...dataWithoutPassword } = adminData;
        
        if (adminId) {
          // Update existing admin
          await updateAdmin(adminId, dataWithoutPassword);
          toast.success('Admin updated successfully');
        } else {
          // Create new admin - password is required for new admins
          const errorMsg = 'Password is required for new admin';
          setError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
          return;
        }
      } else {
        if (adminId) {
          // Update existing admin
          await updateAdmin(adminId, adminData);
          toast.success('Admin updated successfully');
        } else {
          // Create new admin
          await createAdmin(adminData);
          toast.success('Admin created successfully');
        }
      }
      
      // Redirect back to admin list
      navigate('/superadmin-dashboard/admins');
    } catch (error: any) {
      console.error('Error saving admin:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save admin';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchLoading) {
    return <LoadingSpinner fullScreen text="Loading admin data..." />;
  }

  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/superadmin-dashboard/admins')}
        className="mb-4 flex items-center text-white hover:bg-gray-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Admin List
      </Button>

      <Card className="bg-black border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            {adminId ? 'Edit Admin' : 'Add New Admin'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {adminId 
              ? 'Update admin user information' 
              : 'Create a new admin user with access to the dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
            
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  {adminId ? 'Password (leave blank to keep unchanged)' : 'Password'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required={!adminId}
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tgUsername" className="text-white">Telegram Username</Label>
                <Input
                  id="tgUsername"
                  name="tgUsername"
                  value={formData.tgUsername}
                  onChange={handleChange}
                  placeholder="@username"
                  className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className="text-white">Account Status</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onCheckedChange={handleSwitchChange}
                    />
                    <span className="text-sm text-gray-400">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {formData.isActive 
                    ? "Admin can log in and access the dashboard" 
                    : "Admin will not be able to log in"}
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gray-800 hover:bg-gray-700 text-white" 
              isLoading={isLoading}
              loadingText={adminId ? 'Updating...' : 'Creating...'}
            >
              {adminId ? 'Update Admin' : 'Create Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminForm; 