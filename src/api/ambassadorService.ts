import apiClient from './apiClient';
import { Ambassador } from '../types';

interface CreateAmbassadorRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tgUsername: string;
  phone: string;
  country: string;
}

interface CreateAmbassadorResponse {
  message: string;
  uid: string;
}

/**
 * Creates a new ambassador
 * @param data Ambassador registration data
 * @returns Response with ambassador ID
 */
export const createAmbassador = async (
  data: CreateAmbassadorRequest
): Promise<CreateAmbassadorResponse> => {
  try {
    const response = await apiClient.post('/ambassador', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating ambassador:', error);
    
    if (error.response?.status === 400) {
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message[0] 
        : error.response.data.message;
      throw { error: 'validation-error', message: errorMessage };
    } else if (error.response?.status === 409) {
      throw { error: 'email-exists', message: 'Email is already in use' };
    } else {
      throw { error: 'server-error', message: 'Server error. Please try again later.' };
    }
  }
};

/**
 * Gets all ambassadors
 * @returns List of ambassadors
 */
export const getAllAmbassadors = async (): Promise<Ambassador[]> => {
  try {
    const response = await apiClient.get('/ambassador');
    
    // Check for any ambassador records missing UIDs
    const ambassadorsWithMissingUIDs = response.data.filter((a: any) => !a.uid);
    if (ambassadorsWithMissingUIDs.length > 0) {
      console.error(`WARNING: Found ${ambassadorsWithMissingUIDs.length} ambassador(s) with missing UIDs:`, 
        ambassadorsWithMissingUIDs);
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ambassadors:', error);
    throw { error: 'fetch-error', message: 'Failed to fetch ambassadors' };
  }
};

/**
 * Gets an ambassador by ID
 * @param uid Ambassador ID
 * @returns Ambassador details
 */
export const getAmbassadorById = async (uid: string): Promise<Ambassador> => {
  try {
    const response = await apiClient.get(`/ambassador/${uid}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching ambassador ${uid}:`, error);
    
    if (error.response?.status === 404) {
      throw { error: 'not-found', message: 'Ambassador not found' };
    } else {
      throw { error: 'fetch-error', message: 'Failed to fetch ambassador' };
    }
  }
};

/**
 * Updates an ambassador's details
 * @param uid Ambassador ID
 * @param data Updated ambassador data
 * @returns Updated ambassador
 */
export const updateAmbassador = async (
  uid: string, 
  data: Partial<Ambassador>
): Promise<Ambassador> => {
  try {
    // Filter out undefined, null, and empty string values
    const updateData = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, any>);
      
    const response = await apiClient.put(`/ambassador/${uid}`, updateData);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating ambassador ${uid}:`, error);
    
    if (error.response?.status === 400) {
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message[0] 
        : error.response.data.message;
      throw { error: 'validation-error', message: errorMessage };
    } else if (error.response?.status === 404) {
      throw { error: 'not-found', message: 'Ambassador not found' };
    } else {
      throw { error: 'server-error', message: 'Server error. Please try again later.' };
    }
  }
};

/**
 * Deletes an ambassador - requires a valid Firebase UID
 * @param identifier Ambassador UID from Firebase
 */
export const deleteAmbassador = async (identifier: string): Promise<void> => {
  try {
    // Validate the identifier
    if (!identifier || identifier === 'undefined') {
      console.error('Invalid ambassador identifier provided for deletion:', identifier);
      throw { error: 'invalid-id', message: 'Invalid ambassador identifier provided' };
    }
    
    // Check if this looks like a Firebase UID (20+ characters, not an email)
    const isEmailIdentifier = identifier.includes('@');
    const looksLikeFirebaseUid = !isEmailIdentifier && identifier.length > 20;
    
    if (!looksLikeFirebaseUid) {
      // If not a Firebase UID, we need to reject the request
      if (isEmailIdentifier) {
        console.error('Cannot delete by email - Firebase UID is required:', identifier);
        throw { error: 'uid-required', message: 'Firebase UID is required for deletion, email is not supported' };
      } else {
        console.error('Invalid Firebase UID format:', identifier);
        throw { error: 'invalid-uid-format', message: 'Invalid Firebase UID format' };
      }
    }
    
    // Proceed with deletion using the Firebase UID
    console.log(`Deleting ambassador with Firebase UID: ${identifier}`);
    await apiClient.delete(`/ambassador/${identifier}`);
    console.log(`Successfully deleted ambassador with UID: ${identifier}`);
  } catch (error: any) {
    console.error(`Error deleting ambassador:`, error);
    
    if (error.response?.status === 404) {
      throw { error: 'not-found', message: 'Ambassador not found' };
    } else if (error.error) {
      throw error; // Rethrow our custom error
    } else {
      throw { error: 'server-error', message: 'Server error. Please try again later.' };
    }
  }
}; 