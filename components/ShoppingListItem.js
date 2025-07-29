import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FullScreenImageViewer from './FullScreenImageViewer';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';

export default function ShoppingListItem({
    item,
    onToggleBought,
    onQuantityChange,
    onRemoveItem,
}) {
    const parsed = item.json_text ? JSON.parse(item.json_text) : null;

    const [isBought, setIsBought] = useState(item.is_bought);
    const [quantity, setQuantity] = useState(item.quantity);

    useEffect(() => {
        setIsBought(item.is_bought);
        setQuantity(item.quantity);
    }, [item.is_bought, item.quantity]);

    const handleToggleBought = () => {
        setIsBought((prev) => !prev);
        onToggleBought(item.id);
    };

    const handleQuantityChange = (direction) => {
        setQuantity((prev) => {
            const newQuantity = direction === 'up' ? prev + 1 : Math.max(1, prev - 1);
            return newQuantity;
        });
        onQuantityChange(item.id, direction);
    };

    return (
        <View style={[styles.itemContainer, isBought && styles.boughtContainer]}>
            <View style={styles.topRow}>
                <FullScreenImageViewer
                    uri={item.image_url}
                    variant="icon"
                    iconSize={50}
                    iconColor="#007AFF"
                />
                <View style={styles.textRow}>
                    <Text style={[
                        styles.compactText,
                        isBought && styles.boughtText
                    ]}>
                        <Text style={styles.boldLabel}>Продукт: </Text>
                        {parsed?.product || item.name}
                    </Text>
                    {parsed?.brand && (
                        <Text style={[styles.compactText, isBought && styles.boughtText]}>
                            <Text style={styles.boldLabel}>Марка: </Text>
                            {parsed.brand}
                        </Text>
                    )}
                    {parsed?.weight && (
                        <Text style={[styles.compactText, isBought && styles.boughtText]}>
                            <Text style={styles.boldLabel}>Грамаж: </Text>
                            {parsed.weight}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity onPress={handleToggleBought}>
                    <Ionicons
                        name={isBought ? 'checkbox' : 'square-outline'}
                        size={24}
                        color={isBought ? '#27ae60' : '#999'}
                    />
                </TouchableOpacity>

                {!isBought && (
                    <>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity onPress={() => handleQuantityChange('down')}>
                                <AntDesign name="minuscircleo" size={20} color="#007AFF" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity onPress={() => handleQuantityChange('up')}>
                                <AntDesign name="pluscircleo" size={20} color="#007AFF" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => onRemoveItem(item.id)}>
                            <Feather name="trash-2" size={22} color="#e74c3c" />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        padding: 12,
        backgroundColor: '#f9f9f9',
        marginBottom: 12,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 3,
    },
    boughtContainer: {
        backgroundColor: '#e6f4ea',
        borderWidth: 2,
        borderColor: '#27ae60',
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 6,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 10,
    },
    textRow: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    compactText: {
        fontSize: 14,
        color: '#333',
        flexWrap: 'wrap',
    },
    boughtText: {
        textDecorationLine: 'line-through',
        color: '#555',
    },
    boldLabel: {
        fontWeight: '600',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 8,
    },
});
