import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, Eye, Pencil, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { getAdmins, deactivateAdmin, activateAdmin } from '../../api/adminService';
import { AdminData } from '../../api/adminService';
import { toast } from "sonner";

const AdminList = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getAdmins();
        // Ensure all admins have isActive set (default to true if not specified)
        const processedData = data.map(admin => ({
          ...admin,
          isActive: admin.isActive ?? true
        }));
        setAdmins(processedData);
        setFilteredAdmins(processedData);
      } catch (error: any) {
        console.error('Error fetching admins:', error);
        setError('Network error. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAdmins(admins);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredAdmins(
        admins.filter(
          admin =>
            admin.email.toLowerCase().includes(term) ||
            (admin.firstName && admin.firstName.toLowerCase().includes(term)) ||
            (admin.lastName && admin.lastName.toLowerCase().includes(term))
        )
      );
    }
  }, [searchTerm, admins]);

  const handleStatusToggle = async (id: string, isActive: boolean) => {
    if (!id) {
      toast.error("Admin ID is missing");
      return;
    }
    
    setIsUpdating(prev => ({ ...prev, [id]: true }));
    try {
      if (isActive) {
        await deactivateAdmin(id);
        toast.success("Admin deactivated successfully");
      } else {
        await activateAdmin(id);
        toast.success("Admin activated successfully");
      }
      
      // Update the local state
      setAdmins(prevAdmins =>
        prevAdmins.map(admin =>
          admin.id === id ? { ...admin, isActive: !isActive } : admin
        )
      );
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update admin status';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-black border-gray-800 text-white">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl text-white">Admins</CardTitle>
              <CardDescription className="text-gray-400">
                Manage admin users in the system
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigate('/superadmin-dashboard/admins/new')}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {error ? (
            <Alert variant="warning" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center p-6 border border-gray-800 rounded-md">
              <p className="text-white">No admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-4 text-white font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Status</th>
                    <th className="text-right py-3 px-4 text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-900">
                      <td className="py-3 px-4 text-white">
                        {admin.firstName && admin.lastName 
                          ? `${admin.firstName} ${admin.lastName}` 
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-white">{admin.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Badge className={admin.isActive 
                            ? "bg-green-900 text-green-100" 
                            : "bg-red-900 text-red-100"
                          }>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-2 border-gray-700 text-white hover:bg-gray-800"
                            onClick={() => handleStatusToggle(admin.id!, admin.isActive)}
                            disabled={isUpdating[admin.id!]}
                          >
                            {isUpdating[admin.id!] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : admin.isActive ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/superadmin-dashboard/admins/${admin.id}`)}
                            className="text-white hover:bg-gray-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/superadmin-dashboard/admins/edit/${admin.id}`)}
                            className="text-white hover:bg-gray-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminList; 