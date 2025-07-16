import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { E164Number } from "libphonenumber-js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import countries from "../lib/countries.json"; 
import { registerAmbassador } from "../api/auth";
import { Link } from "react-router-dom";

export default function AmbassadorRegister() {
  const router = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showLoginLink, setShowLoginLink] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    tgUsername: "",
    email: "",
    phone: "",
    password: "",
    country: "", 
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({
    firstName: null,
    lastName: null,
    tgUsername: null,
    email: null,
    phone: null,
    password: null,
    country: null, 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePhoneChange = (value: E164Number | undefined) => {
    const formattedPhone = value ? value.replace(/\s/g, "") : ""; 
    setFormData((prev) => ({ ...prev, phone: formattedPhone }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  const handleCountryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }));
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: null }));
    }
  };

  const validateForm = () => {
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

    if (!formData.tgUsername.trim()) {
      newErrors.tgUsername = "Telegram username is required";
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

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Log the data being sent to the API
      console.log("Sending data to API:", {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        tgUsername: formData.tgUsername,
        phone: formData.phone,
        country: formData.country,  
      });

      // Using the new API service
      const response = await registerAmbassador({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        tgUsername: formData.tgUsername,
        phone: formData.phone,
        country: formData.country,  
      });

      console.log("Ambassador Created Successfully:", response);

      setSubmitSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        router("/login");
      }, 2000);
    } catch (error: any) {
      // Detailed error logging (only visible in console)
      console.error("Error submitting registration:", error);
      console.error("Error details:", {
        error: error,
        message: error.message,
        errorType: error.error,
        response: error.response
      });

      // Clear previous errors
      setErrors({
        firstName: null,
        lastName: null,
        tgUsername: null,
        email: null,
        phone: null,
        password: null,
        country: null,
      });

      // Handle different error types - Check for Conflict/email exists error
      if (error.error === "email-exists" || error.error === "Conflict" || 
          (error.message && error.message.toLowerCase().includes("email") && 
           error.message.toLowerCase().includes("already in use"))) {
        // Display the user-friendly message below the email field
        setErrors((prev) => ({ ...prev, email: "Email is already in use." }));
        
        // Enable the login link for email-exists errors
        setShowLoginLink(true);
        
        // Don't show the API error for email-exists
      } else if (error.error === "invalid-data") {
        // Show specific field error if possible
        setErrors((prev) => ({ ...prev, email: "Please check your information and try again." }));
      } else if (error.error === "network-error" || error.error === "unexpected-response") {
        // Generic connection errors should show in the API error alert
      } else if (error.error === "validation-error") {
        // Extract field name from validation error message
        const errorMessage = error.message || "";
        let foundFieldError = false;
        
        // Check for specific field errors in the error message
        const fieldChecks = [
          { field: "email", message: "Please enter a valid email address." },
          { field: "password", message: "Please check your password and try again." },
          { field: "firstName", message: "Please provide your first name." },
          { field: "lastName", message: "Please provide your last name." },
          { field: "phone", message: "Please enter a valid phone number." },
          { field: "tgUsername", message: "Please provide your Telegram username." },
          { field: "country", message: "Please select your country." }
        ];
        
        // Set errors for specific fields mentioned in the error message
        fieldChecks.forEach(check => {
          if (errorMessage.toLowerCase().includes(check.field.toLowerCase())) {
            setErrors(prev => ({ ...prev, [check.field]: check.message }));
            foundFieldError = true;
          }
        });
        
        // Only show API error if no field errors were found
        if (!foundFieldError) {
        } else {
        }
      } else {
        // Generic error for unexpected issues
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (submitSuccess) {
    return (
      <Card className="w-full max-w-3xl mx-auto my-5 bg-black border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-center text-white">Registration Successful</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Your ambassador account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="h-16 w-16 rounded-full bg-green-800 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-center text-gray-400 mb-4">
            You will be redirected to the login page in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Regular form view
  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-3xl mx-auto my-5 bg-black border-gray-800 text-white">
        <CardHeader>
          <CardTitle className="text-white">Ambassador Registration</CardTitle>
          <CardDescription className="text-gray-400">
            Complete your registration to become an ambassador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                className={`bg-gray-900 border-gray-700 text-white placeholder-gray-500 ${errors.firstName ? "border-red-500" : ""}`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                className={`bg-gray-900 border-gray-700 text-white placeholder-gray-500 ${errors.lastName ? "border-red-500" : ""}`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tgUsername" className="text-white">Telegram Username</Label>
              <Input
                id="tgUsername"
                name="tgUsername"
                value={formData.tgUsername}
                onChange={handleInputChange}
                placeholder="@username"
                className={`bg-gray-900 border-gray-700 text-white placeholder-gray-500 ${errors.tgUsername ? "border-red-500" : ""}`}
              />
              {errors.tgUsername && (
                <p className="text-sm text-red-400">{errors.tgUsername}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={`bg-gray-900 border-gray-700 text-white placeholder-gray-500 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
              {showLoginLink && (
                <div className="mt-1">
                  <Link to="/login" className="text-sm text-blue-light hover:text-blue-300 hover:underline">
                    Log in with this email instead
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">Phone Number</Label>
              <PhoneInput
                international
                defaultCountry="VE" 
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full p-2 border rounded-md bg-gray-900 ${
                  errors.phone ? "border-red-500" : "border-gray-700"
                } text-white`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2" >
              <Label htmlFor="country" className="text-white">Country</Label>
              <Select value={formData.country} onValueChange={handleCountryChange}>
                <SelectTrigger
                  className={`text-white bg-gray-900 border-gray-700 ${errors.country ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>

                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  {countries.map((country, index) => (
                    <SelectItem
                      key={index}
                      value={country.name}
                      className="hover:bg-gray-800 focus:bg-gray-800 text-white"
                    >
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.country && (
                <p className="text-sm text-red-400">{errors.country}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                className={`bg-gray-900 border-gray-700 text-white placeholder-gray-500 ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-gray-800 hover:bg-gray-700 text-white">
            {isSubmitting ? "Submitting..." : "Register"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}