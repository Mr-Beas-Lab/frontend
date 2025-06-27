import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

const SubmitMessage = () => {
  const navigate = useNavigate()
  
  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/ambassador-dashboard")
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [navigate])
  
  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <Card className="w-full max-w-md mx-auto shadow-lg border-green-100 animate-fade-in">
        <CardHeader className="pb-2 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Application Submitted!</CardTitle>
          <CardDescription className="text-center text-base mt-2">
            Your KYC application has been received
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-2 pb-6 px-6">
          <div className="bg-green-50 text-green-700 rounded-lg p-4 mb-6 w-full text-center">
            <p className="text-sm">
              Thank you for submitting your KYC information. Our team will review your
              application and update you on the status soon.
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground mb-6 text-center">
            You'll be redirected to your dashboard in a few seconds...
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/ambassador-dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Submit Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubmitMessage