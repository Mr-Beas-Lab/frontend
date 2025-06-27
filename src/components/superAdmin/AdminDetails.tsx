import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash, Loader2, Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { getAdminById, deactivateAdmin, activateAdmin, deleteAdmin } from '../../api/adminService';
import { AdminData } from '../../api/adminService';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from "sonner";

const AdminDetails = () => {
  const { adminId } = useParams<{ adminId: string }>();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!adminId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getAdminById(adminId);
        setAdmin({
          ...data,
          isActive: data.isActive ?? true
        });
      } catch (error: any) {
        console.error('Error fetching admin data:', error);
        const errorMessage = error.response?.data?.message || 'Failed to load admin details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [adminId]);

  const handleStatusToggle = async () => {
    if (!admin || !adminId) return;
    
    setIsStatusUpdating(true);
    try {
      if (admin.isActive) {
        await deactivateAdmin(adminId);
        setAdmin({ ...admin, isActive: false });
        toast.success("Admin deactivated successfully");
      } else {
        await activateAdmin(adminId);
        setAdmin({ ...admin, isActive: true });
        toast.success("Admin activated successfully");
      }
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update admin status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!adminId) return;
    
    setIsDeleting(true);
    try {
      await deleteAdmin(adminId);
      setIsDeleteDialogOpen(false);
      toast.success("Admin deleted successfully");
      navigate('/superadmin-dashboard/admins');
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete admin';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="bg-red-900 border border-red-700 text-white p-4 rounded-md">
        {error || 'Admin not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 ">
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-white">Admin Details</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/superadmin-dashboard/admins/edit/${adminId}`)}
                className="flex items-center border-gray-700 text-white hover:bg-gray-800 hover:text-white"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center bg-red-900 hover:bg-red-800 text-white"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Are you sure you want to delete this admin? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDeleteDialogOpen(false)}
                      className="border-gray-700 text-white hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete} 
                      disabled={isDeleting}
                      className="bg-red-900 hover:bg-red-800 text-white"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <CardDescription className="text-gray-400">
            View and manage this admin user
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Status</h3>
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
                onClick={handleStatusToggle}
                disabled={isStatusUpdating}
              >
                {isStatusUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : admin.isActive ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span className="ml-1">{admin.isActive ? 'Deactivate' : 'Activate'}</span>
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-medium mb-4 text-white">Personal Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">First Name</p>
                  <p className="text-white">{admin.firstName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Last Name</p>
                  <p className="text-white">{admin.lastName || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Email Address</p>
                <p className="text-white">{admin.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Phone Number</p>
                <p className="text-white">{admin.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Telegram Username</p>
                <p className="text-white">{admin.tgUsername || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-lg font-medium mb-4 text-white">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Created At</p>
                <p className="text-white">
                  {admin.createdAt 
                    ? new Date(admin.createdAt).toLocaleString() 
                    : 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="text-white">
                  {admin.updatedAt 
                    ? new Date(admin.updatedAt).toLocaleString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDetails; 