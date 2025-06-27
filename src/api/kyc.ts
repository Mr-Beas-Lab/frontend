import apiClient from './apiClient';
import { KYCApplication } from '../types';
import { auth } from '../firebase/firebaseConfig';
import config from './config';

/**
 * Submit a KYC application with required files
 */
export const submitKycApplication = async (
  formData: FormData,
): Promise<KYCApplication> => {
  try {
    // Get the Firebase ID token for API authentication
    let token = '';
    if (auth.currentUser) {
      // Get a fresh token from Firebase Auth
      token = await auth.currentUser.getIdToken(true);
      console.log('Using fresh Firebase ID token for KYC submission');
    } else {
      console.error('No authenticated user found for KYC submission');
      throw new Error('You must be logged in to submit KYC information');
    }
    
    const response = await apiClient.post('/kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      // Use extended timeout for file uploads
      timeout: config.TIMEOUT * 2, // Double the default timeout for large file uploads
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting KYC application:', error);
    throw error;
  }
};

/**
 * Get a KYC application by ambassador ID
 */
export const getKycApplication = async (ambassadorId: string): Promise<KYCApplication> => {
  try {
    const response = await apiClient.get(`/kyc/ambassador/${ambassadorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching KYC application:', error);
    throw error;
  }
};

/**
 * Get all KYC applications (admin only)
 */
export const getAllKycApplications = async (): Promise<KYCApplication[]> => {
  try {
    const response = await apiClient.get('/kyc');
    return response.data;
  } catch (error) {
    console.error('Error fetching all KYC applications:', error);
    throw error;
  }
};

/**
 * Get pending KYC applications (admin only)
 */
export const getPendingKycApplications = async (): Promise<KYCApplication[]> => {
  try {
    const response = await apiClient.get('/kyc/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending KYC applications:', error);
    throw error;
  }
};

/**
 * Approve a KYC application (admin only)
 */
export const approveKycApplication = async (ambassadorId: string): Promise<KYCApplication> => {
  try {
    const response = await apiClient.patch(`/kyc/${ambassadorId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error approving KYC application:', error);
    throw error;
  }
};

/**
 * Reject a KYC application with a reason (admin only)
 */
export const rejectKycApplication = async (
  ambassadorId: string,
  rejectionReason: string,
): Promise<KYCApplication> => {
  try {
    const response = await apiClient.patch(`/kyc/${ambassadorId}/reject`, { rejectionReason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting KYC application:', error);
    throw error;
  }
};

/**
 * Delete a KYC application (admin only)
 */
export const deleteKycApplication = async (ambassadorId: string): Promise<void> => {
  try {
    console.log(`Attempting to delete KYC application for ambassador ID: ${ambassadorId}`);
    await apiClient.delete(`/kyc/${ambassadorId}`);
    console.log(`Successfully deleted KYC application for ambassador ID: ${ambassadorId}`);
  } catch (error: any) {
    console.error(`Error deleting KYC application for ambassador ${ambassadorId}:`, error);
    
    if (error.response?.status === 404) {
      console.log(`No KYC application found for ambassador ID: ${ambassadorId}`);
      // Don't throw error if KYC application doesn't exist - it's okay
      return;
    }
    
    throw error;
  }
}; 