import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { Platform, Linking } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './storage/authContext';
import { BudgetProvider } from './storage/budgetsContext';
import { OfflineProvider } from './storage/offlineContext';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Notification handler config
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'duckquack.mp3',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permission not granted!');
      return;
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      console.warn('Missing projectId');
      return;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
      await AsyncStorage.setItem('push_token', token);
    } catch (e) {
      console.warn('Error getting push token:', e);
    }
  } else {
    console.warn('Use physical device for push notifications.');
  }
}

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Когато пристигне нотификация докато приложението е отворено
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received:', notification);
    });

    // Когато потребителят натисне нотификация
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response:', response);
      const data = response?.notification?.request?.content?.data;

      if (data?.action === 'open_url' && data?.url) {
        Linking.openURL(data.url).catch(err => {
          console.error('❌ Неуспешно отваряне на линк:', err);
        });
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <BudgetProvider>
      <AuthProvider>
        <OfflineProvider>
          <AppNavigator />
          <Toast />
        </OfflineProvider>
      </AuthProvider>
    </BudgetProvider>
  );
}
