import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import api from '../utils/api';
import BudgetSpendingTable from '../components/BudgetSpendingTable';
import Toast from 'react-native-toast-message';
import { useBudgets } from '../storage/budgetsContext';
import DefaultLayout from '../components/DefaultLayout';

export default function BudgetDetailsScreen({ route, navigation }) {
  const { budget } = route.params;
  const { fetchBudgets } = useBudgets();

  const leaveBudget = async () => {
    Alert.alert('Потвърждение', 'Сигурни ли сте, че искате да напуснете този бюджет?', [
      { text: 'Отказ', style: 'cancel' },
      {
        text: 'Напусни',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/budget/${budget.id}/leave`);

            Toast.show({
              type: 'success',
              text1: 'Успех',
              text2: 'Успешно напуснахте бюджета.'
            });
            fetchBudgets();
            navigation.replace('Home');
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Грешка',
              text2: 'Възникна проблем при напускане на бюджета.'
            });
          }
        },
      },
    ]);
  };

  return (
    <DefaultLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{budget?.name}</Text>
        <Text style={styles.subtitle}>{budget?.role}</Text>

        <Text>Описание: {budget?.description || 'Няма описание'}</Text>

        <Text>Дневен лимит: {budget?.daily_limit.toFixed(2)}</Text>

        <Text>Създаден на: {new Date(budget.created_at).toLocaleDateString()}</Text>

        <View style={styles.buttonsContainer}>
          {
            budget.role === 'owner' &&
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={() => navigation.navigate('BudgetInviteScreen', { inviteCode: budget.invite_code })}
            >
              <Text style={styles.inviteButtonText}>Покани потребители</Text>
            </TouchableOpacity>
          }

          <TouchableOpacity style={styles.leaveButton} onPress={leaveBudget}>
            <Text style={styles.leaveButtonText}>Напусни бюджета</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('BudgetEdit', { budget })}>
            <Text style={styles.leaveButtonText}>Редактирай</Text>
          </TouchableOpacity>
        </View>

        <BudgetSpendingTable budgetId={budget.id} />
      </ScrollView>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, height: '100%', overflow: 'scroll' },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  inviteButton: {
    marginVertical: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  inviteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  leaveButton: {
    paddingVertical: 12,
    backgroundColor: '#d9534f',
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#FFB400',
    borderRadius: 6,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonsContainer: {
    marginTop: 20
  }
});
