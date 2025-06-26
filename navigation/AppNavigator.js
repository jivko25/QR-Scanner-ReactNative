/* navigation/AppNavigator.js */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ScannerScreen from '../screens/ScannerScreen';
import { ChartScreen } from '../screens/ChartScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import BudgetDetailsScreen from '../screens/BudgetDetails';
import BudgetActionsScreen from '../screens/BudgetActions';
import BudgetCreateScreen from '../screens/BudgetCreateScreen';
import BudgetJoinScreen from '../screens/BudgetJoinScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Начало' }}
        />
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{ title: 'Сканирай бележка' }}
        />
        <Stack.Screen
          name="Charts"
          component={ChartScreen}
          options={{ title: 'Графики' }}
        />
        <Stack.Screen
          name="Budgets"
          component={BudgetsScreen}
          options={{ title: 'Моите сметки' }}
        />
        <Stack.Screen
          name="BudgetDetails"
          component={BudgetDetailsScreen}
          options={{ title: 'Детайли' }}
        />
        <Stack.Screen
          name="BudgetActions"
          component={BudgetActionsScreen}
          options={{ title: 'Нова сметка' }}
        />
        <Stack.Screen
          name="BudgetCreateScreen"
          component={BudgetCreateScreen}
          options={{ title: 'Създаване на сметка' }}
        />
        <Stack.Screen
          name="BudgetJoinScreen"
          component={BudgetJoinScreen}
          options={{ title: 'Присъединяване към сметка' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Регистрация' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Логване' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
