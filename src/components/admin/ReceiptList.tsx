import { Receipt } from "../../types";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getAmbassadorById } from "../../api/ambassadorService";
import { Loader2 } from "lucide-react";
import { getExchangeRateByCountry } from "../../api/receiptService";
import { adminApproveReceipt } from "../../api/receiptService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Badge } from "../ui/badge";

interface ReceiptListProps {
  receipts: Receipt[];
  onViewReceipt: (receipt: Receipt) => void;
  isLoading?: boolean;
}

export default function ReceiptList({
  receipts,
  onViewReceipt,
  isLoading = false,
}: ReceiptListProps) {
  const [ambassadorNames, setAmbassadorNames] = useState<Record<string, string>>({});
  const [ambassadorCountries, setAmbassadorCountries] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [exchangeRates, setExchangeRates] = useState<Record<string, number | string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    receipt: Receipt | null;
    ambassadorName: string;
    country: string;
    rate: number | null;
    usdcAmount: number | null;
    loading: boolean;
  }>({ open: false, receipt: null, ambassadorName: '', country: '', rate: null, usdcAmount: null, loading: false });
  const [receiptsState, setReceiptsState] = useState(receipts);

  useEffect(() => {
    setReceiptsState(receipts);
  }, [receipts]);

  useEffect(() => {
    const missing = receiptsState
      .filter(r => r.ambassadorId && (!ambassadorNames[r.ambassadorId] || !ambassadorCountries[r.ambassadorId]))
      .map(r => r.ambassadorId);
    missing.forEach((id) => {
      if (!id) return;
      setLoadingIds(prev => ({ ...prev, [id]: true }));
      getAmbassadorById(id)
        .then(amb => {
          setAmbassadorNames(prev => ({ ...prev, [id]: `${amb.firstName} ${amb.lastName}` }));
          setAmbassadorCountries(prev => ({ ...prev, [id]: amb.country || 'N/A' }));
        })
        .catch(() => {
          setAmbassadorNames(prev => ({ ...prev, [id]: 'N/A' }));
          setAmbassadorCountries(prev => ({ ...prev, [id]: 'N/A' }));
        })
        .finally(() => {
          setLoadingIds(prev => ({ ...prev, [id]: false }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptsState]);

  useEffect(() => {
    const missingCountries = receiptsState
      .filter(r => r.ambassadorId && ambassadorCountries[r.ambassadorId] && exchangeRates[ambassadorCountries[r.ambassadorId]] === undefined)
      .map(r => r.ambassadorId ? ambassadorCountries[r.ambassadorId] : 'N/A')
      .filter((country): country is string => !!country && country !== 'N/A');
    missingCountries.forEach((country) => {
      if (!country || country === 'N/A') return;
      setExchangeRates(prev => ({ ...prev, [country]: 'loading' }));
      getExchangeRateByCountry(country)
        .then(rate => {
          setExchangeRates(prev => ({ ...prev, [country]: rate !== null ? rate : 'N/A' }));
        })
        .catch(() => {
          setExchangeRates(prev => ({ ...prev, [country]: 'N/A' }));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptsState, ambassadorCountries]);

  const handleApprove = async (receipt: Receipt) => {
    if (!receipt.ambassadorId) return;
    const ambassadorName = ambassadorNames[receipt.ambassadorId] || 'N/A';
    const country = ambassadorCountries[receipt.ambassadorId] || 'N/A';
    const rate = country && exchangeRates[country];
    if (!rate || rate === 'N/A' || rate === 'loading' || typeof rate !== 'number' || rate <= 0) {
      toast.error("Could not fetch exchange rate for this ambassador's country.");
      return;
    }
    const usdcAmount = receipt.amount / rate;
    setConfirmDialog({
      open: true,
      receipt,
      ambassadorName,
      country,
      rate,
      usdcAmount,
      loading: false,
    });
  };

  const handleDialogConfirm = async () => {
    if (!confirmDialog.receipt) return;
    setConfirmDialog((prev) => ({ ...prev, loading: true }));
    try {
      await adminApproveReceipt({ receiptId: confirmDialog.receipt.id });
      toast.success("Receipt approved and user credited");
      setReceiptsState(prev => prev.map(r =>
        r.id === confirmDialog.receipt?.id ? { ...r, status: 'admin_approved' } : r
      ));
      setConfirmDialog((prev) => ({ ...prev, open: false, loading: false }));
    } catch (error: any) {
      toast.error(error.message || "Failed to approve receipt");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading receipts...</div>;
  }

  if (receiptsState.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No pending receipts found
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount (Local Currency)</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Exchange Rate (USDC)</TableHead>
            <TableHead>Ambassador</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receiptsState.map((receipt) => {
            const country = receipt.ambassadorId ? ambassadorCountries[receipt.ambassadorId] : undefined;
            const rate = country ? exchangeRates[country] : undefined;
            return (
              <TableRow key={receipt.id}>
                <TableCell>{receipt.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {receipt.ambassadorId ? (
                    loadingIds[receipt.ambassadorId] ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      ambassadorCountries[receipt.ambassadorId] || 'N/A'
                    )
                  ) : 'N/A'}
                </TableCell>
                <TableCell>
                  {country ? (
                    rate === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : rate !== undefined ? (
                      rate === 'N/A' ? 'N/A' : Number(rate).toFixed(2)
                    ) : 'N/A'
                  ) : 'N/A'}
                </TableCell>
                <TableCell>
                  {receipt.ambassadorId ? (
                    loadingIds[receipt.ambassadorId] ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      ambassadorNames[receipt.ambassadorId] || 'N/A'
                    )
                  ) : 'N/A'}
                </TableCell>
                <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => onViewReceipt(receipt)}>
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  {receipt.status === 'ambassador_approved' && (
                    <Button size="sm" variant="default" className="ml-2" onClick={() => handleApprove(receipt)}>
                      Approve
                    </Button>
                  )}
                  {receipt.status === 'admin_approved' && (
                    <Badge variant="success" className="ml-2">Approved</Badge>
                  )}
                  {receipt.status === 'rejected' && (
                    <Badge variant="destructive" className="ml-2">Rejected</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Dialog open={confirmDialog.open} onOpenChange={open => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>Received by:</strong> {confirmDialog.ambassadorName}</p>
            <p><strong>Amount in local currency:</strong> {confirmDialog.receipt?.amount.toFixed(2)}</p>
            <p><strong>Exchange rate for the country:</strong> {confirmDialog.rate !== null ? confirmDialog.rate.toFixed(2) : 'N/A'}</p>
            <p><strong>Total amount to be recharged in USDC:</strong> {confirmDialog.usdcAmount !== null ? confirmDialog.usdcAmount.toFixed(2) : 'N/A'}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))} disabled={confirmDialog.loading}>Cancel</Button>
            <Button onClick={handleDialogConfirm} disabled={confirmDialog.loading} className="ml-2">
              {confirmDialog.loading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}