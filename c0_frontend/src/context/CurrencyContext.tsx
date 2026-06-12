import React, { createContext, useContext, useState } from 'react';

type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (value: number | string, base?: 'USD' | 'INR') => string;
  convertPrice: (value: number | string, base?: 'USD' | 'INR') => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('c0_currency') as Currency) || 'USD';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('c0_currency', c);
  };

  const convertPrice = (value: number | string, base: 'USD' | 'INR' = 'USD'): number => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    if (isNaN(num)) return 0;

    if (base === 'USD') {
      if (currency === 'USD') {
        return num;
      } else {
        return num * 83; // 1 USD = 83 INR
      }
    } else {
      // base is INR
      if (currency === 'INR') {
        return num;
      } else {
        return num / 83;
      }
    }
  };

  const formatPrice = (value: number | string, base: 'USD' | 'INR' = 'USD'): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
    if (isNaN(num)) return String(value);

    if (base === 'USD') {
      if (currency === 'USD') {
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else {
        const inINR = num * 83;
        return `₹${inINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    } else {
      // base is INR
      if (currency === 'INR') {
        return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      } else {
        const inUSD = num / 83;
        return `$${inUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
};



