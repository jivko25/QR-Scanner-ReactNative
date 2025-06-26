import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard, Alert } from 'react-native';

export default function BudgetDetailsScreen({ route }) {
  const { budget } = route.params;

  const copyToClipboard = () => {
    if (budget?.invite_code) {
      Clipboard.setString(budget.invite_code);
      Alert.alert('Копирано!', 'Кодът за покана е копиран в клипборда.');
    } else {
      Alert.alert('Грешка', 'Няма код за покана за копиране.');
    }
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
      {/* Добави още данни ако има */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  inviteCodeText: {
    fontWeight: 'bold',
    color: '#007bff', // Може да промените цвета за по-добра видимост, че може да се клика
    textDecorationLine: 'underline', // Подчертава текста, за да изглежда като линк
  },
});