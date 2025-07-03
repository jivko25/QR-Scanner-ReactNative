import 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './storage/authContext';
import { BudgetProvider } from './storage/budgetsContext';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import React, { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    // Изискваме разрешения чрез expo-notifications
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Не може да се получи разрешение за нотификации!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem('push_token', token);
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Получена нотификация:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Потребителят отвори нотификация:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <BudgetProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </BudgetProvider>
  );
}
