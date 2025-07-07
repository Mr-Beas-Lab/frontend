import React, { useState, useEffect } from 'react';
import { 
  getPendingRecoveryTasks, 
  adjustUserBalance, 
  markRecoveryTaskCompleted, 
  markRecoveryTaskFailed,
  RecoveryTask,
  AdjustBalanceDto,
  MarkTaskDto
} from '../../api/recoveryService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loader2, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const RecoveryManagement: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<RecoveryTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustBalanceForm, setAdjustBalanceForm] = useState<AdjustBalanceDto>({
    telegramId: '',
    amount: 0,
    reason: '',
    resolvedBy: user?.email || ''
  });
  const [markTaskForm, setMarkTaskForm] = useState<MarkTaskDto>({
    resolvedBy: user?.email || '',
    notes: ''
  });
  const [selectedTask, setSelectedTask] = useState<RecoveryTask | null>(null);
  const [showAdjustBalanceModal, setShowAdjustBalanceModal] = useState(false);
  const [showMarkTaskModal, setShowMarkTaskModal] = useState(false);
  const [actionType, setActionType] = useState<'complete' | 'fail'>('complete');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const pendingTasks = await getPendingRecoveryTasks();
      setTasks(pendingTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load recovery tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adjustBalanceForm.telegramId || !adjustBalanceForm.amount || !adjustBalanceForm.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await adjustUserBalance(adjustBalanceForm);
      toast.success('Balance adjusted successfully');
      setShowAdjustBalanceModal(false);
      setAdjustBalanceForm({
        telegramId: '',
        amount: 0,
        reason: '',
        resolvedBy: user?.email || ''
      });
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast.error('Failed to adjust balance');
    }
  };

  const handleMarkTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask || !markTaskForm.resolvedBy) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (actionType === 'complete') {
        await markRecoveryTaskCompleted(selectedTask.id, markTaskForm);
        toast.success('Task marked as completed');
      } else {
        await markRecoveryTaskFailed(selectedTask.id, markTaskForm);
        toast.success('Task marked as failed');
      }
      
      setShowMarkTaskModal(false);
      setSelectedTask(null);
      setMarkTaskForm({
        resolvedBy: user?.email || '',
        notes: ''
      });
      loadTasks(); // Reload tasks to update status
    } catch (error) {
      console.error('Error marking task:', error);
      toast.error(`Failed to mark task as ${actionType}`);
    }
  };

  const openMarkTaskModal = (task: RecoveryTask, type: 'complete' | 'fail') => {
    setSelectedTask(task);
    setActionType(type);
    setShowMarkTaskModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Recovery Management</h2>

      <Card className="bg-black border-gray-800 text-white">
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl text-white">Recovery Tasks</CardTitle>
              <CardDescription className="text-gray-400">
                Manage payment failures and balance adjustments
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAdjustBalanceModal(true)}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Adjust Balance
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center p-6 border border-gray-800 rounded-md">
              <p className="text-white">No pending recovery tasks</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-4 text-white font-medium">User</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-white font-medium">Created</th>
                    <th className="text-right py-3 px-4 text-white font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-900">
                      <td className="py-3 px-4 text-white">
                        {task.telegramId}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {formatAmount(task.amount)}
                      </td>
                      <td className="py-3 px-4 text-white">
                        <div className="max-w-xs truncate" title={task.description}>
                          {task.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">
                        {formatDate(task.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openMarkTaskModal(task, 'complete')}
                            className="text-white hover:bg-gray-800"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openMarkTaskModal(task, 'fail')}
                            className="text-white hover:bg-gray-800"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjust Balance Dialog */}
      <Dialog open={showAdjustBalanceModal} onOpenChange={setShowAdjustBalanceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust User Balance</DialogTitle>
            <DialogDescription>
              Manually adjust a user's balance when payment processing fails.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustBalance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Telegram ID *
              </label>
              <Input
                type="text"
                value={adjustBalanceForm.telegramId}
                onChange={(e) => setAdjustBalanceForm(prev => ({ ...prev, telegramId: e.target.value }))}
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Amount *
              </label>
              <Input
                type="number"
                step="0.01"
                value={adjustBalanceForm.amount}
                onChange={(e) => setAdjustBalanceForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="bg-gray-900 border-gray-700 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Reason *
              </label>
              <textarea
                value={adjustBalanceForm.reason}
                onChange={(e) => setAdjustBalanceForm(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdjustBalanceModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Adjust Balance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mark Task Dialog */}
      <Dialog open={showMarkTaskModal} onOpenChange={setShowMarkTaskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Mark Task as {actionType === 'complete' ? 'Completed' : 'Failed'}
            </DialogTitle>
            <DialogDescription>
              Update the status of this recovery task.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="mb-4 p-3 bg-gray-900 border border-gray-700 rounded-md">
              <p className="text-sm text-white">
                <strong>User:</strong> {selectedTask.telegramId}
              </p>
              <p className="text-sm text-white">
                <strong>Amount:</strong> {formatAmount(selectedTask.amount)}
              </p>
              <p className="text-sm text-white">
                <strong>Description:</strong> {selectedTask.description}
              </p>
            </div>
          )}
          <form onSubmit={handleMarkTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Notes
              </label>
              <textarea
                value={markTaskForm.notes}
                onChange={(e) => setMarkTaskForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional notes about this action..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMarkTaskModal(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant={actionType === 'complete' ? 'default' : 'destructive'}
              >
                {actionType === 'complete' ? 'Mark Complete' : 'Mark Failed'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecoveryManagement; 