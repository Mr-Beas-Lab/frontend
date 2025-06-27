import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import ReceiptList from "./ReceiptList";
import { ReceiptIcon } from "lucide-react";

const Receipts = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">My Receipts</CardTitle>
        <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ReceiptList />
      </CardContent>
    </Card>
  );
};

export default Receipts;