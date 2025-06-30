import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { useBudgets } from '../storage/budgetsContext';

export default function BudgetsScreen({ navigation }) {
    // const [budgets, setBudgets] = useState([]);
    // const [loading, setLoading] = useState(true);
    const { budgets } = useBudgets();

    useEffect(() => {
        // const fetchBudgets = async () => {
        //     try {
        //         const res = await api.get('/budget');
        //         setBudgets(res.data.budgets);
        //     } catch (err) {
        //         console.error('Грешка при зареждане на бюджети:', err);
        //     } finally {
        //         setLoading(false);
        //     }
        // };

        // fetchBudgets();
    }, []);

    // if (loading) {
    //     return <ActivityIndicator style={{ marginTop: 40 }} />;
    // }

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                {budgets.map((budget) => (
                    <View key={budget.id} style={styles.budgetItem}>
                        <Text style={styles.title}>{budget.name}</Text>
                        <Button
                            title="Виж детайли"
                            onPress={() => navigation.navigate('BudgetDetails', { budget })}
                        />
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('BudgetActions')}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    budgetItem: { marginBottom: 20, backgroundColor: '#eee', padding: 16, borderRadius: 8 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007AFF',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
});
