import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Eye, X, Wallet, FileText } from "lucide-react";
import { formatDate } from "../../lib/utils";
import { Receipt } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "sonner";
import { getReceiptsByAmbassador, approveReceipt, rejectReceipt } from "../../api/receiptService";
import { Label } from "../ui/label";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

interface ExchangeRate {
  id: string;
  currencyCode: string;
  rate: number;
  countryName: string;
  updatedAt: string;
  updatedBy: string;
}

interface ReceiptListProps {
  isAdmin?: boolean;
}

const ReceiptList: React.FC<ReceiptListProps> = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isReceiptDetailOpen, setIsReceiptDetailOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [actionType, setActionType] = useState<'deposit' | 'reject' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { currentUser } = useAuth();
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);

  useEffect(() => {
    console.log('Component mounted, currentUser:', currentUser);
    fetchReceipts();
    if (currentUser?.uid) {
      console.log('Fetching exchange rate for user:', currentUser.uid);
      fetchExchangeRate();
    }
  }, [currentUser?.uid]);

  const fetchExchangeRate = async () => {
    if (!currentUser?.uid) {
      console.log('Missing user ID');
      return;
    }

    try {
      // First get the ambassador's country from their profile
      const ambassadorRef = doc(db, "staffs", currentUser.uid);
      const ambassadorDoc = await getDoc(ambassadorRef);
      
      if (!ambassadorDoc.exists()) {
        console.log('Ambassador document not found');
        return;
      }

      const ambassadorData = ambassadorDoc.data();
      const country = ambassadorData?.country;
      
      console.log('Ambassador data:', { country, ambassadorData });

      if (!country) {
        console.log('No country set for ambassador');
        toast.error("Please set your country in your profile");
        return;
      }

      console.log('Fetching exchange rate for country:', country);
      
      const exchangeRatesRef = collection(db, "exchangeRates");
      const q = query(
        exchangeRatesRef,
        where("countryName", "==", country)
      );
      
      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      
      console.log('Exchange rate query result:', {
        empty: querySnapshot.empty,
        size: querySnapshot.size,
        docs: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const rateData = doc.data() as Omit<ExchangeRate, 'id'>;
        console.log('Found exchange rate:', rateData);
        setExchangeRate({
          id: doc.id,
          ...rateData
        });
      } else {
        console.log('No exchange rate found for country:', country);
        setExchangeRate(null);
        toast.error("Please set your exchange rate in the settings before approving receipts");
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setExchangeRate(null);
      toast.error("Failed to fetch exchange rate. Please try again.");
    }
  };

  const fetchReceipts = async () => {
    if (!currentUser?.uid) return;

    try {
      setLoading(true);
      const response = await getReceiptsByAmbassador(currentUser.uid);
      setReceipts(response);
      setError(null);
    } catch (error: any) {
      console.error("Error fetching receipts:", error);
      setError(error.message || "Failed to fetch receipts");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmationDialog = (type: 'deposit' | 'reject', receipt: Receipt) => {
    console.log('Opening confirmation dialog', { type, receipt, exchangeRate });
    if (type === 'deposit' && !exchangeRate) {
      console.log('No exchange rate in openConfirmationDialog');
      toast.error("Please set your exchange rate before approving receipts");
      return;
    }
    setActionType(type);
    setSelectedReceipt(receipt);
    setIsConfirmationOpen(true);
  };

  const handleWalletClick = (receipt: Receipt) => {
     if (!exchangeRate) {
      console.log('No exchange rate set');
      toast.error("Please set your exchange rate in the settings before approving receipts");
      return;
    }
    if (!receipt.id || !receipt.senderTgId) {
      console.log('Missing receipt data:', { id: receipt.id, senderTgId: receipt.senderTgId });
      toast.error("Invalid receipt data");
      return;
    }
    console.log('Opening confirmation dialog with exchange rate:', exchangeRate);
    openConfirmationDialog("deposit", receipt);
  };

  const handleDeposit = async () => {
    if (!selectedReceipt || !exchangeRate) return;
  
    if (!selectedReceipt.id || !selectedReceipt.senderTgId) {
      setError("Missing required fields: receiptId or senderTgId.");
      return;
    }
  
    setIsActionLoading(true);  
  
    try {
      const result = await approveReceipt({
        receiptId: selectedReceipt.id,
        senderId: selectedReceipt.senderTgId,
        amount: selectedReceipt.amount,
      });
  
      if (result.success) {
        setReceipts(receipts.map(receipt => 
          receipt.id === selectedReceipt.id 
            ? { ...receipt, status: "approved" } 
            : receipt
        ));
        setError(null);
        toast.success("Receipt Recharge successfully!");
      } else {
        setError(result.message || "Failed to Recharge receipt.");
        toast.warning("Failed to Recharge receipt.");
      }
  
      setIsConfirmationOpen(false);
      setIsReceiptDetailOpen(false);
    } catch (error: any) {
      console.error("Error Recharging receipt:", error);
      setError(error.message || "Failed to recharge receipt. Please try again later.");
      toast.error("Failed to recharge receipt.");
    } finally {
      setIsActionLoading(false); 
    }
  };

  const handleReject = async () => {
    if (!selectedReceipt) return;

    setIsActionLoading(true);

    try {
      const result = await rejectReceipt({ receiptId: selectedReceipt.id });

      if (result.success) {
        setReceipts(receipts.map(receipt => 
          receipt.id === selectedReceipt.id 
            ? { ...receipt, status: "rejected" } 
            : receipt
        ));
        setError(null);
        toast.success("Receipt rejected successfully!");
      } else {
        setError(result.message || "Failed to reject receipt.");
        toast.warning("Failed to reject receipt.");
      }

      setIsConfirmationOpen(false);
      setIsReceiptDetailOpen(false);
    } catch (error: any) {
      console.error("Error rejecting receipt:", error);
      setError(error.message || "Failed to reject receipt. Please try again later.");
      toast.error("Failed to reject receipt.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No receipts found
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.id.slice(0, 8)}</TableCell>
                  <TableCell>{receipt.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${receipt.status === "approved" ? "bg-green-100 text-green-800" : receipt.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                      {receipt.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(receipt.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedReceipt(receipt); setIsReceiptDetailOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {currentUser?.role === "ambassador" && receipt.status === "pending" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Button clicked');
                              handleWalletClick(receipt);
                            }}
                            title={!exchangeRate ? "Please set your exchange rate first" : "Approve receipt"}
                          >
                            <Wallet className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => openConfirmationDialog("reject", receipt)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isReceiptDetailOpen} onOpenChange={setIsReceiptDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <p>{selectedReceipt.id}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p>{selectedReceipt.amount.toFixed(2)}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p>{selectedReceipt.status}</p>
              </div>
              <div>
                <Label>Created At</Label>
                <p>{formatDate(selectedReceipt.createdAt)}</p>
              </div>
              {selectedReceipt.documents && selectedReceipt.documents.length > 0 && (
                <div>
                  <Label>Receipt File</Label>
                  <div className="mt-2">
                    <a 
                      href={selectedReceipt.documents[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Receipt
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'deposit' ? 'Confirm Deposit' : 'Confirm Rejection'}
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <p>
                Are you sure you want to {actionType === 'deposit' ? 'deposit' : 'reject'} this receipt?
              </p>
              {actionType === 'deposit' && exchangeRate && (
                <div className="p-4   rounded-lg">
                  <p className="text-sm text-gray-200">Exchange Rate: 1 USDC = {exchangeRate.rate.toFixed(2)} {exchangeRate.currencyCode}</p>
                  <p className="text-sm text-gray-200">Amount: {selectedReceipt.amount.toFixed(2)} {exchangeRate.currencyCode}</p>
                  <p className="font-medium">USDC Amount: {(selectedReceipt.amount / exchangeRate.rate).toFixed(2)} USDC</p>
                </div>
              )}
              {actionType === 'deposit' && !exchangeRate && (
                <div className="p-4 bg-yellow-100 rounded-lg">
                  <p className="text-yellow-800">Please set your exchange rate before approving receipts</p>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmationOpen(false)}
                  disabled={isActionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={actionType === 'deposit' ? handleDeposit : handleReject}
                  disabled={isActionLoading || (actionType === 'deposit' && !exchangeRate)}
                  className={actionType === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {isActionLoading ? 'Processing...' : actionType === 'deposit' ? 'Deposit' : 'Reject'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptList;