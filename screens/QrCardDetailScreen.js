import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform } from 'react-native';

export default function QrCardDetailScreen({ route, navigation }) {
    const { id } = route.params;
    const [card, setCard] = useState(null);
    const qrRef = useRef(null);

    useEffect(() => {
        api.get(`/qr-card/${id}`)
            .then(res => setCard(res.data))
            .catch(console.error);
    }, []);

    const handleDelete = async () => {
        Alert.alert(
            'Сигурен ли си?',
            'Тази карта ще бъде изтрита.',
            [
                { text: 'Отказ', style: 'cancel' },
                {
                    text: 'Изтрий',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/qr-card/${id}`);
                            navigation.goBack();
                        } catch (err) {
                            console.error(err);
                        }
                    },
                },
            ]
        );
    };

    if (!card) return <ActivityIndicator style={{ marginTop: 40 }} />;

    return (
        <DefaultLayout>
            <LinearGradient
                colors={['#e6f2e6', '#f0fbf0']}
                style={styles.gradientBackground}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>{card.name}</Text>
                    <View style={styles.qrWrapper}>
                        <QRCode
                            value={card.qr_content}
                            size={240}
                            getRef={qrRef}
                        />
                    </View>

                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Ionicons name="trash-outline" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Изтрий</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </DefaultLayout>
    );

}

const styles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
        padding: 16,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 26,
        marginBottom: 30,
        fontWeight: '700',
        color: '#222',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    qrWrapper: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        padding: 24,
        borderRadius: 20,
        // За blur ефект на iOS (ако искаш)
        ...Platform.select({
            ios: {
                backdropFilter: 'blur(10px)', // React Native няма native blur, но можеш да ползваш библиотека ако искаш
            },
            android: {
                // няма нативна подкрепа за blur, може да се сложи само прозрачност
            },
        }),
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 8,
        marginBottom: 40,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
