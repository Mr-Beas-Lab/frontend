import axios from 'axios';
import config from './config';
import { auth } from '../firebase/firebaseConfig';

// Create a custom axios instance with some default config
const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get a fresh Firebase ID token for each request
      let token = '';
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken(true);
      } else {
        // Fallback to stored token if no current user
        token = localStorage.getItem('accessToken') || '';
      }
    
      // If token exists, add Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Only log actual errors, not debug info
      if (error instanceof Error) {
        console.error('Error getting auth token:', error.message);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to retry failed requests
const retryRequest = async (error: any, maxRetries = config.MAX_RETRIES) => {
  const { config: originalConfig } = error;
  
  // Check if we should retry
  if (!originalConfig || !maxRetries) {
    return Promise.reject(error);
  }
  
  // Set the retry count on the config
  const retryCount = originalConfig.__retryCount || 0;
  originalConfig.__retryCount = retryCount + 1;
  
  if (retryCount >= maxRetries) {
    return Promise.reject(error);
  }
  
  // Delay before retrying
  await new Promise(resolve => setTimeout(resolve, config.RETRY_DELAY));
  
  // Create a new axios instance for this retry to avoid interceptor loops
  return axios(originalConfig);
};

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check for network errors and retry if applicable
    if (!error.response && error.code === 'ERR_NETWORK') {
      try {
        return await retryRequest(error);
      } catch (retryError) {
        // If retry also fails, continue with normal error handling
      }
    }
    
    // Handle unauthorized error (401) - Do not redirect if it's a verification request
    if (error.response && error.response.status === 401) {
      // Get the URL from the error config
      const requestUrl = error.config?.url;
      
      // Check if this is a verification request - don't redirect automatically
      const isVerificationRequest = requestUrl && 
        (requestUrl.includes('/verify-role') || 
         requestUrl.includes('/auth/me') ||
         requestUrl.includes('/auth/verify'));
         
      if (!isVerificationRequest) {
        // Clear authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Redirect to login (if not already there)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 