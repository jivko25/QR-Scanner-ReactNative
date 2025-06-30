import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker'; // Ще трябва да инсталирате този пакет
import api from '../utils/api'; // Предполагам, че api.js вече е настроен правилно за вашите заявки
import { useBudgets } from '../storage/budgetsContext';
import { useAuth } from '../storage/authContext';

// Константни стойности - може да ги направите динамични ако е необходимо
const SCANNED_BY = '71271b35-dcce-4122-bf0e-1055cbeaf551'; // Примерно ID на потребител

export default function ScannerScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // За управление на видимостта на модала
  const { budgets } = useBudgets();
  const { getSession } = useAuth();

  const [selectedBudget, setSelectedBudget] = useState(null); // За избрания бюджет
  const [isSendingScan, setIsSendingScan] = useState(false); // За избягване на дублирани изпращания


  if (!permission) {
    return <View style={styles.centered} />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Нуждаем се от разрешение за камерата</Text>
        <Button title="Дай достъп" onPress={requestPermission} />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current =>
      current === 'back'
        ? 'front'
        : 'back'
    );
  };

  const handleBarcodeScanned = async result => {
    const data = result.data;
    setScannedData(data);
    setShowCamera(false);
    setModalVisible(true); // Показваме модалния прозорец след сканиране
  };

  const sendScannedData = async () => {
    if (!selectedBudget) {
      Alert.alert('Избор на бюджет', 'Моля, изберете бюджет, преди да продължите.');
      return;
    }

    if (isSendingScan) return; // Предотвратява многократно изпращане

    setIsSendingScan(true);
    try {
      const { user } = getSession()
      const payload = {
        raw_code: scannedData,
        budget_id: selectedBudget, // Използваме избрания бюджет
        scanned_by: user.id,
      };
      const res = await api.post('/scan', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Сървър отговори:', res.data);
      Alert.alert('Успех', 'Касовата бележка е записана успешно!');
      setModalVisible(false); // Скриваме модала след успех
      navigation.navigate('Home');
    } catch (err) {
      console.error('Грешка при заявката:', err);
      // По-информативно съобщение за грешка
      const errorMessage = err.response?.data?.message || 'Неизвестна грешка при записване на бележката.';
      Alert.alert('Грешка', errorMessage);
    } finally {
      setIsSendingScan(false);
    }
  };

  const restartScan = () => {
    setScannedData(null);
    setSelectedBudget(budgets.length > 0 ? budgets[0].id : null); // Връщаме избрания бюджет към първия
    setShowCamera(true);
    setModalVisible(false); // Уверяваме се, че модалът е скрит
  };

  return (
    <View style={styles.container}>
      {showCamera ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        >
          <View style={styles.flipButtonContainer}>
            <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
              <Text style={styles.flipText}>Смени камера</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Сканирано: {scannedData}</Text>
          <Button title="Сканирай отново" onPress={restartScan} />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Модалът е затворен.');
          setModalVisible(!modalVisible);
          restartScan(); // Затварянето на модала рестартира сканирането
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Избери бюджет за сканираната бележка</Text>
            <Text style={styles.modalScannedData}>Сканиран код: {scannedData}</Text>

            {
              budgets.length > 0 ? (
                <Picker
                  selectedValue={selectedBudget}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedBudget(itemValue)}
                >
                  {budgets.map((budget) => (
                    <Picker.Item key={budget.id} label={budget.name} value={budget.id} />
                  ))}
                </Picker>
              ) : (
                <Text style={styles.noBudgetsText}>Няма налични бюджети. Моля, създайте такъв.</Text>
              )
            }

            <View style={styles.modalButtons}>
              <Button
                title={isSendingScan ? "Изпращане..." : "Запази бележката"}
                onPress={sendScannedData}
                disabled={isSendingScan || !selectedBudget}
              />
              <Button title="Отказ" onPress={() => { setModalVisible(false); restartScan(); }} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.navButton}>
        <Button title="Към графиките" onPress={() => navigation.navigate('Charts')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { marginBottom: 10, fontSize: 16 },
  camera: { flex: 1 },
  flipButtonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  flipButton: {
    backgroundColor: '#00000080',
    padding: 10,
    borderRadius: 10,
  },
  flipText: { color: 'white', fontSize: 18 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  resultText: { fontSize: 18, marginBottom: 20 },
  navButton: { position: 'absolute', bottom: 20, alignSelf: 'center' },

  // Стилове за модала
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', // Полупрозрачен фон
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Контролира ширината на модала
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScannedData: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  noBudgetsText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
    textAlign: 'center',
  },
});