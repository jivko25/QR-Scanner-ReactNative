import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import api from '../utils/api';
import useDebouncedValue from '../hooks/useDebouncedBalue';

export default function BudgetSpendingTable({ budgetId }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [receipts, setReceipts] = useState([]);
    const [filteredReceipts, setFilteredReceipts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');

    const debouncedSearch = useDebouncedValue(searchText);
    const debouncedMin = useDebouncedValue(min);
    const debouncedMax = useDebouncedValue(max);

    useEffect(() => {
        if (budgetId) {
            fetchSpending();
        }
    }, [budgetId]);

    useEffect(() => {
        fetchSpending();
    }, [debouncedSearch, debouncedMin, debouncedMax]);

    const fetchSpending = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (searchText) params.append('search', searchText);
            if (min) params.append('min', min);
            if (max) params.append('max', max);

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
                date: new Date(receipt.created_at),
            }));

            setUsers(formattedUsers);
            setFilteredUsers(formattedUsers);
            setReceipts(formattedReceipts);
            setFilteredReceipts(formattedReceipts);
        } catch (e) {
            console.error('Грешка при зареждане:', e);
        } finally {
            setLoading(false);
        }
    };

    const renderUser = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.userName}</Text>
            <Text style={styles.cell}>{item.totalSpending.toFixed(2)} лв</Text>
        </View>
    );

    const renderReceipt = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.userName}</Text>
            <Text style={styles.cell}>{item.amount.toFixed(2)} лв</Text>
            <Text style={styles.cell}>{item.date.toLocaleDateString()}</Text>
        </View>
    );

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

            {
                loading ? (
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
                        {filteredReceipts.map(item => (
                            <View key={item.id}>
                                {renderReceipt({ item })}
                            </View>
                        ))}
                    </>
                )
            }

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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cell: { fontSize: 16, flex: 1 },
    receiptsContainer: {
        height: 200,
        overflow: 'scroll'
    }
});
