import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useBudgets } from '../storage/budgetsContext';
import { useAuth } from '../storage/authContext';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import DefaultLayout from '../components/DefaultLayout';

export default function ManualExpenseScreen({ navigation }) {
  const { budgets } = useBudgets();
  const { getSession } = useAuth();

  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);

  const [amount, setAmount] = useState('');

  useEffect(() => {
    setSelectedBudget(budgets.length > 0 ? budgets[0].id : null);
  }, [budgets]);

  useEffect(() => {
    const fetchStores = async () => {
      setLoadingStores(true);
      try {
        const res = await api.get('/store');
        setStores(res.data);
        setSelectedStore(res.data[0]?.id || null);
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Грешка', text2: 'Неуспешно зареждане на магазини' });
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  const submitExpense = async () => {
    if (!amount || !selectedBudget || !selectedStore) {
      Alert.alert('Моля, попълнете всички полета');
      return;
    }
  
    const { user } = getSession();
  
    try {
      await api.post('/receipt', {
        // raw_code не се изпраща
        amount: amount,            // изпращаме сумата отделно
        budget_id: selectedBudget,
        scanned_by: user.id,
        store_id: selectedStore,
      });
  
      Toast.show({
        type: 'success',
        text1: 'Добавен разход',
        text2: 'Разходът беше въведен успешно.',
      });
      navigation.goBack();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: 'Неуспешно добавяне на разход.',
      });
    }
  };
  

  return (
    <DefaultLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ръчно въвеждане на разход</Text>

        <Text style={styles.label}>Сума (лв)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Пример: 45.99"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Бюджет</Text>
        <Picker
          selectedValue={selectedBudget}
          style={styles.picker}
          onValueChange={(item) => setSelectedBudget(item)}
        >
          {budgets.map((b) => (
            <Picker.Item label={b.name} value={b.id} key={b.id} />
          ))}
        </Picker>

        <Text style={styles.label}>Магазин</Text>
        {loadingStores ? (
          <ActivityIndicator />
        ) : (
          <Picker
            selectedValue={selectedStore}
            style={styles.picker}
            onValueChange={(item) => setSelectedStore(item)}
          >
            {stores.map((store) => (
              <Picker.Item key={store.id} label={store.name} value={store.id} />
            ))}
          </Picker>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Добави разход" onPress={submitExpense} />
        </View>
      </ScrollView>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { marginBottom: 6, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: { marginTop: 20 },
});
