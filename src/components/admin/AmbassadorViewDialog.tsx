import { Ambassador } from "../../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface AmbassadorViewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ambassador: Ambassador | null;
}

export default function AmbassadorViewDialog({ isOpen, onOpenChange, ambassador }: AmbassadorViewDialogProps) {
  if (!ambassador) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ambassador Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1 */}
          <div className="space-y-4">
            <div>
              <p className="font-medium text-sm text-gray-500">First Name</p>
              <p className="text-base">{ambassador.firstName}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500">Last Name</p>
              <p className="text-base">{ambassador.lastName}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500">Telegram Username</p>
              <p className="text-base">{ambassador.tgUsername}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500">Email</p>
              <p className="text-base">{ambassador.email}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500">Phone</p>
              <p className="text-base">{ambassador.phone}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500">Address</p>
              <p className="text-base">{ambassador.address || "N/A"}</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            <div>
              <p className="font-medium text-sm text-gray-500">Country</p>
              <p className="text-base">{ambassador.country}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500">Role</p>
              <p className="text-base">{ambassador.role}</p>
            </div>

            <div>
              <p className="font-medium text-sm text-gray-500">KYC Status</p>
              <p className="text-base">{ambassador.kycStatus || "pending"}</p>
            </div>
            <div>
              <p className="font-medium text-sm text-gray-500">Created At</p>
              <p className="text-base">{new Date(ambassador.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Display ID Front and Back Images if available */}
        {(ambassador.idFront || ambassador.idBack) && (
          <div className="mt-6">
            <p className="font-medium text-sm text-gray-500 mb-2">ID Documents</p>
            <div className="flex space-x-4">
              {ambassador.idFront && (
                <div>
                  <p className="font-medium text-sm text-gray-500">Front</p>
                  <img
                    src={ambassador.idFront}
                    alt="ID Front"
                    className="w-32 h-auto border rounded-md"
                  />
                </div>
              )}
              {ambassador.idBack && (
                <div>
                  <p className="font-medium text-sm text-gray-500">Back</p>
                  <img
                    src={ambassador.idBack}
                    alt="ID Back"
                    className="w-32 h-auto border rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Display Photo if available */}
        {ambassador.photoUrl && (
          <div className="mt-6">
            <p className="font-medium text-sm text-gray-500 mb-2">Profile Photo</p>
            <img
              src={ambassador.photoUrl}
              alt="Profile"
              className="w-32 h-auto border rounded-md"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}