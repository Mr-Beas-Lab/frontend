import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase/firebaseConfig"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import Receipts from "../components/ambassador/Receipts"
import BankAccounts from "../components/ambassador/BankAccounts"
import { ExchangeRateForm } from "../components/ExchangeRateForm"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Info } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import type { Ambassador } from "../types"
import { AmbassadorDashboardSkeleton } from "../components/ui/SkeletonLoader"
import ExternalWallet from '../components/ambassador/ExternalWallet'

const AmbassadorDashboard: React.FC = () => {
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { currentUser } = useAuth()
  const [searchParams] = useSearchParams()
  const ambassadorId = searchParams.get("userId") || currentUser?.uid

  useEffect(() => {
    const fetchData = async () => {
      if (!ambassadorId) {
        setError("No ambassador ID found")
        setLoading(false)
        return
      }

      try {
        const ambassadorDoc = await getDoc(doc(db, "staffs", ambassadorId))
        if (ambassadorDoc.exists()) {
          setAmbassador({ id: ambassadorDoc.id, ...ambassadorDoc.data() } as Ambassador)
        } else {
          setError("Ambassador not found")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load ambassador data")
      } finally {
        const minimumDelay = 500
        const loadingStartTime = Date.now()
        const timeElapsed = Date.now() - loadingStartTime
        if (timeElapsed < minimumDelay) {
          await new Promise(resolve => setTimeout(resolve, minimumDelay - timeElapsed))
        }
        setLoading(false)
      }
    }

    fetchData()
  }, [ambassadorId])

  if (loading) {
    return <AmbassadorDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ambassador Dashboard</h1>

      {ambassador?.kycStatus === "pending" && (
        <Alert variant="warning" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your KYC is under review. {" "}
            <Link to="/complete-kyc" className="text-primary underline">
              View your KYC status
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {ambassador && (
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-shrink-0">
            <img
              src={ambassador.photoUrl || "/placeholder.svg"}
              alt={ambassador.firstName}
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{ambassador.firstName + " " + ambassador.lastName}</h2>
            <p className="text-gray-500 mb-4">{ambassador.email}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p>{ambassador.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Country</p>
                <p className="font-medium text-primary">{ambassador.country}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="receipts" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="receipts">My Receipts</TabsTrigger>
          <TabsTrigger value="bankAccounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="exchangeRate">Exchange Rate</TabsTrigger>
          <TabsTrigger value="externalWallet">External Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts">
          <Receipts />
        </TabsContent>

        <TabsContent value="bankAccounts">
          <BankAccounts />
        </TabsContent>

        <TabsContent value="exchangeRate">
          <ExchangeRateForm country={ambassador?.country ?? ''} />
        </TabsContent>

        <TabsContent value="externalWallet">
          <ExternalWallet />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AmbassadorDashboard

