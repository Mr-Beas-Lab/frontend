import apiClient from './apiClient';
import { auth } from '../firebase/firebaseConfig';
import { signInWithCustomToken } from 'firebase/auth';

export interface CreateAmbassadorRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tgUsername: string;
  phone: string;
  country: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tgUsername: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  uid: string;
  role: string;
  accessToken: string;
  email: string;
}

export interface LoginResponse {
  message: string;
  uid: string;
  role: string;
  accessToken: string;
  email: string;
}

// Login function
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    // Clear any existing tokens and user data
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('backendToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    const response = await apiClient.post('/auth/login', data);
    const customToken = response.data.accessToken;
    
    if (!customToken) {
      throw { error: 'invalid-token', message: 'No custom token received from server' };
    }
    
    try {
      // Sign in with Firebase custom token
      const userCredential = await signInWithCustomToken(auth, customToken);
      const idToken = await userCredential.user.getIdToken();
      
      // Store tokens
      localStorage.setItem('firebaseToken', idToken);
      localStorage.setItem('backendToken', customToken);
      localStorage.setItem('accessToken', idToken);
      
      // Store user data as a plain object
      const userData = {
        uid: response.data.uid,
        email: response.data.email,
        role: response.data.role,
        accessToken: idToken
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update response with ID token
      response.data.accessToken = idToken;
      
      return response.data;
    } catch (firebaseError: any) {
      console.error("Firebase token exchange error:", firebaseError);
      
      // Clear all tokens on error
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('backendToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Handle specific Firebase errors
      if (firebaseError.code === 'auth/user-disabled') {
        throw { 
          error: 'account-disabled', 
          message: 'Your account has been deactivated. Please contact your administrator for assistance.' 
        };
      } else if (firebaseError.code === 'auth/invalid-custom-token') {
        throw {
          error: 'invalid-token',
          message: 'Authentication failed. Please try logging in again.'
        };
      }
      
      throw {
        error: 'firebase-error',
        message: 'Failed to authenticate with Firebase. Please try again.'
      };
    }
  } catch (error: any) {
    console.error("Login error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Clear all tokens on error
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('backendToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Check if the server provided a specific error message
    if (error.response?.data?.message) {
      throw { 
        error: 'auth-error', 
        message: error.response.data.message 
      };
    } else if (error.error) {
      throw error;
    } else if (error.response?.status === 401) {
      throw { 
        error: 'invalid-credentials', 
        message: 'Invalid email or password. Please try again.' 
      };
    } else if (error.response?.status === 404) {
      throw { error: 'user-not-found', message: 'User not found' };
    } else if (error.response?.status === 400) {
      throw { error: 'invalid-data', message: 'Invalid login data provided' };
    } else if (error.code === 'ERR_NETWORK') {
      throw { 
        error: 'network-error', 
        message: 'Unable to connect to the server. Please check your connection.' 
      };
    } else if (error.code === 'ECONNABORTED') {
      throw { 
        error: 'timeout-error', 
        message: 'Request timed out. Please try again later.' 
      };
    }
    
    throw { error: 'server-error', message: 'Something went wrong. Please try again later.' };
  }
};

// Ambassador registration
export const registerAmbassador = async (
  data: CreateAmbassadorRequest
): Promise<AuthResponse> => {
  try {
 
    const response = await apiClient.post('/ambassador', data);
     
    return response.data;
  } catch (error: any) {
    console.error("API call error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // If the server responded but with an error, it means we connected successfully
    if (error.response) {
      console.log("Server responded with error, but connection was successful");
      
      // Handle validation errors
      if (error.response.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          throw { 
            error: 'validation-error',
            message: error.response.data.message[0]
          };
        } else {
          throw { 
            error: error.response.data.error || 'server-error',
            message: error.response.data.message
          };
        }
      }
      
      // Handle based on status code
      if (error.response.status === 409) {
        // Improved user-friendly error for email already in use
        throw { 
          error: 'email-exists', 
          message: 'This email address is already registered. Please use a different email address or try logging in.'
        };
      } else if (error.response.status === 400) {
        throw { error: 'invalid-data', message: 'Invalid data provided' };
      } else if (error.response.status === 401 || error.response.status === 403) {
        throw { error: 'unauthorized', message: 'Unauthorized access' };
      } else if (error.response.status === 500) {
        throw { error: 'server-error', message: 'Server error. The request was received but processing failed.' };
      } else {
        // Server responded with an unexpected format
        throw { 
          error: 'unexpected-response', 
          message: 'The server responded in an unexpected format. Check the backend logs.' 
        };
      }
    }
    
    // Connection error (CORS, server not running, etc.)
    if (error.code === 'ERR_NETWORK') {
      throw { 
        error: 'network-error', 
        message: 'Could not connect to the server. Please check your connection or try again later.'
      };
    }
    
    // Other unknown errors
    throw { error: 'server-error', message: 'An error occurred. Please try again.' };
  }
};

// Admin registration
export const registerAdmin = async (
  data: CreateAdminRequest
): Promise<AuthResponse> => {
  try {
     
      const response = await apiClient.post('/admin', data);
     
    return response.data;
  } catch (error: any) {
    console.error("API call error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // If the server responded but with an error, it means we connected successfully
    if (error.response) {
      console.log("Server responded with error, but connection was successful");
      
      // Handle validation errors
      if (error.response.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          throw { 
            error: 'validation-error',
            message: error.response.data.message[0]
          };
        } else {
          throw { 
            error: error.response.data.error || 'server-error',
            message: error.response.data.message
          };
        }
      }
      
      // Handle based on status code
      if (error.response.status === 409) {
        throw { error: 'email-exists', message: 'Email is already in use' };
      } else if (error.response.status === 400) {
        throw { error: 'invalid-data', message: 'Invalid data provided' };
      } else if (error.response.status === 403) {
        throw { error: 'permission-denied', message: 'Only superadmins can create admin users' };
      } else if (error.response.status === 500) {
        throw { error: 'server-error', message: 'Server error. The request was received but processing failed.' };
      } else {
        // Server responded with an unexpected format
        throw { 
          error: 'unexpected-response', 
          message: 'The server responded in an unexpected format. Check the backend logs.' 
        };
      }
    }
    
    // Connection error (CORS, server not running, etc.)
    if (error.code === 'ERR_NETWORK') {
      throw { 
        error: 'network-error', 
        message: 'Could not connect to the server. Please check your connection or try again later.'
      };
    }
    
    // Other unknown errors
    throw { error: 'server-error', message: 'An error occurred. Please try again.' };
  }
};

// Role verification
export interface VerifyRoleResponse {
  uid: string;
  role: "admin" | "ambassador" | "superadmin";
  email: string;
}

export const verifyRole = async (): Promise<VerifyRoleResponse> => {
  try {
    const response = await apiClient.get('/auth/verify-role');
    return response.data;
  } catch (error: any) {
    console.error("Role verification error:", error);
    
    if (error.response?.status === 401) {
      throw { error: 'unauthorized', message: 'Authentication required' };
    } else if (error.response?.status === 403) {
      throw { error: 'forbidden', message: 'You do not have permission to access this resource' };
    } else if (error.code === 'ERR_NETWORK') {
      throw { error: 'network-error', message: 'Network error. Please check your connection.' };
    }
    
    throw { error: 'verification-failed', message: 'Failed to verify user role.' };
  }
}; 