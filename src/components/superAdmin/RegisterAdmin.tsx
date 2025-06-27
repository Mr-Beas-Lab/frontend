import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { CheckCircle } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { E164Number } from "libphonenumber-js";
import { registerAdmin } from "../../api/auth";


export default function AdminRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    tgUsername:"",
    email: "",
    phone: "",
    password: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({
    firstName: null,
    lastName: null,
    tgUsername: null,
    email: null,
    phone: null,
    password: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhoneChange = (value: E164Number | undefined) => {
    setFormData(prev => ({ ...prev, phone: value || "" }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: null }));
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
      newErrors.tgUsername = "telegram  username is required";
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
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
  
      // Using the new API service for admin registration
      const response = await registerAdmin({
        email: formData.email,
        password: formData.password,
        tgUsername: formData.tgUsername,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
  
      console.log("Admin Created Successfully:", response);
      setSubmitSuccess(true);
  
    } catch (error: any) {
      // Log detailed error info to console only
      console.error("Error submitting registration:", error);
  
      // Clear previous errors
      setErrors({
        firstName: null,
        lastName: null,
        tgUsername: null,
        email: null,
        phone: null,
        password: null,
      });
      
      // User-friendly error handling
      if (error.error === "permission-denied") {
        setErrors((prev) => ({ ...prev, email: "You don't have permission to create admin accounts." }));
      } else if (error.error === "email-exists") {
        setErrors((prev) => ({ ...prev, email: "Email is already in use." }));
      } else if (error.error === "invalid-data") {
        setErrors((prev) => ({ ...prev, email: "Please check your information and try again." }));
      } else if (error.error === "validation-error") {
        // User-friendly field validation errors
        const errorMessage = error.message || "";
        if (errorMessage.includes("email")) {
          setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
        } else if (errorMessage.includes("password")) {
          setErrors((prev) => ({ ...prev, password: "Please check your password and try again." }));
        } else if (errorMessage.includes("firstName")) {
          setErrors((prev) => ({ ...prev, firstName: "Please provide your first name." }));
        } else if (errorMessage.includes("lastName")) {
          setErrors((prev) => ({ ...prev, lastName: "Please provide your last name." }));
        } else if (errorMessage.includes("phone")) {
          setErrors((prev) => ({ ...prev, phone: "Please enter a valid phone number." }));
        } else if (errorMessage.includes("tgUsername")) {
          setErrors((prev) => ({ ...prev, tgUsername: "Please provide your Telegram username." }));
        } else {
          // Default error on email field for consistency
          setErrors((prev) => ({ ...prev, email: "There was a problem with your registration. Please try again." }));
        }
      } else {
        // Generic error on email field
        setErrors((prev) => ({ ...prev, email: "Something went wrong. Please try again later." }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (submitSuccess) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Registration Successful</CardTitle>

        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />

        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-3xl mx-auto my-5">
        <CardHeader>
          <CardTitle>Admin Registration</CardTitle>
          <CardDescription>
            Complete your registration to create an admin account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                placeholder="@abc"
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
                placeholder="john@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <PhoneInput
                international
                defaultCountry="US"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full p-2 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-md`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Register"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}