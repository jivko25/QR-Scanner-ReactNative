import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';

export default function QrCardDetailScreen({ route }) {
    const { id } = route.params;
    const [card, setCard] = useState(null);

    useEffect(() => {
        api.get(`/qr-card/${id}`)
            .then(res => setCard(res.data))
            .catch(console.error);
    }, []);

    if (!card) return <ActivityIndicator />;

    return (
        <DefaultLayout>
        <View style={styles.container}>
            <Text style={styles.title}>{card.name}</Text>
            <QRCode value={card.qr_content} size={220} />
        </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, alignItems: 'center', justifyContent: 'center', flex: 1 },
    title: { fontSize: 22, marginBottom: 20 }
});
