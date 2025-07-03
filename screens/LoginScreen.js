import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../utils/api';
import { saveSession } from '../utils/auth';
import { useBudgets } from '../storage/budgetsContext';
import { useAuth } from '../storage/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchBudgets } = useBudgets();
  const { saveSession } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true)
      const pushToken = await AsyncStorage.getItem('push_token');

      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
        pushToken
      });

      setLoading(false)

      const token = res.data.session.access_token;
      const refresh_token = res.data.session.refresh_token;
      const user = res.data.session.user;

      const displayName = res.data.user.user_metadata.display_name || email;

      saveSession(token, email, user, refresh_token, displayName);

      fetchBudgets();

      navigation.replace('Home');
    } catch (err) {
      setLoading(false)
      console.error(err);
      Alert.alert('Грешка при вход', err.response?.data?.error || 'Проблем със сървъра');
    }
  };

      if (loading) {
        return <ActivityIndicator style={{ marginTop: 40 }} />;
    }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Имейл</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Парола</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      

      <Button title="Вход" onPress={handleLogin} />
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Нямаш акаунт? Регистрирай се
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  link: {
    marginTop: 15,
    color: 'blue',
    textAlign: 'center',
  },
});
