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
  const [stores, setStores] = useState([]);
  const [groupedStores, setGroupedStores] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
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
        const storesData = res.data;

        // Групиране по категории
        const grouped = storesData.reduce((acc, store) => {
          const category = store.store_categories?.name || 'Други';
          if (!acc[category]) acc[category] = [];
          acc[category].push(store);
          return acc;
        }, {});

        // Подреждане на категориите, с "Други" накрая
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
          if (a === 'Други') return 1;
          if (b === 'Други') return -1;
          return a.localeCompare(b);
        });

        setStores(storesData);
        setGroupedStores(grouped);
        setCategories(sortedCategories);
        setSelectedCategory(sortedCategories[0] || null);
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Грешка', text2: 'Неуспешно зареждане на магазини' });
      } finally {
        setLoadingStores(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    // Автоматично избира първия магазин от избраната категория
    if (selectedCategory && groupedStores[selectedCategory]) {
      const sortedStores = [...groupedStores[selectedCategory]].sort((a, b) => {
        if (a.name === 'Друг') return 1;
        if (b.name === 'Друг') return -1;
        return a.name.localeCompare(b.name);
      });
      setSelectedStore(sortedStores[0]?.id || null);
    }
  }, [selectedCategory]);

  const submitExpense = async () => {
    if (!amount || !selectedBudget || !selectedStore) {
      Alert.alert('Моля, попълнете всички полета');
      return;
    }

    const { user } = getSession();

    try {
      await api.post('/receipt', {
        amount: amount,
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

        <Text style={styles.label}>Категория на магазин</Text>
        {loadingStores ? (
          <ActivityIndicator />
        ) : (
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            {categories.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
        )}

        <Text style={styles.label}>Магазин</Text>
        {loadingStores ? (
          <ActivityIndicator />
        ) : (
          <Picker
            selectedValue={selectedStore}
            style={styles.picker}
            onValueChange={(value) => setSelectedStore(value)}
            enabled={!!selectedCategory}
          >
            {selectedCategory &&
              groupedStores[selectedCategory]?.length > 0 &&
              [...groupedStores[selectedCategory]]
                .sort((a, b) => {
                  if (a.name === 'Друг') return 1;
                  if (b.name === 'Друг') return -1;
                  return a.name.localeCompare(b.name);
                })
                .map((store) => (
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
