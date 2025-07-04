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
import { Ionicons } from '@expo/vector-icons';

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

  const deleteBudget = async () => {
    Alert.alert('Потвърждение', 'Сигурни ли сте, че искате да изтриете този бюджет?', [
      { text: 'Отказ', style: 'cancel' },
      {
        text: 'Изтрий',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/budget/${budget.id}`);

            Toast.show({
              type: 'success',
              text1: 'Успех',
              text2: 'Бюджетът беше изтрит успешно.'
            });
            fetchBudgets();
            navigation.replace('Home');
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Грешка',
              text2: 'Възникна проблем при изтриването на бюджета.'
            });
          }
        }
      }
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
              style={[styles.iconButton, styles.inviteButton]}
              onPress={() => navigation.navigate('BudgetInviteScreen', { inviteCode: budget.invite_code })}
            >
              <Ionicons name="person-add-outline" size={24} color="#fff" />
            </TouchableOpacity>
          }

          {
            budget.role === 'owner' ?
              <TouchableOpacity style={[styles.iconButton, styles.leaveButton]} onPress={deleteBudget}>
                <Ionicons name="trash-outline" size={24} color="#fff" />
              </TouchableOpacity> :
              <TouchableOpacity style={[styles.iconButton, styles.leaveButton]} onPress={leaveBudget}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
              </TouchableOpacity>
          }

          <TouchableOpacity style={[styles.iconButton, styles.editButton]} onPress={() => navigation.navigate('BudgetEdit', { budget })}>
            <Ionicons name="create-outline" size={24} color="#fff" />
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
    backgroundColor: '#d9534f',
    borderRadius: 6,
    alignItems: 'center',
  },
  editButton: {
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
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    gap: 20
  },

  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
