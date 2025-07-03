/* navigation/AppNavigator.js */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import ScannerScreen from '../screens/ScannerScreen';
// import { ChartScreen } from '../screens/ChartScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import BudgetDetailsScreen from '../screens/BudgetDetails';
import BudgetActionsScreen from '../screens/BudgetActions';
import BudgetCreateScreen from '../screens/BudgetCreateScreen';
import BudgetJoinScreen from '../screens/BudgetJoinScreen';
import { ChartScreen } from '../screens/ChartScreen';
import BudgetEditScreen from '../screens/BudgetEditScreen';
import BudgetInviteScreen from '../screens/BudgetInviteScreen';

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
            headerShown: false
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Charts"
            component={ChartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Budgets"
            component={BudgetsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BudgetDetails"
            component={BudgetDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BudgetActions"
            component={BudgetActionsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BudgetCreateScreen"
            component={BudgetCreateScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BudgetEdit"
            component={BudgetEditScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BudgetInviteScreen"
            component={BudgetInviteScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="BudgetJoinScreen"
            component={BudgetJoinScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
    </NavigationContainer>
  );
}
