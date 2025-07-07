import { useEffect, useState } from 'react';
import { Ambassador } from '../../types';
import { getAllAmbassadors, deleteAmbassador } from '../../api/ambassadorService';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Loader2, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import AmbassadorList from '../admin/AmbassadorList';
import AmbassadorViewDialog from '../admin/AmbassadorViewDialog';

export default function AmbassadorManagement() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [currentAmbassador, setCurrentAmbassador] = useState<Ambassador | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ambassadorToDelete, setAmbassadorToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const fetchAmbassadors = async () => {
    setLoading(true);
    try {
      const data = await getAllAmbassadors();
      setAmbassadors(data);
      setApiStatus(true);
    } catch (error) {
      console.error("Error fetching ambassadors:", error);
      setApiStatus(false);
      toast.error("Failed to load ambassadors");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmation = (ambassadorUid: string) => {
    if (!ambassadorUid || ambassadorUid === 'undefined') {
      toast.error("Cannot delete ambassador: Invalid UID");
      return;
    }

    if (ambassadorUid.length < 20 || ambassadorUid.includes('@')) {
      toast.error("Invalid Firebase UID format");
      return;
    }

    setAmbassadorToDelete(ambassadorUid);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteAmbassador = async () => {
    if (!ambassadorToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAmbassador(ambassadorToDelete);
      setAmbassadors(prev => prev.filter(amb => amb.uid !== ambassadorToDelete));
      toast.success("Ambassador deleted successfully");
      setIsDeleteDialogOpen(false);
      setAmbassadorToDelete(null);
    } catch (error) {
      console.error("Error deleting ambassador:", error);
      toast.error("Failed to delete ambassador");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Manage Ambassadors</h2>

      {!apiStatus && (
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

      <AmbassadorViewDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        ambassador={currentAmbassador}
      />

      {/* Delete Confirmation Dialog */}
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
