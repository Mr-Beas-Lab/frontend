import type React from "react"
import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { db } from "../../firebase/firebaseConfig"
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { toast } from "sonner"
import { CheckCircle, Loader2 } from "lucide-react"

// Define the type for the form data
type BankAccountFormData = {
  accountHolderName: string
  accountNumber: string
  bankName: string
  branch: string
  ifscCode: string
  accountType: "savings" | "current"
}

const AddBankAccount: React.FC = () => {
  // Initialize state with TypeScript types
  const [formData, setFormData] = useState<BankAccountFormData>({
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    branch: "",
    ifscCode: "",
    accountType: "savings",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle select changes
  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Validate form
  const validateForm = () => {
    if (!formData.accountHolderName.trim()) {
      setError("Account holder name is required")
      return false
    }
    if (!formData.accountNumber.trim()) {
      setError("Account number is required")
      return false
    }
    if (!formData.bankName.trim()) {
      setError("Bank name is required")
      return false
    }
    if (!formData.branch.trim()) {
      setError("Branch is required")
      return false
    }
    if (!formData.ifscCode.trim()) {
      setError("IFSC code is required")
      return false
    }
    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    if (!currentUser) {
      setError("You must be logged in to add a bank account")
      return
    }

    setIsSubmitting(true)

    try {
      // Create bank account object
      const bankAccount = {
        id: Date.now().toString(), // Generate a unique ID
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        branch: formData.branch,
        ifscCode: formData.ifscCode,
        accountType: formData.accountType,
        createdAt: new Date().toISOString(),
      }

      // Get reference to the user document
      const userRef = doc(db, "staffs", currentUser.uid)

      // Check if user has paymentMethods array
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        // Update the user document with the new bank account
        await updateDoc(userRef, {
          paymentMethods: arrayUnion({
            type: "bank",
            details: bankAccount,
          }),
        })
      } else {
        setError("User profile not found")
        setIsSubmitting(false)
        return
      }

      // Show success message
      setSubmitSuccess(true)
      toast.success("Bank account added successfully!")

      // Reset form after submission
      setFormData({
        accountHolderName: "",
        accountNumber: "",
        bankName: "",
        branch: "",
        ifscCode: "",
        accountType: "savings",
      })

      // Reset success state after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error adding bank account:", error)
      setError("Failed to add bank account. Please try again.")
      toast.error("Failed to add bank account")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Bank Account Added</CardTitle>
          <CardDescription className="text-center">Your bank account has been added successfully</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <p className="text-center max-w-md">
            Your bank account details have been saved. You can now receive payments to this account.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Bank Account</CardTitle>
        <CardDescription>Add your bank account details to receive payments</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="1234567890"
              required
            />
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Bank of Venezuela"
              required
            />
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="Main Branch"
              required
            />
          </div>

          {/* IFSC Code */}
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC/SWIFT Code</Label>
            <Input
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="ABCD0123456"
              required
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select value={formData.accountType} onValueChange={(value) => handleSelectChange(value, "accountType")}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="current">Current</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Bank Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AddBankAccount

