import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { categoryMeta } from '../utils/storeCategories';


export default function BudgetCategoryChart({ budgetId }) {
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchChartData();
    }, [budgetId]);

    const fetchChartData = async () => {
        try {
            const res = await api.get(`/budget/${budgetId}/category-summary`);
            const totalSpent = res.data.reduce((sum, item) => sum + item.total, 0);

            const data = res.data.map((item) => {
                const meta = categoryMeta[item.categoryName] || categoryMeta['Други'];
                return {
                    value: item.total,
                    label: item.categoryName,
                    color: meta.color,
                    percentage: ((item.total / totalSpent) * 100).toFixed(1),
                };
            });

            setCategoryData(data);
            setTotal(totalSpent);
        } catch (err) {
            console.error('Грешка при зареждане на графиката:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Разходи по категории</Text>

            {loading ? (
                <ActivityIndicator />
            ) : (
                <>
                    <PieChart
                        data={categoryData}
                        showText={false}
                        isAnimated
                        radius={120}
                        innerRadius={40}
                        strokeColor="#fff"
                    />

                    <ScrollView style={styles.legendContainer}>
                        {categoryData.map((item, index) => {
                            const meta = categoryMeta[item.label] || categoryMeta['Други'];
                            return (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.colorDot, { backgroundColor: meta.color }]} />
                                    <Ionicons name={meta.icon} size={18} color={meta.color} style={{ marginRight: 6 }} />
                                    <Text style={styles.legendText}>
                                        {item.label}: {item.value.toFixed(2)} лв - {item.percentage}%
                                    </Text>
                                </View>
                            );
                        })}
                    </ScrollView>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    legendContainer: {
        marginTop: 24,
        width: '100%',
        paddingHorizontal: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 15,
        color: '#333',
    },
});
