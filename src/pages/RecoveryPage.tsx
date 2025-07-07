import React from 'react';
import RecoveryManagement from '../components/superAdmin/RecoveryManagement';
import PageWrapper from '../components/PageWrapper';

const RecoveryPage: React.FC = () => {
  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recovery Management</h1>
          <p className="mt-2 text-gray-600">
            Manage recovery tasks and manually adjust user balances when payment processing fails.
          </p>
        </div>
        
        <RecoveryManagement />
      </div>
    </PageWrapper>
  );
};

export default RecoveryPage; 