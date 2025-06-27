import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import StatsCards from "../components/admin/StatsCards";
import AmbassadorList from "../components/admin/AmbassadorList";
import ReceiptList from "../components/admin/ReceiptList";
import AmbassadorViewDialog from "../components/admin/AmbassadorViewDialog";
import ReceiptViewDialog from "../components/admin/ReceiptViewDialog";
import { Ambassador, Receipt, KYCApplication } from "../types"; 
import { getAllAmbassadors, deleteAmbassador } from "../api/ambassadorService";
import { getAllReceipts } from "../api/receiptService";
import { getAllKycApplications, deleteKycApplication } from "../api/kyc";
import { toast } from "sonner";
import { AlertTriangle, Eye, ArrowRight, Loader2, Trash } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { AdminDashboardSkeleton } from "../components/ui/SkeletonLoader";

export default function AdminDashboard() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [kycApplications, setKYCApplications] = useState<KYCApplication[]>([]);  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isReceiptViewOpen, setIsReceiptViewOpen] = useState(false);
  const [currentAmbassador, setCurrentAmbassador] = useState<Ambassador | null>(null);
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState({
    ambassadors: true,
    receipts: true,
    kyc: true
  });
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ambassadorToDelete, setAmbassadorToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
      setLoading(true);
      try {
        // Fetch ambassadors data
        let ambassadorData: Ambassador[] = [];
        try {
          ambassadorData = await getAllAmbassadors();
        } catch (error) {
          console.error("Error fetching ambassadors:", error);
          setApiStatus(prev => ({ ...prev, ambassadors: false }));
        }
        
        // Fetch receipts data - handle service not being implemented yet
        let receiptData: Receipt[] = [];
        try {
          receiptData = await getAllReceipts();
          // If we get empty array back but no error, API might not be implemented
          if (receiptData.length === 0) {
            setApiStatus(prev => ({ ...prev, receipts: false }));
          }
        } catch (error) {
          console.error("Error fetching receipts:", error);
          setApiStatus(prev => ({ ...prev, receipts: false }));
        }
        
        // Fetch KYC applications - only for stats, detailed review is on dedicated page
        let kycData: KYCApplication[] = [];
        try {
          kycData = await getAllKycApplications();
          setApiStatus(prev => ({ ...prev, kyc: true }));
          
          // Normalize KYC data to ensure consistent status format
          if (kycData.length > 0) {
            kycData = kycData.map(kyc => {
              if (kyc.status && typeof kyc.status === 'string') {
                const status = kyc.status.toUpperCase();
                if (['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
                  return { ...kyc, status: status as "PENDING" | "APPROVED" | "REJECTED" };
                }
              }
              return kyc;
            });
          }
        } catch (error) {
          console.error("Error fetching KYC applications:", error);
          setApiStatus(prev => ({ ...prev, kyc: false }));
          kycData = [];
        }
        
        // Filter receipts - show only pending receipts
        const filteredReceipts = receiptData.filter(receipt => 
          receipt.status === "pending"
        );

        setAmbassadors(ambassadorData);
        setReceipts(filteredReceipts);
        setKYCApplications(kycData); 
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        // Ensure minimum loading time of 500ms for smooth transition
        const timeElapsed = Date.now() - startTime;
        if (timeElapsed < 500) {
          await new Promise(resolve => setTimeout(resolve, 500 - timeElapsed));
        }
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleDeleteConfirmation = (ambassadorUid: string) => {
    console.log("Delete confirmation triggered for ambassador UID:", ambassadorUid);
    
    // Validate Firebase UID
    if (!ambassadorUid || ambassadorUid === 'undefined') {
      console.error("Invalid ambassador UID provided for deletion:", ambassadorUid);
      toast.error("Cannot delete ambassador: Invalid UID");
      return;
    }
    
    // Verify it looks like a Firebase UID
    if (ambassadorUid.length < 20 || ambassadorUid.includes('@')) {
      console.error("Invalid Firebase UID format:", ambassadorUid);
      toast.error("Invalid Firebase UID format");
      return;
    }
    
    // Try to find the ambassador in our list to validate it exists
    const ambassadorToDeleteObj = ambassadors.find(amb => amb.uid === ambassadorUid);
    
    if (!ambassadorToDeleteObj) {
      console.warn("Ambassador not found in local state for UID:", ambassadorUid);
      // We'll proceed anyway as the backend is the source of truth
    } else {
      console.log("Found ambassador for deletion:", 
        `${ambassadorToDeleteObj.firstName} ${ambassadorToDeleteObj.lastName} (UID: ${ambassadorUid})`);
    }
    
    setAmbassadorToDelete(ambassadorUid);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAmbassador = async () => {
    if (!ambassadorToDelete || ambassadorToDelete === 'undefined') {
      console.error("Invalid ambassador UID set for deletion:", ambassadorToDelete);
      toast.error("Cannot delete: Invalid ambassador UID");
      return;
    }
    
    // Verify it looks like a Firebase UID
    if (ambassadorToDelete.length < 20 || ambassadorToDelete.includes('@')) {
      console.error("Invalid Firebase UID format:", ambassadorToDelete);
      toast.error("Invalid Firebase UID format");
      return;
    }
    
    console.log(`Attempting to delete ambassador with Firebase UID: ${ambassadorToDelete}`);
    setIsDeleting(true);
    
    try {
      // First try to delete the KYC application
      try {
        await deleteKycApplication(ambassadorToDelete);
        console.log("KYC application deleted successfully");
      } catch (kycError) {
        console.error("Error deleting KYC application:", kycError);
        // Continue with ambassador deletion even if KYC deletion fails
      }

      // Delete ambassador from API - using Firebase UID
      await deleteAmbassador(ambassadorToDelete);

      // Update local state - remove the ambassador
      setAmbassadors(prev => prev.filter(ambassador => ambassador.uid !== ambassadorToDelete));
      
      // Also update KYC applications list
      setKYCApplications(prev => prev.filter(kyc => kyc.ambassadorId !== ambassadorToDelete));
      
      toast.success("Ambassador and all related data deleted successfully");
      setIsDeleteDialogOpen(false);
      setAmbassadorToDelete(null);
    } catch (error: any) {
      console.error("Error deleting ambassador:", error);
      
      // Display appropriate error message based on error type
      if (error.error === 'not-found') {
        toast.error("Ambassador not found or already deleted");
      } else if (error.error === 'invalid-id' || error.error === 'invalid-uid-format') {
        toast.error("Invalid ambassador UID");
      } else if (error.error === 'uid-required') {
        toast.error("Firebase UID is required for deletion");
      } else {
        toast.error(typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message) 
          : "Failed to delete ambassador");
      }
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  // Get KYC status counts for the KYC summary cards
  const pendingKycCount = kycApplications.filter(k => k.status === "PENDING").length;
  const approvedKycCount = kycApplications.filter(k => k.status === "APPROVED").length;
  const rejectedKycCount = kycApplications.filter(k => k.status === "REJECTED").length;

  // Log the counts and array length for debugging
  console.log('KYC applications array length:', kycApplications.length);
  console.log('KYC counts:', { pendingKycCount, approvedKycCount, rejectedKycCount });
  
  // Debug individual status values if we have applications but no counts
  if (kycApplications.length > 0 && pendingKycCount === 0 && approvedKycCount === 0 && rejectedKycCount === 0) {
    console.log('KYC status values found:', kycApplications.map(k => k.status));
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <StatsCards
        ambassadorsCount={ambassadors.length}
        pendingReceiptsCount={receipts.filter((r) => r.status === "pending").length}
        pendingKYCCount={pendingKycCount} 
      />

      <Tabs defaultValue="ambassadors">
        <TabsList className="mb-4 relative flex border-b border-gray-300">
          <TabsTrigger
            value="ambassadors"
            className="relative px-4 py-2 data-[state=active]:text-primary data-[state=active]:font-semibold"
          >
            Ambassadors
            <span className="absolute left-0 h-[3px] w-full scale-0 data-[state=active]:scale-100 transition-transform"></span>
          </TabsTrigger>

          <TabsTrigger
            value="receipts"
            className="relative px-4 py-2 data-[state=active]:text-primary data-[state=active]:font-semibold"
          >
            Receipts
            <span className="absolute h-[3px] w-full bg-primary scale-0 data-[state=active]:scale-100 transition-transform"></span>
          </TabsTrigger>

          <TabsTrigger
            value="kyc"
            className="relative px-4 py-2 data-[state=active]:text-primary data-[state=active]:font-semibold"
          >
            KYC
            <span className="absolute h-[3px] w-full bg-primary scale-0 data-[state=active]:scale-100 transition-transform"></span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ambassadors" className="space-y-4">
          {!apiStatus.ambassadors && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Network error. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          <AmbassadorList
            ambassadors={ambassadors}
            onDelete={handleDeleteConfirmation}
            onView={(ambassador) => {
              setCurrentAmbassador(ambassador);
              setIsViewOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="receipts">
          {!apiStatus.receipts && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Network error. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          <ReceiptList
            receipts={receipts}
            onViewReceipt={(receipt) => {
              setCurrentReceipt(receipt);
              setIsReceiptViewOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="kyc">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">KYC Overview</h2>
            <Button asChild>
              <Link to="/admin/kyc-review" className="flex items-center gap-2">
                <Eye size={16} />
                Go to KYC Review
              </Link>
            </Button>
          </div>
          
          {!apiStatus.kyc ? (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Network error. Please try again later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pending</CardTitle>
                  <CardDescription>KYC applications waiting for review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pendingKycCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Approved</CardTitle>
                  <CardDescription>Successfully verified applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{approvedKycCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Rejected</CardTitle>
                  <CardDescription>Applications that didn't meet criteria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{rejectedKycCount}</div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="rounded-lg border p-6 flex flex-col items-center justify-center space-y-4">
            <p className="text-center ">
              For detailed review and management of KYC applications, please use the dedicated KYC Review page.
            </p>
            <Button asChild size="lg">
              <Link to="/admin/kyc-review" className="flex items-center gap-2">
                Go to KYC Review <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <AmbassadorViewDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        ambassador={currentAmbassador}
      />

      <ReceiptViewDialog
        isOpen={isReceiptViewOpen}
        onOpenChange={setIsReceiptViewOpen}
        receipt={currentReceipt}
      />

      {/* Ambassador Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this ambassador? This action will:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Delete the ambassador's account</li>
                <li>Remove all KYC verification data</li>
                <li>Remove associated payment information</li>
              </ul>
              <p className="mt-2 font-semibold text-destructive">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAmbassador}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4" />
                  Delete Ambassador
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}