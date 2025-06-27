import { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { FileUpload } from "../FileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import SubmitMessage from "./SubmitMessage";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import countries from "../../lib/countries.json"; 
import { submitKycApplication } from "../../api/kyc";
import { useToast } from "../ui/use-toast";

interface KYCFormProps {
  ambassadorId: string;
}

export default function KYCForm({ ambassadorId }: KYCFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    tgUsername: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    documentType: "Passport",
    photoUrl: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string | null>>({
    firstName: null,
    lastName: null,
    tgUsername: null,
    email: null,
    phone: null,
    address: null,
    country: null,
    documentType: null,
    photo: null,
    idFront: null,
    idBack: null,
    submit: null,
  });

  useEffect(() => {
    const fetchAmbassadorData = async () => {
      try {
        setIsLoading(true);
        const ambassadorDoc = await getDoc(doc(db, "staffs", ambassadorId));
        if (ambassadorDoc.exists()) {
          const data = ambassadorDoc.data();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            tgUsername: data.tgUsername || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            country: data.country || "",
            documentType: data.documentType || "Passport",
            photoUrl: data.photoUrl || "",
          });

          if (data.photoUrl) {
            setPhotoPreview(data.photoUrl);
          }

          if (data.documentFrontUrl) {
            setIdFrontPreview(data.documentFrontUrl);
          }
          if (data.documentBackUrl) {
            setIdBackPreview(data.documentBackUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching ambassador data:", err);
        toast({
          title: "Error loading profile data",
          description: "We couldn't load your profile information. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAmbassadorData();
  }, [ambassadorId, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDocumentTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, documentType: value }));
    if (errors.documentType) {
      setErrors((prev) => ({ ...prev, documentType: null }));
    }
  };

  const handlePhotoChange = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, photo: "File size exceeds 5MB limit" }));
        toast({
          title: "File too large",
          description: "Profile photo must be smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, photo: "Only image files are allowed" }));
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPEG, etc.)",
          variant: "destructive"
        });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setPhotoFile(file);
      setPhotoPreview(previewUrl);
      setErrors((prev) => ({ ...prev, photo: null }));
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const handleFileChange = (
    fileType: "idFront" | "idBack",
    file: File | null
  ) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [fileType]: "File size exceeds 5MB limit" }));
        toast({
          title: "File too large",
          description: `ID ${fileType === "idFront" ? "front" : "back"} image must be smaller than 5MB`,
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, [fileType]: "Only image files are allowed" }));
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPEG, etc.)",
          variant: "destructive"
        });
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      if (fileType === "idFront") {
        setIdFrontFile(file);
        setIdFrontPreview(previewUrl);
      } else if (fileType === "idBack") {
        setIdBackFile(file);
        setIdBackPreview(previewUrl);
      }

      setErrors((prev) => ({ ...prev, [fileType]: null }));
    } else {
      if (fileType === "idFront") {
        setIdFrontFile(null);
        setIdFrontPreview(null);
      } else if (fileType === "idBack") {
        setIdBackFile(null);
        setIdBackPreview(null);
      }
    }
  };

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!isValidPhoneNumber(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
      isValid = false;
    }

    if (!formData.documentType.trim()) {
      newErrors.documentType = "Document type is required";
      isValid = false;
    }

    if (!photoFile && !photoPreview) {
      newErrors.photo = "Profile photo is required";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    
    if (!isValid) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields before proceeding",
        variant: "destructive"
      });
    }
    
    return isValid;
  };

  const validateVerificationInfo = () => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    if (!idFrontFile && !idFrontPreview) {
      newErrors.idFront = "Front side of ID is required";
      isValid = false;
    }

    if (!idBackFile && !idBackPreview) {
      newErrors.idBack = "Back side of ID is required";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (!isValid) {
      toast({
        title: "Missing documents",
        description: "Please upload both sides of your ID",
        variant: "destructive"
      });
    }

    return isValid;
  };

  const handleNextStep = () => {
    if (activeTab === "personal") {
      const isValid = validatePersonalInfo();
      if (isValid) {
        setActiveTab("verification");
        setErrors(prev => ({ ...prev, submit: null }));
      }
    }
  };

  const handlePrevStep = () => {
    setActiveTab("personal");
    setErrors(prev => ({ ...prev, submit: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate verification info before submission
    if (!validateVerificationInfo()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const user = auth.currentUser;
      if (!user) {
        const errorMessage = "You need to be logged in to submit a KYC application.";
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive"
        });
        throw new Error(errorMessage);
      }

      // Check if token is still valid or needs refresh
      await user.getIdToken(true);

      if (ambassadorId !== user.uid) {
        console.error("User ID mismatch:", { 
          providedAmbassadorId: ambassadorId, 
          currentUserUid: user.uid 
        });
        const errorMessage = "You can only submit KYC for your own account.";
        toast({
          title: "Authorization Error",
          description: errorMessage,
          variant: "destructive"
        });
        throw new Error(errorMessage);
      }

      const formDataObj = new FormData();
      formDataObj.append('ambassadorId', user.uid);
      formDataObj.append('firstName', formData.firstName);
      formDataObj.append('lastName', formData.lastName);
      formDataObj.append('tgUsername', formData.tgUsername);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('address', formData.address);
      formDataObj.append('country', formData.country);
      formDataObj.append('documentType', formData.documentType);
      
      if (photoFile) formDataObj.append('photo', photoFile);
      if (idFrontFile) formDataObj.append('idFront', idFrontFile);
      if (idBackFile) formDataObj.append('idBack', idBackFile);
      
      await submitKycApplication(formDataObj);
      
      toast({
        title: "KYC Submitted",
        description: "Your KYC application has been submitted successfully",
      });
      
      setSubmitSuccess(true);
    } catch (error: any) {
      console.error("Error submitting KYC application:", error);
      
      let errorMessage = "Failed to submit KYC application. Please try again later.";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "The KYC submission service is currently unavailable.";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Please check your information.";
        } else if (error.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else if (error.response.status === 413) {
          errorMessage = "The uploaded files are too large. Please resize your images.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Cannot connect to the server. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return <SubmitMessage />;
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto my-5">
      <CardHeader>
        <CardTitle>Ambassador KYC Verification</CardTitle>
        <CardDescription>
          Complete your KYC verification to become an ambassador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="verification">ID Verification</TabsTrigger>
          </TabsList>

          {errors.submit && (
            <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-4">
              {errors.submit}
            </div>
          )}

          <TabsContent value="personal">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tgUsername">Telegram Username</Label>
                <Input
                  id="tgUsername"
                  name="tgUsername"
                  value={formData.tgUsername}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className={errors.tgUsername ? "border-red-500" : ""}
                />
                {errors.tgUsername && (
                  <p className="text-sm text-red-500">{errors.tgUsername}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="mrjohn@example.com"
                  className={errors.email ? "border-red-500" : ""}
                  disabled
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                >
                  <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country, index) => (
                      <SelectItem key={index} value={country.name} className="bg-black">
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneInput
                  defaultCountry="VE"
                  value={formData.phone}
                  onChange={(value:any) => setFormData((prev) => ({ ...prev, phone: value || "" }))}
                  className={`w-full p-2 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-md`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={handleDocumentTypeChange}
                >
                  <SelectTrigger
                    className={errors.documentType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent className="bg-black">
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="Driver's License">
                      Driver's License
                    </SelectItem>
                    <SelectItem value="National ID">National ID</SelectItem>
                  </SelectContent>
                </Select>
                {errors.documentType && (
                  <p className="text-sm text-red-500">
                    {errors.documentType}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, Apt 4B"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="photo">Profile Photo</Label>
                <FileUpload
                  id="file-upload"
                  label="Upload Image"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handlePhotoChange}
                  previewUrl={photoPreview}
                  error={errors.photo}
                />
                {errors.photo && (
                  <p className="text-sm text-red-500">{errors.photo}</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">
                    ID Verification Requirements
                  </h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>
                      Government-issued ID (passport, driver's license, or
                      national ID)
                    </li>
                    <li>Both front and back sides of your ID</li>
                    <li>Clear, unobstructed view of the entire document</li>
                    <li>All text and photos must be clearly visible</li>
                    <li>Files must be less than 5MB in size</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    id="idFront"
                    label="Front side of ID"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(file) => handleFileChange("idFront", file)}
                    previewUrl={idFrontPreview}
                    error={errors.idFront}
                  />

                  <FileUpload
                    id="idBack"
                    label="Back side of ID"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(file) => handleFileChange("idBack", file)}
                    previewUrl={idBackPreview}
                    error={errors.idBack}
                  />
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        {activeTab === "verification" ? (
          <>
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="ml-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </>
        ) : (
          <Button 
            type="button" 
            onClick={handleNextStep} 
            className="ml-auto"
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}