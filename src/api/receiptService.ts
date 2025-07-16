import apiClient from './apiClient';
import { Receipt } from '../types';

// Request interfaces
interface CreateReceiptRequest {
  amount: number;
  currency: string;
  ambassadorId: string;
  senderTgId: string;
  documents: string[];
}

interface ApproveReceiptRequest {
  receiptId: string;
  senderId: string;
  amount: number;
}

interface RejectReceiptRequest {
  receiptId: string;
  reason?: string;
}

interface AdminApproveRequest {
  receiptId: string;
}

// Response interfaces
interface CreateReceiptResponse {
  success: boolean;
  data: {
    id: string;
    message: string;
  };
}

interface ReceiptActionResponse {
  success: boolean;
  data: {
    id: string;
    status: string;
    updatedAt: string;
  };
  message: string;
}

/**
 * NOTE: Receipt endpoints will be implemented later
 * This file serves as a placeholder following the API structure
 */

/**
 * Gets all receipts (admin access)
 * @returns List of all receipts
 */
export const getAllReceipts = async (): Promise<Receipt[]> => {
  try {
    const response = await apiClient.get('/receipts');
    return response.data || [];
  } catch (error: any) {
    console.warn('Receipt API not implemented yet');
    return [];
  }
};

/**
 * Gets all receipts assigned to an ambassador
 * @param ambassadorId The ambassador's ID
 * @returns List of receipts
 */
export const getReceiptsByAmbassador = async (ambassadorId: string): Promise<Receipt[]> => {
  try {
    const response = await apiClient.get(`/receipts/ambassador/${ambassadorId}`);
    if (!response.data) {
      throw new Error('No data received from server');
    }
    return response.data.map((receipt: any) => ({
      ...receipt,
      createdAt: new Date(receipt.createdAt),
      currency: 'USD' // Default currency for now
    }));
  } catch (error: any) {
    console.error('Error fetching receipts:', error);
    if (error.response?.status === 404) {
      throw new Error('Receipts not found for this ambassador');
    }
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access');
    }
    throw new Error('Failed to fetch receipts. Please try again later.');
  }
};

/**
 * Gets a receipt by ID
 * @param receiptId Receipt ID
 * @returns Receipt details
 */
export const getReceiptById = async (receiptId: string): Promise<Receipt | null> => {
  // Temporary implementation until real API is ready
  try {
    const response = await apiClient.get(`/receipts/${receiptId}`);
    return response.data;
  } catch (error: any) {
    console.warn('Receipt API not implemented yet');
    return null;
  }
};

/**
 * Creates a new receipt
 * @param data Receipt data
 * @returns Response with receipt ID
 */
export const createReceipt = async (data: CreateReceiptRequest): Promise<CreateReceiptResponse> => {
  // Temporary implementation until real API is ready
  try {
    const response = await apiClient.post('/receipts', data);
    return response.data;
  } catch (error: any) {
    console.warn('Receipt API not implemented yet');
    // Return mock response
    return {
      success: false,
      data: {
        id: '',
        message: 'Receipt API not implemented yet'
      }
    };
  }
};

/**
 * Approves a receipt
 * @param data Approval data
 * @returns Response with status
 */
export const approveReceipt = async (data: ApproveReceiptRequest): Promise<ReceiptActionResponse> => {
  try {
    const response = await apiClient.post(`/receipts/ambassador-approve/${data.receiptId}`, {
      receiptId: data.receiptId,
      senderId: data.senderId,
      amount: data.amount
    });
    return response.data;
  } catch (error: any) {
    console.error('Error approving receipt:', error);
    if (error.response?.status === 404) {
      throw new Error('Receipt not found');
    }
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access');
    }
    if (error.response?.status === 403) {
      throw new Error('You can only approve receipts that belong to you');
    }
    throw new Error('Failed to approve receipt. Please try again later.');
  }
};

/**
 * Rejects a receipt
 * @param data Rejection data
 * @returns Response with status
 */
export const rejectReceipt = async (data: RejectReceiptRequest): Promise<ReceiptActionResponse> => {
  try {
    const response = await apiClient.post('/receipts/reject', data);
    return response.data;
  } catch (error: any) {
    console.error('Error rejecting receipt:', error);
    if (error.response?.status === 404) {
      throw new Error('Receipt not found');
    }
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access');
    }
    if (error.response?.status === 403) {
      throw new Error('You can only reject receipts that belong to you');
    }
    throw new Error('Failed to reject receipt. Please try again later.');
  }
};

export const adminApproveReceipt = async (data: AdminApproveRequest): Promise<ReceiptActionResponse> => {
  const response = await apiClient.post(`/receipts/admin-approve/${data.receiptId}`);
  return response.data;
};

export const adminRejectReceipt = async (receiptId: string, reason?: string): Promise<ReceiptActionResponse> => {
  const response = await apiClient.post(`/receipts/admin-reject/${receiptId}`, { reason });
  return response.data;
};

export const getExchangeRateByCountry = async (country: string): Promise<number | null> => {
  try {
    const response = await apiClient.get(`/exchange-rates?country=${encodeURIComponent(country)}`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].rate;
    }
    return null;
  } catch (error) {
    return null;
  }
}; 