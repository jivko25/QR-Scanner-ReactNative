import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../utils/api';
import { useBudgets } from './budgetsContext';

const AuthContext = createContext();

function isNetworkError(err) {
  if (!err) return false;
  // Няма HTTP отговор = мрежа / timeout / DNS
  if (!err.response) return true;
  return false;
}

function isAuthFailure(err) {
  const status = err?.response?.status;
  return status === 401 || status === 403;
}

export const AuthProvider = ({ children }) => {
  const { setBudgets } = useBudgets();
  const [session, setSession] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const saveSession = async (token, email, user, refresh_token, nextDisplayName) => {
    const name =
      nextDisplayName ||
      user?.user_metadata?.display_name ||
      email ||
      null;
    const newSession = { token, email, user, refresh_token, displayName: name };
    setDisplayName(name);
    setSession(newSession);
    await AsyncStorage.setItem('session', JSON.stringify(newSession));
  };

  const getSession = () => session;

  const clearSession = async () => {
    setSession(null);
    setDisplayName(null);
    await AsyncStorage.removeItem('session');
  };

  const applyStoredSession = (storedSession) => {
    setSession(storedSession);
    setDisplayName(
      storedSession.displayName ||
        storedSession.user?.user_metadata?.display_name ||
        storedSession.email ||
        null
    );
  };

  const loadSessionFromStorage = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('session');
      if (!sessionStr) {
        setLoading(false);
        return;
      }

      const storedSession = JSON.parse(sessionStr);

      // Optimistic restore — оставаме логнати дори без мрежа
      applyStoredSession(storedSession);

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/me`,
          {},
          {
            headers: {
              Authorization: `Bearer ${storedSession.refresh_token}`,
            },
            timeout: 12000,
          }
        );

        if (res.data) {
          const name =
            res.data.user?.user_metadata?.display_name ||
            storedSession.displayName ||
            res.data.user?.email ||
            storedSession.email;

          const updatedSession = {
            token: res.data.access_token,
            refresh_token: res.data.refresh_token,
            email: res.data.user.email,
            user: res.data.user,
            displayName: name,
          };

          setSession(updatedSession);
          setDisplayName(name);
          await AsyncStorage.setItem('session', JSON.stringify(updatedSession));

          try {
            const response = await axios.get(`${BASE_URL}/budget`, {
              headers: {
                Authorization: `Bearer ${res.data.access_token}`,
              },
              timeout: 12000,
            });
            setBudgets(response.data.budgets || []);
          } catch (budgetErr) {
            // Бюджетите не са критични за логин
            console.warn('Неуспешно зареждане на бюджети:', budgetErr.message);
          }
        } else if (!isNetworkError({ response: null })) {
          await clearSession();
        }
      } catch (err) {
        if (isAuthFailure(err)) {
          console.warn('Сесията е невалидна — изход.');
          setError(err.message);
          await clearSession();
        } else if (isNetworkError(err)) {
          // Офлайн / сървър недостъпен — пазим локалната сесия
          console.warn('Офлайн режим: запазваме локалната сесия.', err.message);
          setError(null);
        } else {
          // Друга сървърна грешка — пазим сесията, за да не логаут-ваме без причина
          console.warn('Грешка при refresh на сесия, пазим локалната:', err.message);
          setError(err.message);
        }
      }
    } catch (err) {
      console.warn('Грешка при четене на сесия:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionFromStorage();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        saveSession,
        getSession,
        clearSession,
        loading,
        loadSessionFromStorage,
        error,
        displayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
