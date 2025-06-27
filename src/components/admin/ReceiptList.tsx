import { Receipt } from "../../types";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { EyeIcon } from "lucide-react";

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
  if (isLoading) {
    return <div className="text-center py-4">Loading receipts...</div>;
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No pending receipts found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Amount</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Ambassador</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {receipts.map((receipt) => (
          <TableRow key={receipt.id}>
            <TableCell>{receipt.amount.toFixed(2)}</TableCell>
            <TableCell>{receipt.currency}</TableCell>
            <TableCell>
              {receipt.ambassadorId ? receipt.ambassadorId.substring(0, 8) : "N/A"}
              {receipt.ambassadorName && ` (${receipt.ambassadorName})`}
            </TableCell>
            <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button size="sm" variant="ghost" onClick={() => onViewReceipt(receipt)}>
                <EyeIcon className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}