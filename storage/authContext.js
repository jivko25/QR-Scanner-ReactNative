import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../utils/api';
import { useBudgets } from './budgetsContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { setBudgets } = useBudgets();
  const [session, setSession] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState()

  const saveSession = async (token, email, user, refresh_token, displayName) => {
    const newSession = { token, email, user, refresh_token };
    setDisplayName(displayName);
    setSession(newSession);
    await AsyncStorage.setItem('session', JSON.stringify(newSession));
  };

  const getSession = () => session;

  const clearSession = async () => {
    setSession(null);
    await AsyncStorage.removeItem('session');
  };

  const loadSessionFromStorage = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('session');
      if (!sessionStr) {
        setLoading(false);
        return;
      }

      const storedSession = JSON.parse(sessionStr);

      const res = await axios.post(
        `${BASE_URL}/auth/me`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedSession.refresh_token}`,
          },
        }
      );

      if (res.data) {
        // Обновяваме с новите токени и user
        const updatedSession = {
          token: res.data.access_token,
          refresh_token: res.data.refresh_token,
          email: res.data.user.email,
          user: res.data.user,
        };

        setSession(updatedSession);
        await AsyncStorage.setItem('session', JSON.stringify(updatedSession));

        const response = await axios.get(`${BASE_URL}/budget`, {
          headers: {
            Authorization: `Bearer ${res.data.access_token}`,
          },
        });

        const budgets = response.data.budgets;
        setBudgets(budgets);
      } else {
        await clearSession();
      }
    } catch (err) {
      console.warn('Грешка при автоматично влизане:', err.message);
      setError(err.message)
      await clearSession();
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSessionFromStorage();
  }, []);

  return (
    <AuthContext.Provider value={{ session, saveSession, getSession, clearSession, loading, loadSessionFromStorage, error, displayName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
