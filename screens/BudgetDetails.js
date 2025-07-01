import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert,
  ActivityIndicator,
  FlatList,
  ScrollView
} from 'react-native';
import api from '../utils/api';
import BudgetSpendingTable from '../components/BudgetSpendingTable';

export default function BudgetDetailsScreen({ route, navigation }) {
  const { budget } = route.params;
  const [spendingData, setSpendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const copyToClipboard = () => {
    if (budget?.invite_code) {
      Clipboard.setString(budget.invite_code);
      Alert.alert('Копирано!', 'Кодът за покана е копиран в клипборда.');
    }
  };

  const fetchSpendingData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budget/${budget.id}/spending-by-user`);
      const data = res.data;
  
      setSpendingData(data);
      const totalSum = data.reduce((sum, entry) => sum + entry.totalSpending, 0);
      setTotal(totalSum);
    } catch (err) {
      console.error('Грешка при взимане на разходите:', err);
      Alert.alert('Грешка', 'Неуспешно зареждане на разходите по потребители.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpendingData();
  }, []);

  const leaveBudget = async () => {
    Alert.alert('Потвърждение', 'Сигурни ли сте, че искате да напуснете този бюджет?', [
      { text: 'Отказ', style: 'cancel' },
      {
        text: 'Напусни',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await api.delete(`/budgets/${budget.id}/leave`);

            if (response.ok) {
              Alert.alert('Успех', 'Успешно напуснахте бюджета.');
              navigation.goBack();
            } else {
              const errorData = await response.json();
              Alert.alert('Грешка', errorData.error || 'Неуспешно напускане на бюджета.');
            }
          } catch (error) {
            Alert.alert('Грешка', 'Възникна проблем при напускане на бюджета.');
          }
        },
      },
    ]);
  };

  const renderSpender = ({ item }) => {
    const percent = total ? (item.totalSpending / total) * 100 : 0;

    return (
      <View style={styles.spenderRow}>
        <Text style={styles.spenderName}>{item.userName}</Text>
        <Text style={styles.spenderAmount}>{item.totalSpending.toFixed(2)} лв.</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
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

      <Text style={styles.sectionTitle}>Разходи по потребители</Text>

      <BudgetSpendingTable budgetId={budget.id} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 , height: '100%', overflow: 'scroll'},
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  inviteCodeText: {
    fontWeight: 'bold',
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  leaveButton: {
    marginTop: 30,
    paddingVertical: 12,
    backgroundColor: '#d9534f',
    borderRadius: 6,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  spenderRow: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  spenderName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  spenderAmount: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#007AFF',
  },
});
