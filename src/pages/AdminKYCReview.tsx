import { useState, useEffect } from 'react';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { CheckCircle, Eye, XCircle } from 'lucide-react';
import { 
  getAllKycApplications, 
  getPendingKycApplications, 
  approveKycApplication, 
  rejectKycApplication 
} from '../api/kyc';
import { KYCApplication } from '../types';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { KYCReviewSkeleton } from "../components/ui/SkeletonLoader";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const AdminKYCReview = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<KYCApplication[]>([]);
  const [pendingApplications, setPendingApplications] = useState<KYCApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<KYCApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  useEffect(() => {
    fetchKycApplications();
  }, []);

  const fetchKycApplications = async () => {
    try {
      setLoading(true);
      const [allApps, pendingApps] = await Promise.all([
        getAllKycApplications(),
        getPendingKycApplications()
      ]);
      
      // Sort by submission date, newest first
      allApps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      pendingApps.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      setApplications(allApps);
      setPendingApplications(pendingApps);
    } catch (error) {
      console.error('Error fetching KYC applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load KYC applications. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (application: KYCApplication) => {
    try {
      setSelectedApplication(application);
      setProcessing(true);
      
      await approveKycApplication(application.ambassadorId);
      
      toast({
        title: 'KYC Approved',
        description: `KYC application for ${application.firstName} ${application.lastName} has been approved.`,
      });
      
      // Refresh the data
      await fetchKycApplications();
    } catch (error) {
      console.error('Error approving KYC application:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve KYC application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setSelectedApplication(null);
    }
  };

  const handleReject = async (application: KYCApplication) => {
    try {
      setSelectedApplication(application);
      setProcessing(true);
      
      if (!rejectionReason.trim()) {
        toast({
          title: 'Error',
          description: 'Rejection reason is required.',
          variant: 'destructive',
        });
        return;
      }
      
      await rejectKycApplication(application.ambassadorId, rejectionReason);
      
      toast({
        title: 'KYC Rejected',
        description: `KYC application for ${application.firstName} ${application.lastName} has been rejected.`,
      });
      
      // Reset rejection reason
      setRejectionReason('');
      setRejectDialogOpen(false);
      
      // Refresh the data
      await fetchKycApplications();
    } catch (error) {
      console.error('Error rejecting KYC application:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject KYC application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setSelectedApplication(null);
    }
  };

  const handleOpenRejectDialog = (application: KYCApplication) => {
    setSelectedApplication(application);
    setRejectDialogOpen(true);
  };

  const handleViewDetails = (application: KYCApplication) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-600">Rejected</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      default:
        return <Badge className="bg-gray-600">{status}</Badge>;
    }
  };

  if (loading) {
    return <KYCReviewSkeleton />;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">KYC Applications Review</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Applications ({applications.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No pending KYC applications found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingApplications.map(application => (
                <Card key={application.ambassadorId} className="w-full">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{application.firstName} {application.lastName}</span>
                      {getStatusBadge(application.status)}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div>Email: {application.email}</div>
                      <div>Country: {application.country}</div>
                      <div>Submitted: {format(new Date(application.submittedAt), 'PPP')}</div>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View Details
                    </Button>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRejectDialog(application)}
                        disabled={processing && selectedApplication?.ambassadorId === application.ambassadorId}
                        className="text-red-500 border-red-500 hover:bg-red-100"
                      >
                        {processing && selectedApplication?.ambassadorId === application.ambassadorId ? (
                          <LoadingSpinner size={16} text="" />
                        ) : (
                          <XCircle className="mr-1 h-4 w-4" />
                        )}
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(application)}
                        disabled={processing && selectedApplication?.ambassadorId === application.ambassadorId}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processing && selectedApplication?.ambassadorId === application.ambassadorId ? (
                          <LoadingSpinner size={16} text="" />
                        ) : (
                          <CheckCircle className="mr-1 h-4 w-4" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No KYC applications found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map(application => (
                <Card key={application.ambassadorId} className="w-full">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{application.firstName} {application.lastName}</span>
                      {getStatusBadge(application.status)}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div>Email: {application.email}</div>
                      <div>Country: {application.country}</div>
                      <div>Submitted: {format(new Date(application.submittedAt), 'PPP')}</div>
                      {application.reviewedAt && (
                        <div>Reviewed: {format(new Date(application.reviewedAt), 'PPP')}</div>
                      )}
                      {application.rejectionReason && (
                        <div className="text-red-500 mt-1">
                          Reason: {application.rejectionReason}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(application)}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* KYC Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Application Details</DialogTitle>
            <DialogDescription>
              {selectedApplication && `Submitted on ${format(new Date(selectedApplication.submittedAt), 'PPP')}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>First Name</Label>
                      <p className="font-medium">{selectedApplication.firstName}</p>
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <p className="font-medium">{selectedApplication.lastName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <Label>Country</Label>
                      <p className="font-medium">{selectedApplication.country}</p>
                    </div>
                    <div>
                      <Label>Document Type</Label>
                      <p className="font-medium">{selectedApplication.documentType}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <p className="font-medium">{selectedApplication.address}</p>
                    </div>
                    {selectedApplication.tgUsername && (
                      <div>
                        <Label>Telegram</Label>
                        <p className="font-medium">{selectedApplication.tgUsername}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-2">Status Information</h3>
                <div className="space-y-2 mb-4">
                  <div>
                    <Label>Status</Label>
                    <p>{getStatusBadge(selectedApplication.status)}</p>
                  </div>
                  {selectedApplication.reviewedAt && (
                    <div>
                      <Label>Reviewed At</Label>
                      <p className="font-medium">{format(new Date(selectedApplication.reviewedAt), 'PPP pp')}</p>
                    </div>
                  )}
                  {selectedApplication.rejectionReason && (
                    <div>
                      <Label>Rejection Reason</Label>
                      <p className="font-medium text-red-500">{selectedApplication.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">ID Verification</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="block mb-1">Profile Photo</Label>
                    {selectedApplication.photoUrl && (
                      <img 
                        src={selectedApplication.photoUrl} 
                        alt="Profile" 
                        className="w-full max-h-48 object-contain border rounded-md"
                      />
                    )}
                  </div>
                  
                  <div>
                    <Label className="block mb-1">ID Front</Label>
                    {selectedApplication.documentFrontUrl && (
                      <img 
                        src={selectedApplication.documentFrontUrl} 
                        alt="ID Front" 
                        className="w-full max-h-48 object-contain border rounded-md"
                      />
                    )}
                  </div>
                  
                  <div>
                    <Label className="block mb-1">ID Back</Label>
                    {selectedApplication.documentBackUrl && (
                      <img 
                        src={selectedApplication.documentBackUrl} 
                        alt="ID Back" 
                        className="w-full max-h-48 object-contain border rounded-md"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            {selectedApplication && selectedApplication.status === 'PENDING' && (
              <div className="flex w-full space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => handleOpenRejectDialog(selectedApplication)}
                  className="text-red-500 border-red-500 hover:bg-red-100"
                >
                  <XCircle className="mr-1 h-4 w-4" /> Reject
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    handleApprove(selectedApplication);
                    setShowDetails(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-1 h-4 w-4" /> Approve
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this KYC application. This will be shown to the ambassador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter the reason for rejection..."
              className="mt-2"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedApplication && handleReject(selectedApplication)}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <>
                  <LoadingSpinner size={16} text="" /> Processing
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" /> Reject Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCReview;