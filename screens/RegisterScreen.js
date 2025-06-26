import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../utils/api';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState(''); // <--- Ново състояние за display name
    
    const handleRegister = async () => {
        // Проста валидация
        if (!email || !password || !displayName) {
            Alert.alert('Грешка', 'Моля, попълнете всички полета (Имейл, Парола, Показвано име).');
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/auth/register`, {
                email,
                password,
                displayName, // <--- Изпращаме displayName към бекенда
            });
    
            Alert.alert(
                'Проверка на имейл',
                'Успешна регистрация! Моля, потвърди имейла си, преди да влезеш в приложението.'
            );
    
            navigation.replace('Login');
        } catch (err) {
            console.error(err);
            Alert.alert('Грешка при регистрация', err.response?.data?.error || 'Проблем със сървъра');
        }
    };

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

            <Text style={styles.label}>Показвано име (Display Name)</Text> {/* <--- Ново поле */}
            <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words" // Капитализира първата буква на всяка дума
                placeholder="Напр. Иван Иванов"
            />

            <Button title="Регистрация" onPress={handleRegister} />
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                Вече имаш акаунт? Влез
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