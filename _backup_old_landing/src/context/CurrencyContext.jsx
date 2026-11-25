import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹',
  AED: 'AED ', SGD: 'S$', JPY: '¥',
};

const CurrencyContext = createContext({ currency: 'USD', symbol: '$', fmt: (n) => '$' + Number(n).toLocaleString(), companyLogo: null, companyName: null, companyAddress: null, companyWebsite: null, companyEmail: null, companyPhone: null, companyTaxId: null });

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [companyAddress, setCompanyAddress] = useState(null);
  const [companyWebsite, setCompanyWebsite] = useState(null);
  const [companyEmail, setCompanyEmail] = useState(null);
  const [companyPhone, setCompanyPhone] = useState(null);
  const [companyTaxId, setCompanyTaxId] = useState(null);

  const fetchCurrency = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    api.get('/api/setup/company')
      .then(r => {
        const data = r.data;
        if (data?.currency) setCurrency(data.currency);
        if (data?.company_logo) setCompanyLogo(data.company_logo);
        if (data?.company_name) setCompanyName(data.company_name);
        if (data?.address) setCompanyAddress(data.address);
        if (data?.website) setCompanyWebsite(data.website);
        if (data?.email) setCompanyEmail(data.email);
        if (data?.phone) setCompanyPhone(data.phone);
        if (data?.tax_id) setCompanyTaxId(data.tax_id);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCurrency();

    // Listen for currency changes from CompanySettings
    window.addEventListener('currencyChanged', fetchCurrency);
    return () => window.removeEventListener('currencyChanged', fetchCurrency);
  }, []);

  const symbol = SYMBOLS[currency] || currency + ' ';
  const fmt = (n) => symbol + Number(n || 0).toLocaleString();

  return (
    <CurrencyContext.Provider value={{ currency, symbol, fmt, companyLogo, companyName, companyAddress, companyWebsite, companyEmail, companyPhone, companyTaxId }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);