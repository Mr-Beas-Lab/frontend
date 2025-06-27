import ExchangeRatePage from "../pages/ambassador/ExchangeRatePage";

// ... existing imports ...

export const ambassadorRoutes = [
  // ... existing routes ...
  {
    path: '/exchange-rate',
    element: <ExchangeRatePage />,
    meta: {
      title: 'Exchange Rate',
      icon: 'currency',
      roles: ['ambassador']
    }
  },
  // ... other routes ...
]; 