import React from 'react';
import { ExchangeRateForm } from '../../components/ExchangeRateForm';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/PageWrapper';

const ExchangeRatePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <PageWrapper>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Exchange Rates</h1>
        {currentUser?.country && (
          <ExchangeRateForm country={currentUser.country} />
        )}
      </div>
    </PageWrapper>
  );
};

export default ExchangeRatePage; 