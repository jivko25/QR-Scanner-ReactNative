import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import DefaultLayout from '../components/DefaultLayout';
import LottieView from 'lottie-react-native';
import { BASE_URL } from '../utils/api';
import { useNavigation } from '@react-navigation/native';

// Импортирай тук твоя registration Lottie файл
import registerAnimation from '../assets/register-animation.json';

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: 'Моля, попълнете всички полета (Имейл, Парола, Име).',
      });
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password,
        displayName,
      });

      setLoading(false);

      Toast.show({
        type: 'success',
        text1: 'Успех',
        text2: 'Успешна регистрация! Моля, потвърдете имейла си, преди да влезете в приложението.',
      });

      navigation.replace('Login');
    } catch (err) {
      setLoading(false);
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: `Грешка при регистрация, ${err.response?.data?.error || 'Проблем със сървъра'}`,
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
            source={registerAnimation}
            autoPlay
            loop
            style={styles.lottie}
          />
          <Text style={styles.title}>Регистрация</Text>

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

          <Text style={styles.label}>Показвано име (Display Name)</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            editable={!loading}
            placeholder="Напр. Иван Иванов"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Регистрация</Text>
            )}
          </TouchableOpacity>

          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Вече имаш акаунт? Влез
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
    paddingHorizontal: 24,
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
