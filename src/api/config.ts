// API configuration

// Get the URL from environment variables with fallbacks
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                    // Check if we're in development mode
                    (import.meta.env.DEV ? 
                      // Development URL
                      'http://localhost:4000/api/v1' : 
                      // Production URL
                      'https://dashboard-backend.mrbeas.net/api/v1');

// Export configuration
export const config = {
  API_BASE_URL,
  TIMEOUT: 60000, // 60 seconds timeout for large file uploads
  RETRY_DELAY: 1000, // 1 second between retries
  MAX_RETRIES: 2, // Maximum number of retries
};

export default config; 