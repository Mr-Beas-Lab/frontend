import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { KYCApplication } from "../../types";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { 
  Dialog as RejectDialog,
  DialogContent as RejectDialogContent,
  DialogHeader as RejectDialogHeader,
  DialogTitle as RejectDialogTitle,
  DialogDescription as RejectDialogDescription,
  DialogFooter as RejectDialogFooter,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface KYCViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  kyc: KYCApplication | null;
  onApprove: (kycId: string) => Promise<void>; 
  onReject: (kycId: string, reason?: string) => Promise<void>; 
}

export default function KYCViewDialog({ isOpen, onOpenChange, kyc, onApprove, onReject }: KYCViewDialogProps) {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);  
  const [rejecting, setRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!kyc) return null;

  const handleImageClick = (imageUrl: string) => {
    setFullScreenImage(imageUrl);
  };

  const handleCloseFullScreen = () => {
    setFullScreenImage(null);
  };

  const handleApprove = async () => {
    if (!kyc) return;

    setApproving(true); 
    try {
      await onApprove(kyc.id);
      toast.success(`KYC application for ${kyc.firstName} ${kyc.lastName} has been approved`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error approving KYC:", error);
      toast.error("Failed to approve KYC application. Please try again.");
    } finally {
      setApproving(false);  
    }
  };

  const handleOpenRejectDialog = () => {
    setShowRejectDialog(true);
  };

  const handleRejectSubmit = async () => {
    if (!kyc) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setRejecting(true);  
    try {
      await onReject(kyc.id, rejectionReason); 
      toast.success(`KYC application for ${kyc.firstName} ${kyc.lastName} has been rejected`);
      setShowRejectDialog(false);
      onOpenChange(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      toast.error("Failed to reject KYC application. Please try again.");
    } finally {
      setRejecting(false); 
    }
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>KYC Application</DialogTitle>
            <DialogDescription>Review the KYC application details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Grid Layout for KYC Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ambassador Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-600">Ambassador:</h3>
                  <p className="text-lg">{kyc.firstName} {kyc.lastName}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Telegram Username:</h3>
                  <p className="text-lg">{kyc.tgUsername}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Email:</h3>
                  <p className="text-lg">{kyc.email}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-600">Address:</h3>
                  <p className="text-lg">{kyc.address}</p>
                </div>
              </div>

              {/* Document Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-600">Document Type:</h3>
                  <p className="text-lg">{kyc.documentType}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Status:</h3>
                  <p className="text-lg">{kyc.status}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Submitted At:</h3>
                  <p className="text-lg">{new Date(kyc.submittedAt).toLocaleString()}</p>
                </div>
                {kyc.reviewedAt && (
                  <div>
                    <h3 className="font-medium text-gray-600">Reviewed At:</h3>
                    <p className="text-lg">{new Date(kyc.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
                {kyc.reviewedBy && (
                  <div>
                    <h3 className="font-medium text-gray-600">Reviewed By:</h3>
                    <p className="text-lg">{kyc.reviewedBy}</p>
                  </div>
                )}
                {kyc.rejectionReason && (
                  <div>
                    <h3 className="font-medium text-gray-600">Rejection Reason:</h3>
                    <p className="text-lg">{kyc.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Profile Photo */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-600">Profile Photo:</h3>
                <img
                  src={kyc.photoUrl}
                  alt="Profile"
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => kyc.photoUrl && handleImageClick(kyc.photoUrl)}
                />
              </div>

              {/* Document Front */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-600">Document Front:</h3>
                <img
                  src={kyc.documentFrontUrl}
                  alt="Document Front"
                  className="w-full h-48 object-cover rounded-lg cursor-pointer"
                  onClick={() => handleImageClick(kyc.documentFrontUrl)}
                />
              </div>

              {/* Document Back (if available) */}
              {kyc.documentBackUrl && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-600">Document Back:</h3>
                  <img
                    src={kyc.documentBackUrl}
                    alt="Document Back"
                    className="w-full h-48 object-cover rounded-lg cursor-pointer"
                    onClick={() => handleImageClick(kyc.documentBackUrl!)}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {kyc.status === "PENDING" && (
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleOpenRejectDialog}
                  disabled={approving || rejecting}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  {rejecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-Screen Image Dialog */}
      <Dialog open={!!fullScreenImage} onOpenChange={handleCloseFullScreen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>View Image</DialogTitle>
            <DialogDescription>View the selected image in full screen.</DialogDescription>
          </DialogHeader>
          {fullScreenImage && (
            <img
              src={fullScreenImage}
              alt="Full Screen"
              className="w-full h-full object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <RejectDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <RejectDialogContent>
          <RejectDialogHeader>
            <RejectDialogTitle>Reject KYC Application</RejectDialogTitle>
            <RejectDialogDescription>
              Please provide a reason for rejecting this KYC application. This will be shared with the applicant.
            </RejectDialogDescription>
          </RejectDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Enter reason for rejection..."
              className="mt-2"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          
          <RejectDialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectDialog(false)}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={rejecting || !rejectionReason.trim()}
            >
              {rejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" /> Reject Application
                </>
              )}
            </Button>
          </RejectDialogFooter>
        </RejectDialogContent>
      </RejectDialog>
    </>
  );
}