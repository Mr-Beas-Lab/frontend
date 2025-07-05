export interface KYCApplication {
  id: string // Unique identifier for the KYC application
  ambassadorId: string // ID of the user who submitted the application
  firstName: string // Applicant's first name
  lastName: string // Applicant's last name
  tgUsername: string // Applicant's tg name
  email: string // Applicant's email address
  phone: string // Applicant's phone number
  address: string // Applicant's address
  country: string // Applicant's country
  documentType: string // Type of document submitted (e.g., "Passport", "Driver's License")
  photoUrl: string
  documentFrontUrl: string // URL to the front of the document
  documentBackUrl?: string // Optional URL to the back of the document (if applicable)
  status: "PENDING" | "APPROVED" | "REJECTED" // Status of the KYC application
  submittedAt: string // Timestamp when the application was submitted (in ISO format)
  reviewedAt?: string // Optional timestamp when the application was reviewed (in ISO format)
  reviewedBy?: string // Optional ID of the admin who reviewed the application
  rejectionReason?: string // Optional reason for rejection (if status is "rejected")
}
export interface Receipt {
  id: string
  amount: number
  currency: string
  status: string
  ambassadorId?: string
  ambassadorName?: string
  ambassadorEmail?: string
  senderTgId: string
  documents: string[]
  createdAt: Date
  adminReview?: boolean
}

export interface Transaction {
  id: string
  amount: number
  currency: string
  status: string
  ambassadorId?: string
  type: "deposit" | "withdrawal"
  createdAt: Date
}

export interface BankAccount {
  id: string
  accountHolderName: string
  accountNumber: string
  bankName: string
  branch: string
  ifscCode: string
  accountType: string
  createdAt: string
}

export interface PaymentMethod {
  type: string
  details: Record<string, any>
}

export interface Ambassador {
  id: string
  uid?: string  // Firebase UID
  firstName: string
  lastName: string
  tgUsername: string
  email: string
  phone: string
  address?: string // Optional field
  idFront?: string // Optional field (URL or base64 string)
  idBack?: string // Optional field (URL or base64 string)
  country: string
  countryCode?: string // Country code (e.g., VE for Venezuela)
  photoUrl?: string // Optional field (URL or base64 string)
  paymentMethods: PaymentMethod[] // Array of payment methods
  createdAt: Date
  role: string //  "ambassador", "admin"
  kyc: string // "pending", "approved", "rejected", defaults to "pending"
}

export interface Country {
  name: string
  currency: string
  code: string
  flag: string
}

export interface AdminUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tgUsername?: string;
  role: 'admin';
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string
  uid: string
  firstName: string
  lastName: string
  email: string
  role: string
  kycStatus?: string
}

export interface LoginResponse {
  error?: string
  firstName?: string
  lastName?: string
  token?: string
  user?: AuthUser
}

export interface ApiError {
  error: 'unauthorized' | 'network-error' | string
  message?: string
}

