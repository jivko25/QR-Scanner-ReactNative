import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Clipboard } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function BudgetInviteScreen({ route, navigation }) {
  const { inviteCode } = route.params;

  if (!inviteCode) {
    return (
      <View style={styles.centered}>
        <Text>Няма наличен код за покана.</Text>
      </View>
    );
  }

  const copyToClipboard = () => {
      Clipboard.setString(inviteCode);
      Alert.alert('Копирано!', 'Кодът за покана е копиран в клипборда.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Покани потребители към бюджета</Text>
      <Text style={styles.subtitle}>Сканирай QR кода или копирай кода за покана</Text>

      <View style={styles.qrContainer}>
        <QRCode value={inviteCode} size={250} />
      </View>

      <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
        <Text style={styles.copyButtonText}>Копирай кода</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 30, textAlign: 'center', color: '#666' },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
