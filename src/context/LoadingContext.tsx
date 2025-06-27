import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  setLoading: (isLoading: boolean, text?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    isLoading: false,
    loadingText: 'Loading...'
  });

  const setLoading = useCallback((isLoading: boolean, text: string = 'Loading...') => {
    setState(prev => {
      // Only update if the values have actually changed
      if (prev.isLoading === isLoading && prev.loadingText === text) {
        return prev;
      }
      return { isLoading, loadingText: text };
    });
  }, []);

  const value = useMemo(() => ({
    isLoading: state.isLoading,
    loadingText: state.loadingText,
    setLoading
  }), [state.isLoading, state.loadingText, setLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 