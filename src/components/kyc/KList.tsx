import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { KYCApplication } from "../../types";

interface KYCListProps {
  kycApplications: KYCApplication[];
  onViewKYC: (kyc: KYCApplication) => void;
}

export default function KycList({ kycApplications, onViewKYC }: KYCListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ambassador</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {kycApplications.map((kyc) => (
          <TableRow key={kyc.id}>
            <TableCell>{kyc.firstName} {kyc.lastName}</TableCell>
            <TableCell>{kyc.status}</TableCell>
            <TableCell>{new Date(kyc.submittedAt).toLocaleString()}</TableCell>
            <TableCell>
              <Button onClick={() => onViewKYC(kyc)}>View</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}