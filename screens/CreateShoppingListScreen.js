import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';

export default function CreateShoppingListScreen() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Грешка', 'Моля, въведете име на списъка.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/shopping-list', { name: name.trim() });
            // При успешно създаване връщаме към списъка и/или към новия списък детайли
            navigation.goBack();
            // или navigation.navigate('ShoppingListDetailScreen', { id: response.data.id });
        } catch (error) {
            console.error('Failed to create shopping list:', error);
            Alert.alert('Грешка', 'Неуспешно създаване на списъка. Опитайте пак.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <Text style={styles.label}>Име на списъка</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Въведете име"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                    autoFocus
                />

                <TouchableOpacity
                    style={[styles.button, loading ? styles.buttonDisabled : null]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Създай списък</Text>
                    )}
                </TouchableOpacity>
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 12,
        color: '#333',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#27ae60',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#7fcf8f',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
});
