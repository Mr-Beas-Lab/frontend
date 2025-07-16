import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { toast } from './ui/use-toast';
import { Button } from './ui/button';
import { Plus, Info } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";

interface ExchangeRate {
  id: string;
  currencyCode: string;
  rate: number;
  countryName: string;
  updatedAt: string;
}

interface ExchangeRateFormProps {
  country: string;
}

export const ExchangeRateForm: React.FC<ExchangeRateFormProps> = ({ country }) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [formData, setFormData] = useState({
    rate: '',
  });

  const SPREAD = 14; // Fixed spread value

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const response = await apiClient.get('/exchange-rates');
      setExchangeRates(response.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Error fetching exchange rates: ' + error.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const rate = parseFloat(formData.rate);
      if (isNaN(rate) || rate <= 0) {
        throw new Error('Please enter a valid exchange rate greater than 0');
      }

      await apiClient.post('/exchange-rates', {
        rate,
      });

      toast({
        title: "Success",
        description: "Exchange rate updated successfully"
      });
      
      setShowForm(false);
      fetchExchangeRates();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || error.message || 'Failed to update exchange rate'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      rate: value,
    }));
  };

  const calculateFinalRate = (baseRate: number) => {
    return baseRate + SPREAD;
  };

  if (!country) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Country Information Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Please update your profile with your country information before setting exchange rates.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Exchange Rates</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Create New Exchange Rate'}
        </Button>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-light" />
        <AlertDescription className="text-blue-light">
          A spread of {SPREAD} will be added to your entered rate. For example, if you enter 100, the final rate will be 114.
        </AlertDescription>
      </Alert>

      {showForm && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Set Exchange Rate for {country}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Base Exchange Rate (Local Currency per USDC)
              </label>
              <input
                type="number"
                name="rate"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={handleChange}
                placeholder="e.g., 55.5"
                className="w-full px-3 py-2 border rounded-md"
              />
              {formData.rate && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Base Rate: {parseFloat(formData.rate).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Spread: +{SPREAD}
                  </p>
                  <p className="text-sm font-medium">
                    Final Rate: {calculateFinalRate(parseFloat(formData.rate)).toFixed(2)}
                  </p>
                </div>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                Enter how many units of your local currency equal 1 USDC (before spread)
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Set Exchange Rate'}
            </Button>
          </form>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Country</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Rate (per USDC)</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exchangeRates.map((rate) => (
            <TableRow key={rate.id}>
              <TableCell>{rate.countryName}</TableCell>
              <TableCell>{rate.currencyCode}</TableCell>
              <TableCell>{rate.rate.toFixed(2)}</TableCell>
              <TableCell>{new Date(rate.updatedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {exchangeRates.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No exchange rates found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}; 