import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { db } from "../../firebase/firebaseConfig"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

interface BankAccount {
  id: string
  accountHolderName: string
  accountNumber: string
  bankName: string
  branch: string
  ifscCode: string
  accountType: string
  createdAt: string
}

interface PaymentMethod {
  type: string
  details: BankAccount
}

const BankAccountList: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchBankAccounts = async () => {
      if (!currentUser) {
        setLoading(false)
        return
      }

      try {
        const userRef = doc(db, "staffs", currentUser.uid)
        const userDoc = await getDoc(userRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const paymentMethods = userData.paymentMethods || []

          // Filter for bank accounts only
          const bankAccounts = paymentMethods
            .filter((method: PaymentMethod) => method.type === "bank")
            .map((method: PaymentMethod) => method.details)

          setBankAccounts(bankAccounts)
        }
      } catch (err) {
        console.error("Error fetching bank accounts:", err)
        setError("Failed to load bank accounts. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBankAccounts()
  }, [currentUser])

  const handleDeleteClick = (accountId: string) => {
    setAccountToDelete(accountId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!accountToDelete || !currentUser) {
      setIsDeleteDialogOpen(false)
      return
    }

    try {
      const userRef = doc(db, "staffs", currentUser.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        const paymentMethods = userData.paymentMethods || []

        // Filter out the account to delete
        const updatedPaymentMethods = paymentMethods.filter(
          (method: PaymentMethod) => !(method.type === "bank" && method.details.id === accountToDelete),
        )

        // Update Firestore
        await updateDoc(userRef, {
          paymentMethods: updatedPaymentMethods,
        })

        // Update local state
        setBankAccounts(bankAccounts.filter((account) => account.id !== accountToDelete))
        toast.success("Bank account deleted successfully")
      }
    } catch (err) {
      console.error("Error deleting bank account:", err)
      toast.error("Failed to delete bank account")
    } finally {
      setIsDeleteDialogOpen(false)
      setAccountToDelete(null)
    }
  }

  if (loading) {
    return <p>Loading bank accounts...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Bank Accounts</h2>

      {bankAccounts.length === 0 ? (
        <p className="text-muted-foreground">You haven't added any bank accounts yet.</p>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Holder</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.accountHolderName}</TableCell>
                  <TableCell>{account.bankName}</TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell className="capitalize">{account.accountType}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(account.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your bank account information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default BankAccountList

