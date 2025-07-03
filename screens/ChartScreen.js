import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Alert,
    Button,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../utils/api';
import { getColorByIndex } from '../utils/getColor';
import DefaultLayout from '../components/DefaultLayout';

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDateLocal(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWeekdayLabel(date) {
    const weekdaysBg = ['нд', 'пон', 'втр', 'срд', 'чет', 'пет', 'съб'];
    const d = new Date(date);
    return weekdaysBg[d.getDay()];
}

export function ChartScreen() {
    const [budgetsData, setBudgetsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));

    useEffect(() => {
        const fetchBudgetReceipts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get(`/receipt`);
                setBudgetsData(response.data);
            } catch (err) {
                console.error(err);
                setError('Не успяхме да заредим данните за бюджетите. Моля, опитайте отново.');
            } finally {
                setLoading(false);
            }
        };
        fetchBudgetReceipts();
    }, []);

    const handlePreviousWeek = () =>
        setCurrentWeekStart(prev => getMonday(new Date(prev.getTime() - 7 * 86400000)));

    const handleNextWeek = () =>
        setCurrentWeekStart(prev => getMonday(new Date(prev.getTime() + 7 * 86400000)));

    if (loading) {
        return (
            <View style={chartStyles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={chartStyles.loadingText}>Зареждане на данни за бюджетите...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={chartStyles.centered}>
                <Text style={chartStyles.errorText}>{error}</Text>
                <Button title="Опитай отново" onPress={() => Alert.alert('Refresh', 'Имплементирай логика за рефреш')} />
            </View>
        );
    }

    if (budgetsData.length === 0) {
        return (
            <View style={chartStyles.noDataContainer}>
                <Text style={chartStyles.noDataText}>Няма намерени бюджети, в които участвате.</Text>
                <Text style={chartStyles.noDataText}>Моля, присъединете се или създайте нов бюджет.</Text>
            </View>
        );
    }

    return (
        <DefaultLayout>
            <ScrollView style={chartStyles.container}>
                <View style={chartStyles.topControls}>
                    <TouchableOpacity style={chartStyles.navButton} onPress={handlePreviousWeek}>
                        <Ionicons name="chevron-back" size={20} color="#007AFF" />
                        <Text style={chartStyles.navText}>Предишна</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={chartStyles.navButton} onPress={handleNextWeek}>
                        <Text style={chartStyles.navText}>Следваща</Text>
                        <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                {budgetsData.map((budget, index) => {
                    const sortedReceipts = [...budget.receipts].sort((a, b) => new Date(a.date) - new Date(b.date));

                    const weekStartStr = formatDateLocal(currentWeekStart);
                    const weekEnd = new Date(currentWeekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    const weekEndStr = formatDateLocal(weekEnd);

                    const weekly = sortedReceipts.filter(item => {
                        const d = formatDateLocal(item.date);
                        return d >= weekStartStr && d <= weekEndStr;
                    });

                    const grouped = weekly.reduce((acc, it) => {
                        const key = formatDateLocal(it.date);
                        acc[key] = (acc[key] || 0) + parseFloat(it.amount);
                        return acc;
                    }, {});

                    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
                    const labels = sortedDates.map(dateStr => getWeekdayLabel(dateStr));
                    const amounts = sortedDates.map(dateStr => grouped[dateStr]);
                    const total = amounts.reduce((s, v) => s + v, 0);

                    const chartData = amounts.map((amount, i) => ({
                        value: amount,
                        label: labels[i],
                        date: sortedDates[i],
                    }));

                    const limitValue = budget.budgetDailyLimit; // лимитът в лева
                    const limitLineData = chartData.map((point) => ({
                        value: limitValue,
                        label: point.label,
                    }));

                    return (
                        <View key={budget.id} style={chartStyles.budgetChartContainer}>
                            <Text style={chartStyles.title}>Бюджет: {budget.name}</Text>
                            <Text style={chartStyles.subtitle}>
                                Разходи за периода: {weekStartStr} – {weekEndStr}
                            </Text>
                            <Text style={chartStyles.subtitle}>Общо: {total.toFixed(2)} лв.</Text>

                            {labels.length === 0 ? (
                                <View style={chartStyles.noDataChartContainer}>
                                    <Text style={chartStyles.noDataText}>Няма данни за този бюджет за избраната седмица.</Text>
                                </View>
                            ) : (
                                <LineChart
                                    data={chartData}
                                    data2={limitLineData}
                                    areaChart
                                    curved
                                    height={220}
                                    thickness={3}
                                    color={getColorByIndex(index, 'secondary')}
                                    noOfSections={4}
                                    startFillColor={getColorByIndex(index, 'secondary')}   // Запълване (горе)
                                    endFillColor="#ffffff00"                  // Преливане към прозрачно (долу)
                                    yAxisTextStyle={{ color: '#888' }}
                                    xAxisLabelTextStyle={{ color: '#888' }}
                                    color2='#FF3B30'
                                    thickness2={1}
                                    hideDataPoints2={true}
                                    rulesColor="#eee"
                                    showVerticalLines
                                    xAxisColor="#ccc"
                                    yAxisColor="#ccc"
                                    showValuesAsDataPoints
                                    isAnimated
                                    startOpacity={0}
                                    endOpacity={0}
                                    onPress={(item) => {
                                        Alert.alert(
                                            `Бюджет ${budget.name}`,
                                            `Дата: ${item.date}\nСума: ${item.value.toFixed(2)} лв.`
                                        );
                                    }}
                                    hideDataPoints={false}
                                    dataPointsColor="#ffa726"
                                />
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </DefaultLayout>
    );
}

const chartStyles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#f9f9f9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#555' },
    errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 20 },
    budgetChartContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, color: '#333' },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 10, color: '#666' },
    noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    noDataChartContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 16,
        marginVertical: 8,
        backgroundColor: '#f5f5f5',
    },
    noDataText: { fontSize: 16, marginBottom: 12, textAlign: 'center', color: '#888' },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 10,
        marginTop: 10,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#e0f0ff',
        borderRadius: 8,
    },
    navText: {
        color: '#007AFF',
        fontWeight: '600',
        marginHorizontal: 5,
        fontSize: 16,
    },
});
