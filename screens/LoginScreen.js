import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import DefaultLayout from '../components/DefaultLayout';
import LottieView from 'lottie-react-native';

// Импортирай тук твоя лоти файл за логин, примерно:
import loginAnimation from '../assets/login-animation.json';
import { BASE_URL } from '../utils/api';
import { useAuth } from '../storage/authContext';
import { useBudgets } from '../storage/budgetsContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchBudgets } = useBudgets();
  const { saveSession } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const pushToken = await AsyncStorage.getItem('push_token');

      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
        pushToken,
      });

      setLoading(false);

      const token = res.data.session.access_token;
      const refresh_token = res.data.session.refresh_token;
      const user = res.data.session.user;

      const displayName = res.data.user.user_metadata.display_name || email;

      saveSession(token, email, user, refresh_token, displayName);

      fetchBudgets();

      navigation.replace('Home');
    } catch (err) {
      setLoading(false);
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: `Грешка при вход', ${err.response?.data?.error || 'Проблем със сървъра'}`,
      });
    }
  };

  return (
    <DefaultLayout showNavigation={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <LottieView
            source={loginAnimation}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.title}>Вход</Text>

          <Text style={styles.label}>Имейл</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>Парола</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Вход</Text>
            )}
          </TouchableOpacity>

          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Register')}
          >
            Нямаш акаунт? Регистрирай се
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24
  },
  lottie: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#6c63ff',
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#6c63ff',
    paddingVertical: 14,
    borderRadius: 35,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a3a0f9',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  link: {
    marginTop: 18,
    color: '#6c63ff',
    textAlign: 'center',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
