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
import QrCardDetailScreen from '../screens/QrCardDetailScreen';
import QrCardCreateScreen from '../screens/QrCardCreateScreen';
import QrCardsListScreen from '../screens/QrCardsListScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BudgetChartScreen from '../screens/BudgetChartScreen';
import ManualExpenseScreen from '../screens/ManualExpenseScreen';
import BrochuresListScreen from '../screens/BrouchuresList';
import ShoppingListsScreen from '../screens/ShoppingListsScreen';
import CreateShoppingListScreen from '../screens/CreateShoppingListScreen';
import ShoppingListDetailScreen from '../screens/ShoppingListDetailScreen';
import AddItemsFromImagesScreen from '../screens/AddItemsFromImagesScreen';

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
        <Stack.Screen
          name="QrCardsListScreen"
          component={QrCardsListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrCardCreateScreen"
          component={QrCardCreateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="QrCardDetailScreen"
          component={QrCardDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BudgetChartScreen"
          component={BudgetChartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ManualExpenseScreen"
          component={ManualExpenseScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BrochuresListScreen"
          component={BrochuresListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShoppingListsScreen"
          component={ShoppingListsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateShoppingListScreen"
          component={CreateShoppingListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ShoppingListDetailScreen"
          component={ShoppingListDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddItemsFromImagesScreen"
          component={AddItemsFromImagesScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
