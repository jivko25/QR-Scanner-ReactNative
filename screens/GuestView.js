import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import DefaultLayout from '../components/DefaultLayout';

const { width } = Dimensions.get('window');

export default function GuestView({ navigation }) {
    return (
        <DefaultLayout showNavigation={false}>
            <View style={styles.container}>
                <LottieView
                    source={require('../assets/no-logged-animation.json')}
                    loop
                    style={styles.lottie}
                />

                <Text style={styles.title}>Добре дошли!</Text>
                <Text style={styles.subtitle}>
                    Влез или се регистрирай, за да управляваш сметките си лесно и удобно.
                </Text>

                <TouchableOpacity
                    style={[styles.button, styles.registerButton]}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Ionicons name="person-add" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Регистрация</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.loginButton]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Ionicons name="log-in" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.buttonText}>Логване</Text>
                </TouchableOpacity>

                <Text style={styles.note}>Ние пазим твоите данни сигурно и защитено.</Text>
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4ff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    lottie: {
        width: width * 0.7,
        height: width * 0.7,
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4a4aff',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 35,
        marginBottom: 16,
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6c63ff',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    registerButton: {
        backgroundColor: '#6c63ff',
    },
    loginButton: {
        backgroundColor: '#ffb400',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },
    note: {
        fontSize: 12,
        color: '#999',
        marginTop: 20,
        fontStyle: 'italic',
    },
});
