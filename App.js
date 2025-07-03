import 'react-native-gesture-handler';
import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './storage/authContext';
import { BudgetProvider } from './storage/budgetsContext';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <BudgetProvider>
      <AuthProvider>
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </BudgetProvider>
  )
}