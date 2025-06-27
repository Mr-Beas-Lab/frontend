import apiClient from './apiClient';

export interface AdminData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  isActive: boolean;
  phone?: string;
  tgUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get all admin users
 */
export const getAdmins = async (): Promise<AdminData[]> => {
  try {
    const response = await apiClient.get('/admin');
    
    // Map backend response to our frontend model
    return response.data.map((admin: any) => ({
      id: admin.uid,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      isActive: admin.isActive !== false, // Default to active if not specified
      phone: admin.phone,
      tgUsername: admin.tgUsername,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

/**
 * Get a single admin by ID
 */
export const getAdmin = async (id: string): Promise<AdminData> => {
  try {
    const response = await apiClient.get(`/admin/${id}`);
    
    // Map backend response to our frontend model
    return {
      id: response.data.uid,
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      email: response.data.email,
      isActive: response.data.isActive !== false, // Default to active if not specified
      phone: response.data.phone,
      tgUsername: response.data.tgUsername,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt
    };
  } catch (error) {
    console.error(`Error fetching admin with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get a single admin by ID (alias for getAdmin)
 */
export const getAdminById = async (id: string): Promise<AdminData> => {
  return getAdmin(id);
};

/**
 * Create a new admin
 */
export const createAdmin = async (adminData: AdminData): Promise<AdminData> => {
  try {
    // Prepare data for backend API - exclude fields that might be undefined
    const rawPayload = {
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      password: adminData.password,
      phone: adminData.phone || '',
      tgUsername: adminData.tgUsername || '',
      isActive: adminData.isActive
    };
    
    // Filter out undefined, null values
    const payload = Object.entries(rawPayload)
      .filter(([_, value]) => value !== undefined && value !== null)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, any>);
    
    const response = await apiClient.post('/admin', payload);
    
    // Return created admin with ID
    return {
      ...adminData,
      id: response.data.uid
    };
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

/**
 * Update an existing admin
 */
export const updateAdmin = async (id: string, adminData: Partial<AdminData>): Promise<AdminData> => {
  try {
    // Prepare data for backend API - exclude id and fields we don't want to update
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rawUpdateData } = adminData;
    
    // Filter out undefined, null, and empty string values
    const updateData = Object.entries(rawUpdateData)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, any>);
    
    const response = await apiClient.put(`/admin/${id}`, updateData);
    
    // Map backend response to our frontend model
    return {
      id: response.data.uid || id,
      firstName: response.data.firstName || '',
      lastName: response.data.lastName || '',
      email: response.data.email || '',
      isActive: response.data.isActive !== false,
      phone: response.data.phone || '',
      tgUsername: response.data.tgUsername || '',
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt
    };
  } catch (error) {
    console.error(`Error updating admin with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an admin
 */
export const deleteAdmin = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/${id}`);
  } catch (error) {
    console.error(`Error deleting admin with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Change admin status (active/inactive)
 */
export const changeAdminStatus = async (id: string, isActive: boolean): Promise<AdminData> => {
  try {
    // Make sure isActive is a boolean value, not undefined
    const statusUpdate = { isActive: isActive === true };
    
    // Update the admin with the new isActive status
    return updateAdmin(id, statusUpdate);
  } catch (error) {
    console.error(`Error changing admin status with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Activate an admin
 */
export const activateAdmin = async (id: string): Promise<AdminData> => {
  return changeAdminStatus(id, true);
};

/**
 * Deactivate an admin
 */
export const deactivateAdmin = async (id: string): Promise<AdminData> => {
  return changeAdminStatus(id, false);
}; 