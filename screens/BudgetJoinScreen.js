import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import api from '../utils/api';
import { useBudgets } from '../storage/budgetsContext';

export default function BudgetJoinScreen({ navigation }) {
  const [inviteCode, setInviteCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { fetchBudgets } = useBudgets();

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      return Alert.alert('Грешка', 'Моля въведи код за покана.');
    }

    try {
      const res = await api.post('/budget/join', { invite_code: inviteCode, display_name: displayName });

      Alert.alert('Успех', `Присъедини се към: ${res.data.budget.name}`);
      navigation.goBack();
    } catch (err) {
      const msg = err.response?.data?.error || 'Проблем при присъединяване';
      Alert.alert('Грешка', err);
    }
    finally {
      fetchBudgets()
    }
  };

  return (
    <View style={styles.container}>
      <Text>Въведи код за покана</Text>
      <TextInput
        style={styles.input}
        value={inviteCode}
        onChangeText={setInviteCode}
        placeholder="Пример: Xyz123"
        autoCapitalize="none"
      />
      <Text>Вашето име в сметката</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder=""
        autoCapitalize="none"
      />

      <Button title="Присъедини се" onPress={handleJoin} />
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
