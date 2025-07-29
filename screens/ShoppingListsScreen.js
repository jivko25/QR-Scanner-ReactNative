import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';

export default function ShoppingListsScreen() {
    const [shoppingLists, setShoppingLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            api.get('/shopping-list')
                .then(res => setShoppingLists(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }, [])
    );

    function renderItem({ item, index }) {
        const isCompleted = item.totalItems > 0 && item.boughtItems === item.totalItems;
        const backgroundColor = isCompleted ? '#2ecc71' : getColorByIndex(index);

        return (
            <TouchableOpacity
                style={[styles.listItem, { backgroundColor }]}
                onPress={() => navigation.navigate('ShoppingListDetailScreen', { id: item.id })}
            >
                <View style={styles.itemHeader}>
                    <Text style={styles.listItemText}>{item.name}</Text>
                    {isCompleted && (
                        <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#fff"
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </View>

                <Text style={styles.listItemSubtitle}>
                    {item.boughtItems} / {item.totalItems} продукта купени
                </Text>
            </TouchableOpacity>
        );
    }


    if (loading) {
        return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
    }

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <FlatList
                    data={shoppingLists}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    renderItem={renderItem}
                    ListEmptyComponent={() => (
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>Нямате запазени списъци.</Text>
                        </View>
                    )}
                />

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateShoppingListScreen')}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.addButtonText}>Нов списък</Text>
                </TouchableOpacity>
            </View>
        </DefaultLayout>
    );
}

const getColorByIndex = (index) => {
    const colors = ['#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#8d99ae', '#d62828'];
    return colors[index % colors.length];
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        position: 'relative',
    },
    listItem: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    listItemText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    listItemSubtitle: {
        fontSize: 14,
        color: '#f2f2f2',
        opacity: 0.85,
        marginTop: 4,
    },
    centered: {
        marginTop: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
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
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },    
});
