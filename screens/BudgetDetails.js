import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, Alert } from 'react-native';

export default function BudgetDetailsScreen({ route, navigation }) {
  const { budget } = route.params;

  const copyToClipboard = () => {
    if (budget?.invite_code) {
      Clipboard.setString(budget.invite_code);
      Alert.alert('Копирано!', 'Кодът за покана е копиран в клипборда.');
    } else {
      Alert.alert('Грешка', 'Няма код за покана за копиране.');
    }
  };

  // Функция за напускане на бюджета
  const leaveBudget = async () => {
    Alert.alert(
      'Потвърждение',
      'Сигурни ли сте, че искате да напуснете този бюджет?',
      [
        { text: 'Отказ', style: 'cancel' },
        {
          text: 'Напусни',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`https://your-api-url.com/budgets/${budget.id}/leave`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  // Добави нужния авторизационен токен, ако има
                  Authorization: `Bearer YOUR_TOKEN_HERE`,
                },
              });

              if (response.ok) {
                Alert.alert('Успех', 'Успешно напуснахте бюджета.');
                navigation.goBack(); // Връщаме се към предишния екран
              } else {
                const errorData = await response.json();
                Alert.alert('Грешка', errorData.error || 'Неуспешно напускане на бюджета.');
              }
            } catch (error) {
              Alert.alert('Грешка', 'Възникна проблем при напускане на бюджета.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{budget?.name}</Text>
      <Text>Описание: {budget?.description || 'Няма описание'}</Text>

      <TouchableOpacity onPress={copyToClipboard}>
        <Text>
          Код за покана: <Text style={styles.inviteCodeText}>{budget?.invite_code || 'Няма код'}</Text>
        </Text>
      </TouchableOpacity>

      <Text>Създаден на: {new Date(budget.created_at).toLocaleDateString()}</Text>

      <TouchableOpacity style={styles.leaveButton} onPress={leaveBudget}>
        <Text style={styles.leaveButtonText}>Напусни бюджета</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  inviteCodeText: {
    fontWeight: 'bold',
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  leaveButton: {
    marginTop: 30,
    paddingVertical: 12,
    backgroundColor: '#d9534f', // червен цвят
    borderRadius: 6,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
