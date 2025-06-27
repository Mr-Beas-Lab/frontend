import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Receipt } from "../../types";
import { AlertCircle } from "lucide-react";

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
  if (!receipt) return null;

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
          
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <h3 className="font-medium mb-2">Ambassador Information</h3>
            <p><strong>ID:</strong> {receipt.ambassadorId || 'Not assigned'}</p>
            {receipt.ambassadorName && <p><strong>Name:</strong> {receipt.ambassadorName}</p>}
            {receipt.ambassadorEmail && <p><strong>Email:</strong> {receipt.ambassadorEmail}</p>}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-center gap-2">
            <AlertCircle className="text-amber-500 h-5 w-5" />
            <p className="text-sm text-amber-700">
              This receipt is pending ambassador review. Admins cannot approve or reject receipts directly.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}