import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import api from '../utils/api';
import { useBudgets } from '../storage/budgetsContext';
import Toast from 'react-native-toast-message';

export default function BudgetEditScreen({ route, navigation }) {
    const { budget } = route.params; // очакваме да получим { budget } от предишния екран
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [dailyLimit, setDailyLimit] = useState('');
    const { fetchBudgets } = useBudgets();

    const isOwner = budget.role === 'owner';

    useEffect(() => {
        if (budget) {
            setName(budget.name || '');
            setDescription(budget.description || '');
            setDisplayName(budget.display_name || '');
            setDailyLimit(budget.daily_limit || 0);
        }
    }, [budget]);

    const handleUpdate = async () => {
        if (!name.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Грешка',
                text2: 'Моля въведи име на бюджета.'
            });
        }

        try {
            await api.patch(`/budget/${budget.id}`, {
                name,
                description,
                displayName,
                dailyLimit
            });

            Toast.show({
                type: 'success',
                text1: 'Успех',
                text2: 'Бюджетът е обновен успешно!'
            });

            navigation.navigate('Home');
        } catch (err) {
            const msg = err.response?.data?.error || 'Грешка при обновяване на бюджета.';
            Toast.show({
                type: 'error',
                text1: 'Грешка',
                text2: msg
            });
        } finally {
            fetchBudgets();
        }
    };

    return (
        <DefaultLayout>
            <View style={styles.container}>
                {isOwner && (
                    <>
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

                        <Text>Дневен лимит (по избор)</Text>
                        <TextInput
                            style={styles.input}
                            value={`${dailyLimit}`}
                            onChangeText={setDailyLimit}
                            placeholder="Дневен лимит"
                            keyboardType="numeric"
                        />
                    </>
                )}
                <Text>Вашето име в сметката</Text>
                <TextInput
                    style={styles.input}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="none"
                />

                <Button title="Запази промените" onPress={handleUpdate} />
            </View>
        </DefaultLayout>
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
