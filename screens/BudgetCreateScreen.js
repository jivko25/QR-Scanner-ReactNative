import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import api from '../utils/api';
import { useBudgets } from '../storage/budgetsContext';
import Toast from 'react-native-toast-message';
import DefaultLayout from '../components/DefaultLayout';

export default function BudgetCreateScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const { fetchBudgets } = useBudgets();

  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: 'Моля въведи име на бюджета.'
      });
      return;
    }

    try {
      await api.post('/budget', { name, description, displayName, dailyLimit });

      Toast.show({
        type: 'success',
        text1: 'Успех',
        text2: 'Бюджетът е създаден успешно!'
      });
      navigation.goBack(); // или navigation.replace('Budgets') ако искаш директно към списъка
    } catch (err) {
      const msg = err.response?.data?.error || 'Проблем при създаване на бюджет';
      Toast.show({
        type: 'error',
        text1: 'Грешка',
        text2: msg
      });
    }
    finally {
      fetchBudgets();
    }
  };

  return (
    <DefaultLayout>
      <View style={styles.container}>
        <Text>Име на бюджета</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Пример: Семеен бюджет"
        />
        <Text>Описание (по избор)</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Описание на бюджета"
        />
        <Text>Вашето име в сметката</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder=""
          autoCapitalize="none"
        />
        <Text>Дневен лимит</Text>
        <TextInput
          style={styles.input}
          value={dailyLimit}
          onChangeText={setDailyLimit}
          placeholder=""
          autoCapitalize="none"
        />

        <Button title="Създай бюджет" onPress={handleCreate} />
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
});