import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Receipt } from "../../types";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { adminApproveReceipt, adminRejectReceipt } from "../../api/receiptService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getAmbassadorById } from "../../api/ambassadorService";
import { getExchangeRateByCountry } from "../../api/receiptService";

interface ReceiptViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
}

export default function ReceiptViewDialog({
  isOpen,
  onOpenChange,
  receipt,
}: ReceiptViewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [ambassadorName, setAmbassadorName] = useState<string | null>(null);
  const [ambassadorLoading, setAmbassadorLoading] = useState(false);

  useEffect(() => {
    if (receipt?.ambassadorId) {
      setAmbassadorLoading(true);
      getAmbassadorById(receipt.ambassadorId)
        .then((amb) => {
          setAmbassadorName(`${amb.firstName} ${amb.lastName}`);
        })
        .catch(() => {
          setAmbassadorName(null);
        })
        .finally(() => setAmbassadorLoading(false));
    } else {
      setAmbassadorName(null);
    }
  }, [receipt?.ambassadorId]);

  if (!receipt) return null;

  const handleAdminApprove = async () => {
    if (!receipt) return;
    setLoading(true);
    try {
      // Fetch ambassador country
      let country = null;
      if (receipt.ambassadorId) {
        const amb = await getAmbassadorById(receipt.ambassadorId);
        country = amb.country;
      }
      let exchangeRate = null;
      if (country) {
        exchangeRate = await getExchangeRateByCountry(country);
      }
      if (!exchangeRate || typeof exchangeRate !== 'number' || exchangeRate <= 0) {
        toast.error("Could not fetch exchange rate for this ambassador's country.");
        setLoading(false);
        return;
      }
      const usdcAmount = receipt.amount / exchangeRate;
      const confirmed = window.confirm(
        `Approve deposit?\n\nLocal Amount: ${receipt.amount.toFixed(2)}\nExchange Rate: ${exchangeRate.toFixed(2)}\nUSDC Amount: ${usdcAmount.toFixed(2)}\n\nDo you want to confirm this deposit?`
      );
      if (!confirmed) {
        setLoading(false);
        return;
      }
      await adminApproveReceipt({ receiptId: receipt.id });
      toast.success("Receipt approved and user credited");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminReject = async () => {
    const reason = window.prompt("Enter a reason for rejection (optional):") || undefined;
    if (reason === null) return; // Cancelled
    setRejecting(true);
    try {
      await adminRejectReceipt(receipt.id, reason);
      toast.success("Receipt rejected");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to reject receipt");
    } finally {
      setRejecting(false);
    }
  };

  const canAdminAct = receipt.status === "ambassador_approved";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receipt Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p><strong>ID:</strong> {receipt.id}</p>
          <p><strong>Amount:</strong> {receipt.amount.toFixed(2)}</p>
          <p><strong>Currency:</strong> {receipt.currency}</p>
          <p><strong>Status:</strong> {receipt.status}</p>
          <p><strong>Date:</strong> {new Date(receipt.createdAt).toLocaleDateString()}</p>
          
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Ambassador Information</h3>
            <p><strong>Name:</strong> {ambassadorLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : ambassadorName || 'N/A'}</p>
            {receipt.ambassadorEmail && <p><strong>Email:</strong> {receipt.ambassadorEmail}</p>}
          </div>
          
          {canAdminAct ? (
            <div className="flex gap-4 mt-4">
              <Button onClick={handleAdminApprove} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Approve
              </Button>
              <Button onClick={handleAdminReject} disabled={rejecting} variant="destructive" className="gap-2">
                {rejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Reject
              </Button>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-center gap-2">
              <AlertCircle className="text-amber-500 h-5 w-5" />
              <p className="text-sm text-amber-700">
                {receipt.status === "pending"
                  ? "This receipt is pending ambassador review. Admins cannot approve or reject receipts directly."
                  : receipt.status === "admin_approved"
                  ? "This receipt has already been approved by an admin."
                  : receipt.status === "rejected"
                  ? "This receipt has been rejected."
                  : "No actions available for this receipt."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}