import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Picker } from '@react-native-picker/picker'; // Ще трябва да инсталирате този пакет
import api from '../utils/api'; // Предполагам, че api.js вече е настроен правилно за вашите заявки
import { useBudgets } from '../storage/budgetsContext';
import { useAuth } from '../storage/authContext';
import Toast from 'react-native-toast-message';

export default function ScannerScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [showCamera, setShowCamera] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // За управление на видимостта на модала
  const { budgets } = useBudgets();
  const { getSession } = useAuth();

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loadingStores, setLoadingStores] = useState(false);

  const [selectedBudget, setSelectedBudget] = useState(null); // За избрания бюджет
  const [isSendingScan, setIsSendingScan] = useState(false); // За избягване на дублирани изпращания

  const [groupedStores, setGroupedStores] = useState({});

  // Групиране по категория
  useEffect(() => {
    if (stores.length === 0) {
      setGroupedStores({});
      return;
    }
    const grouped = stores.reduce((acc, store) => {
      const categoryName = store.store_categories?.name || 'Други';
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(store);
      return acc;
    }, {});
    setGroupedStores(grouped);
  }, [stores]);

  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      try {
        const response = await api.get('/store'); // Твой ендпойнт за магазини
        setStores(response.data);
        if (response.data.length > 0) {
          setSelectedStore(response.data[0].id);
        }
      } catch (err) {
        console.error('Грешка при зареждане на магазини:', err);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, []);


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
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: 'Моля, изберете бюджет, преди да продължите.'
      });
      return;
    }
    if (!selectedStore) {
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: 'Моля, изберете магазин, преди да продължите.'
      });
      return;
    }
    if (isSendingScan) return;

    setIsSendingScan(true);
    try {
      const { user } = getSession();
      const payload = {
        raw_code: scannedData,
        budget_id: selectedBudget,
        scanned_by: user.id,
        store_id: selectedStore, // добавено
      };
      const res = await api.post('/receipt', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Сървър отговори:', res.data);
      Toast.show({
        type: 'success',
        text1: 'Успех',
        text2: 'Касовата бележка е записана успешно!'
      });
      setModalVisible(false);
      navigation.navigate('Home');
    } catch (err) {
      console.error('Грешка при заявката:', err);
      const errorMessage = err.response?.data?.message || 'Неизвестна грешка при записване на бележката.';
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: errorMessage
      });
    } finally {
      setIsSendingScan(false);
    }
  };

  const restartScan = () => {
    setScannedData(null);
    setSelectedBudget(budgets.length > 0 ? budgets[0].id : null);
    setSelectedStore(stores.length > 0 ? stores[0].id : null);
    setShowCamera(true);
    setModalVisible(false);
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
          setModalVisible(!modalVisible);
          restartScan(); // Затварянето на модала рестартира сканирането
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Избери бюджет за сканираната бележка</Text>
            <Text style={styles.modalScannedData}>Сканиран код: {scannedData}</Text>

            {
              budgets.length > 0 ? (<>
                <Text style={styles.inputLabel}>Изберете сметка</Text>
                <Picker
                  selectedValue={selectedBudget}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedBudget(itemValue)}
                >
                  <Picker.Item label="Изберете сметка" value={null} />
                  {budgets.map((budget) => (
                    <Picker.Item key={budget.id} label={budget.name} value={budget.id} />
                  ))}
                </Picker>
              </>
              ) : (
                <Text style={styles.noBudgetsText}>Няма налични бюджети. Моля, създайте такъв.</Text>
              )
            }

            {loadingStores ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : stores.length > 0 ? (
              <>
                <Text style={styles.inputLabel}>Изберете Магазин</Text>
                <Picker
                  selectedValue={selectedStore}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedStore(itemValue)}
                >
                  {Object.entries(groupedStores).map(([category, storesInCategory]) =>
                    storesInCategory.map(store => (
                      <Picker.Item
                        key={store.id}
                        label={`${category} — ${store.name}`}
                        value={store.id}
                      />
                    ))
                  )}
                </Picker>
              </>
            ) : (
              <Text style={styles.noBudgetsText}>Няма налични магазини.</Text>
            )}

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
  inputLabel: {
    textAlign: 'left',
    width: '100%',
    fontWeight: 'bold'
  }
});