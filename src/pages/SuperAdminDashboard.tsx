import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { Users, UserPlus, ChevronRight, LayoutDashboard, UserCog, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import AdminList from '../components/superAdmin/AdminList';
import AdminForm from '../components/superAdmin/AdminForm';
import AmbassadorManagement from '../components/superAdmin/AmbassadorManagement';
import { useAuth } from '../context/AuthContext';
import AdminDetails from '../components/superAdmin/AdminDetails';
import RecoveryManagement from '../components/superAdmin/RecoveryManagement';
import { SuperAdminDashboardSkeleton } from '../components/ui/SkeletonLoader';

const SuperAdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SuperAdminDashboardSkeleton />;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 shadow-md bg-black border-r border-gray-800 p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Super Admin</h2>
          <p className="text-sm text-gray-400">{currentUser?.email}</p>
        </div>
        
        <nav className="space-y-2">
          <Link to="/superadmin-dashboard">
            <Button 
              variant={location.pathname === '/superadmin-dashboard' ? 'default' : 'ghost'} 
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/superadmin-dashboard/admins">
            <Button 
              variant={location.pathname.includes('/superadmin-dashboard/admins') && !location.pathname.includes('/admins/new') ? 'default' : 'ghost'} 
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Admins
            </Button>
          </Link>
          <Link to="/superadmin-dashboard/admins/new">
            <Button 
              variant={location.pathname === '/superadmin-dashboard/admins/new' ? 'default' : 'ghost'} 
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </Link>
          <Link to="/superadmin-dashboard/ambassadors">
            <Button 
              variant={location.pathname === '/superadmin-dashboard/ambassadors' ? 'default' : 'ghost'} 
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <UserCog className="h-4 w-4 mr-2" />
              Manage Ambassadors
            </Button>
          </Link>
          <Link to="/superadmin-dashboard/recovery">
            <Button 
              variant={location.pathname === '/superadmin-dashboard/recovery' ? 'default' : 'ghost'} 
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Recovery Management
            </Button>
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-950">
        <Routes>
          <Route index element={<SuperAdminHome />} />
          <Route path="admins" element={<AdminList />} />
          <Route path="admins/new" element={<AdminForm />} />
          <Route path="admins/:adminId" element={<AdminDetails />} />
          <Route path="admins/edit/:adminId" element={<EditAdminWrapper />} />
          <Route path="ambassadors" element={<AmbassadorManagement />} />
          <Route path="recovery" element={<RecoveryManagement />} />
        </Routes>
      </div>
    </div>
  );
};

// Home component for the dashboard
const SuperAdminHome: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Super Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-black border border-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Admin Management</h2>
              <p className="text-sm text-gray-400">Manage admin users</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-700 text-white hover:bg-gray-800"
            onClick={() => window.location.href = '/superadmin-dashboard/admins'}
          >
            View All Admins
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="bg-black border border-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Create New Admin</h2>
              <p className="text-sm text-gray-400">Add a new admin user</p>
            </div>
            <UserPlus className="h-8 w-8 text-green-500" />
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-700 text-white hover:bg-gray-800"
            onClick={() => window.location.href = '/superadmin-dashboard/admins/new'}
          >
            Add Admin
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-black border border-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Manage Ambassadors</h2>
              <p className="text-sm text-gray-400">View and manage ambassadors</p>
            </div>
            <UserCog className="h-8 w-8 text-purple-500" />
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-700 text-white hover:bg-gray-800"
            onClick={() => window.location.href = '/superadmin-dashboard/ambassadors'}
          >
            View All Ambassadors
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-black border border-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Recovery Management</h2>
              <p className="text-sm text-gray-400">Handle payment failures and balance adjustments</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-700 text-white hover:bg-gray-800"
            onClick={() => window.location.href = '/superadmin-dashboard/recovery'}
          >
            Manage Recovery
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Wrapper for the Edit Admin component
const EditAdminWrapper: React.FC = () => {
  const { adminId } = useParams();
  return <AdminForm adminId={adminId} />;
};

export default SuperAdminDashboard;