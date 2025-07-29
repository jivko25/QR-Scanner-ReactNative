import React, { useCallback, useState, useMemo } from 'react';
import {
    View,
    Text,
    SectionList,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ShoppingListItem from '../components/ShoppingListItem';
import debounce from '../utils/debounce';

export default function ShoppingListDetailScreen({ route, navigation }) {
    const { id } = route.params;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            fetchItems();
        }, [])
    );

    const debouncedUpdateItem = useMemo(
        () =>
            debounce(async (itemId, updatedItem) => {
                try {
                    const response = await api.put(`/shopping-list/${id}/items/${itemId}`, updatedItem);
                    setItems((prev) =>
                        prev.map((i) => (i.id === itemId ? { ...i, ...response.data } : i))
                    );
                } catch (error) {
                    console.error('Debounced update error:', error);
                }
            }, 500),
        [id]
    );

    async function fetchItems() {
        try {
            setLoading(true);
            const response = await api.get(`/shopping-list/${id}/items`);
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleToggleBought(itemId) {
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        const updatedItem = {
            name: item.name,
            quantity: item.quantity,
            is_bought: !item.is_bought,
        };

        setItems((prev) =>
            prev.map((i) =>
                i.id === itemId ? { ...i, is_bought: updatedItem.is_bought } : i
            )
        );

        debouncedUpdateItem(itemId, updatedItem);
    }

    function handleQuantityChange(itemId, direction) {
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        let newQuantity = item.quantity;
        if (direction === 'up') newQuantity += 1;
        else if (direction === 'down') newQuantity = Math.max(1, item.quantity - 1);

        const updatedItem = {
            name: item.name,
            quantity: newQuantity,
            is_bought: item.is_bought,
        };

        setItems((prev) =>
            prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
        );

        debouncedUpdateItem(itemId, updatedItem);
    }

    async function handleRemoveItem(itemId) {
        try {
            await api.delete(`/shopping-list/${id}/items/${itemId}`);
            setItems((prev) => prev.filter((i) => i.id !== itemId));
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    }

    if (loading) {
        return (
            <DefaultLayout>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </DefaultLayout>
        );
    }

    // Разделяме айтъмите по is_bought
    const sections = [
        {
            title: 'Не купени',
            data: items.filter((item) => !item.is_bought),
        },
        {
            title: 'Купени',
            data: items.filter((item) => item.is_bought),
        },
    ];

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ShoppingListItem
                            item={item}
                            onToggleBought={handleToggleBought}
                            onQuantityChange={handleQuantityChange}
                            onRemoveItem={handleRemoveItem}
                        />
                    )}
                    renderSectionHeader={({ section }) =>
                        section.data.length > 0 ? (
                            <Text style={styles.sectionHeader}>{section.title}</Text>
                        ) : null
                    }
                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                    stickySectionHeadersEnabled={false}
                />
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() =>
                        navigation.navigate('AddItemsFromImagesScreen', {
                            shoppingListId: id,
                        })
                    }
                >
                    <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.addButtonText}>Добави продукт</Text>
                </TouchableOpacity>
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        marginTop: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#27ae60',
        paddingVertical: 14,
        borderRadius: 12,
        justifyContent: 'center',
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
