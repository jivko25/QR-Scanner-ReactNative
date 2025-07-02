import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../utils/api';
import { useBudgets } from '../storage/budgetsContext';

export default function BudgetCreateScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dailyLimit, setDailyLimit] = useState('');
  const { fetchBudgets } = useBudgets();

  const handleCreate = async () => {
    if (!name.trim()) {
      return Alert.alert('Грешка', 'Моля въведи име на бюджета.');
    }

    try {
      const res = await api.post('/budget', { name, description, displayName, dailyLimit });

      Alert.alert('Успех', 'Бюджетът е създаден успешно!');
      navigation.goBack(); // или navigation.replace('Budgets') ако искаш директно към списъка
    } catch (err) {
      const msg = err.response?.data?.error || 'Проблем при създаване на бюджет';
      Alert.alert('Грешка', msg);
    }
    finally {
      fetchBudgets();
    }
  };

  return (
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

      <Button title="Създай бюджет" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
});