// API configuration

// Get the URL based on environment
let API_BASE_URL: string;

if (import.meta.env.DEV) {
  // Development mode - use localhost or VITE_API_URL if set
  API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
} else {
  // Production mode - always use production backend
  API_BASE_URL = 'https://dashboard-backend.mrbeas.net/api/v1';
}

// Export configuration
export const config = {
  API_BASE_URL,
  TIMEOUT: 60000, // 60 seconds timeout for large file uploads
  RETRY_DELAY: 1000, // 1 second between retries
  MAX_RETRIES: 2, // Maximum number of retries
};

export default config; 