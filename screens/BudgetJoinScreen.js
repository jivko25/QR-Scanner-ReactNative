import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../utils/api';
import { useBudgets } from '../storage/budgetsContext';

export default function BudgetJoinScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(true);
  const [scannedCode, setScannedCode] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const { fetchBudgets } = useBudgets();

  // Ако няма разрешение за камера, поискай го
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  if (!permission) {
    return <View style={styles.centered}><Text>Изчакване за разрешение...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Нуждаем се от достъп до камерата, за да сканираш QR код.</Text>
        <Button title="Дай достъп" onPress={requestPermission} />
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }) => {
    setScannedCode(data);
    setShowCamera(false);
  };

  const handleJoin = async () => {
    if (!scannedCode) {
      return Alert.alert('Грешка', 'Моля, първо сканирайте QR кода.');
    }
    if (!displayName.trim()) {
      return Alert.alert('Грешка', 'Моля въведете име за сметката.');
    }

    setIsJoining(true);

    try {
      const res = await api.post('/budget/join', {
        invite_code: scannedCode,
        display_name: displayName.trim(),
      });

      Alert.alert('Успех', `Присъедини се към: ${res.data.budget.name}`);
      fetchBudgets();
      navigation.goBack();
    } catch (err) {
      const msg = err.response?.data?.error || 'Проблем при присъединяване';
      Alert.alert('Грешка', msg);
    } finally {
      setIsJoining(false);
    }
  };

  const restartScan = () => {
    setScannedCode(null);
    setDisplayName('');
    setShowCamera(true);
  };

  return (
    <View style={styles.container}>
      {showCamera ? (
        <CameraView
          style={styles.camera}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        >
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Насочи камерата към QR кода</Text>
          </View>
        </CameraView>
      ) : (
        <View style={styles.joinContainer}>
          <Text style={styles.label}>QR код за покана:</Text>
          <Text selectable style={styles.scannedCode}>{scannedCode}</Text>

          <Text style={styles.label}>Вашето име в сметката:</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Въведи име"
          />

          <Button title={isJoining ? "Присъединяване..." : "Присъедини се"} onPress={handleJoin} disabled={isJoining} />

          <TouchableOpacity style={styles.rescanButton} onPress={restartScan}>
            <Text style={styles.rescanText}>Сканирай отново</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  camera: { flex: 1, justifyContent: 'flex-end' },
  instructionContainer: {
    backgroundColor: '#00000080',
    padding: 10,
    alignItems: 'center',
  },
  instructionText: { color: '#fff', fontSize: 18 },
  joinContainer: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  scannedCode: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  rescanButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  rescanText: {
    color: '#6c63ff',
    textDecorationLine: 'underline',
  },
  centered: {
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  }
});
