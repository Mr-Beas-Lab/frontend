import React from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

/**
 * A full-screen loading component used during page transitions and data fetching
 */
const LoadingScreen: React.FC = () => {
  return <LoadingSpinner fullScreen size={50} />;
};

export default LoadingScreen;
