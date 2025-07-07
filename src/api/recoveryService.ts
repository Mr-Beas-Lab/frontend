import apiClient from './apiClient';

export interface RecoveryTask {
  id: string;
  type: 'balance_recovery';
  telegramId: string;
  amount: number;
  quoteId: string;
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  description: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

export interface AdjustBalanceDto {
  telegramId: string;
  amount: number;
  reason: string;
  resolvedBy: string;
}

export interface MarkTaskDto {
  resolvedBy: string;
  notes?: string;
}

/**
 * Get all pending recovery tasks
 */
export const getPendingRecoveryTasks = async (): Promise<RecoveryTask[]> => {
  try {
    const response = await apiClient.get('/recovery/tasks/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending recovery tasks:', error);
    throw error;
  }
};

/**
 * Get recovery task by ID
 */
export const getRecoveryTask = async (taskId: string): Promise<RecoveryTask | null> => {
  try {
    const response = await apiClient.get(`/recovery/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching recovery task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Manually adjust user balance
 */
export const adjustUserBalance = async (adjustBalanceDto: AdjustBalanceDto): Promise<void> => {
  try {
    await apiClient.post('/recovery/adjust-balance', adjustBalanceDto);
  } catch (error) {
    console.error('Error adjusting user balance:', error);
    throw error;
  }
};

/**
 * Mark recovery task as completed
 */
export const markRecoveryTaskCompleted = async (
  taskId: string, 
  markTaskDto: MarkTaskDto
): Promise<void> => {
  try {
    await apiClient.post(`/recovery/tasks/${taskId}/complete`, markTaskDto);
  } catch (error) {
    console.error(`Error marking recovery task ${taskId} as completed:`, error);
    throw error;
  }
};

/**
 * Mark recovery task as failed
 */
export const markRecoveryTaskFailed = async (
  taskId: string, 
  markTaskDto: MarkTaskDto
): Promise<void> => {
  try {
    await apiClient.post(`/recovery/tasks/${taskId}/fail`, markTaskDto);
  } catch (error) {
    console.error(`Error marking recovery task ${taskId} as failed:`, error);
    throw error;
  }
}; 