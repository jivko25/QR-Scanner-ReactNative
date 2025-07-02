import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budget');

      setBudgets(res.data.budgets);
    } catch (e) {
        setError(e.message)
      console.error('Грешка при fetchBudgets:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BudgetContext.Provider value={{ budgets, fetchBudgets, loading, error, setBudgets }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => useContext(BudgetContext);
