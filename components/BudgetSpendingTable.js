import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../utils/api';
import useDebouncedValue from '../hooks/useDebouncedBalue';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { categoryMeta } from '../utils/storeCategories';

export default function BudgetSpendingTable({ budgetId }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const debouncedSearch = useDebouncedValue(searchText);
  const debouncedMin = useDebouncedValue(min);
  const debouncedMax = useDebouncedValue(max);
  const debouncedStartDate = useDebouncedValue(startDate);
  const debouncedEndDate = useDebouncedValue(endDate);

  useEffect(() => {
    if (budgetId) {
      fetchSpending();
    }
  }, [budgetId]);

  useEffect(() => {
    fetchSpending();
  }, [debouncedSearch, debouncedMin, debouncedMax, debouncedStartDate, debouncedEndDate]);

  const fetchSpending = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchText) params.append('search', searchText);
      if (min) params.append('min', min);
      if (max) params.append('max', max);
      if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);

      const res = await api.get(`/budget/${budgetId}/summary?${params.toString()}`);

      const formattedUsers = res.data.users.map(user => ({
        userId: user.userId,
        userName: user.displayName,
        totalSpending: user.total,
      }));

      const formattedReceipts = res.data.receipts.map(receipt => ({
        id: receipt.id,
        userId: receipt.scanned_by,
        userName: receipt.displayName,
        amount: receipt.amount,
        date: new Date(receipt.date),
        store: receipt.store || null,
      }));

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
      setReceipts(formattedReceipts);
      setFilteredReceipts(formattedReceipts);
    } catch (e) {
      console.error('Грешка при зареждане:', e);
      Alert.alert('Грешка', 'Неуспешно зареждане на данни.');
    } finally {
      setLoading(false);
    }
  };

  // Календарни функции
  const showStartPicker = () => setStartPickerVisible(true);
  const hideStartPicker = () => setStartPickerVisible(false);
  const showEndPicker = () => setEndPickerVisible(true);
  const hideEndPicker = () => setEndPickerVisible(false);

  const handleConfirmStart = (date) => {
    setStartDate(date);
    hideStartPicker();
  };

  const handleConfirmEnd = (date) => {
    setEndDate(date);
    hideEndPicker();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const renderUser = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.userName}</Text>
      <Text style={styles.cell}>{item.totalSpending.toFixed(2)} лв</Text>
    </View>
  );

  const renderReceipt = ({ item }) => {
    const categoryName = item.store?.categoryName || 'Други';
    const { icon, color } = categoryMeta[categoryName] || categoryMeta['Други'];

    return (
      <View style={styles.row}>
        <View style={{ flexDirection: 'row', flex: 2, alignItems: 'center' }}>
          <Ionicons name={icon} size={20} color={color} style={{ marginRight: 6 }} />
          <Text style={[styles.cell, { color }]}>{item.store?.name || 'Неизвестен магазин'}</Text>
        </View>
        <Text style={[styles.cell, { flex: 1 }]}>{item.userName}</Text>
        <Text style={[styles.cell, { flex: 1 }]}>{item.amount.toFixed(2)} лв</Text>
        <Text style={[styles.cell, { flex: 1 }]}>{item.date.toLocaleDateString()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Филтриране</Text>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Търси по име"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TextInput
          style={styles.input}
          placeholder="Мин. сума"
          keyboardType="numeric"
          value={min}
          onChangeText={setMin}
        />
        <TextInput
          style={styles.input}
          placeholder="Макс. сума"
          keyboardType="numeric"
          value={max}
          onChangeText={setMax}
        />
      </View>

      <View style={styles.datePickers}>
        <TouchableOpacity onPress={showStartPicker} style={styles.dateInput}>
          <Text>{startDate ? formatDate(startDate) : 'Начална дата'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={showEndPicker} style={styles.dateInput}>
          <Text>{endDate ? formatDate(endDate) : 'Крайна дата'}</Text>
        </TouchableOpacity>
      </View>

      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="date"
        onConfirm={handleConfirmStart}
        onCancel={hideStartPicker}
      />
      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="date"
        onConfirm={handleConfirmEnd}
        onCancel={hideEndPicker}
      />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <>
          <Text style={styles.title}>Разходи по потребители</Text>
          {filteredUsers.map(item => (
            <View key={item.userId}>
              {renderUser({ item })}
            </View>
          ))}

          <Text style={styles.title}>Касови бележки</Text>

          {/* Заглавия на колоните */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}>Магазин</Text>
            <Text style={[styles.cell, { flex: 1, fontWeight: 'bold' }]}>Потребител</Text>
            <Text style={[styles.cell, { flex: 1, fontWeight: 'bold' }]}>Сума</Text>
            <Text style={[styles.cell, { flex: 1, fontWeight: 'bold' }]}>Дата</Text>
          </View>

          {filteredReceipts.map(item => (
            <View key={item.id}>
              {renderReceipt({ item })}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, paddingVertical: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  filters: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    flex: 1,
    marginHorizontal: 4,
    height: 40,
  },
  datePickers: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    fontSize: 16,
    flex: 1,
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
    marginBottom: 8,
  },
});
