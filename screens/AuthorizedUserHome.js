import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../storage/authContext';
import { useBudgets } from '../storage/budgetsContext';
import LottieView from 'lottie-react-native';
import loadingAnimation from '../assets/loading-animation.json';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../utils/api';
import { getColorByIndex } from '../utils/getColor';
import Toast from 'react-native-toast-message';
import DefaultLayout from '../components/DefaultLayout'
import { categoryMeta } from '../utils/storeCategories';
import StepGuide from '../components/StepGuide';
import { useOffline } from '../storage/offlineContext';

export default function HomeScreen({ navigation }) {
    const { session, clearSession, loading, displayName } = useAuth();
    const { fetchBudgets, budgets } = useBudgets();
    const { isOffline } = useOffline();
    const [days, setDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [loadingReceipts, setLoadingReceipts] = useState(false);
    const [receipts, setReceipts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const generateLastDays = (numDays) => {
            const result = [];
            const today = new Date();

            for (let i = numDays - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);

                const label = d.toLocaleDateString('bg-BG', { weekday: 'short' }); // "Mon", "Tue"...
                const dateString = d.toISOString().split('T')[0]; // 'YYYY-MM-DD'

                result.push({ label, dateString });
            }
            return result;
        };

        const lastFiveDays = generateLastDays(5);
        setDays(lastFiveDays);
        setSelectedDate(lastFiveDays[lastFiveDays.length - 1].dateString); // по подразбиране днес
    }, []);

    // Функция за fetch на receipts при смяна на selectedDate
    useEffect(() => {
        if (!selectedDate || !session?.user) return;

        const fetchReceipts = async () => {
            if (isOffline) {
                setError('Няма интернет връзка');
                setReceipts([]);
                setLoadingReceipts(false);
                return;
            }

            setLoadingReceipts(true);
            setError(null);

            try {
                const response = await api.get(`/receipt/latest?date=${selectedDate}`);
                setReceipts(response.data.receipts || []);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoadingReceipts(false);
            }
        };

        fetchReceipts();
    }, [selectedDate, session, isOffline]);

    const handleRefresh = async () => {
        if (isOffline) {
            Toast.show({
                type: 'info',
                text1: 'Офлайн',
                text2: 'Обновяването изисква интернет.',
            });
            return;
        }

        setError(null);
        setLoadingReceipts(true);

        try {
            await fetchBudgets();
            if (selectedDate && session?.user) {
                const response = await api.get(`/receipt/latest?date=${selectedDate}`);
                setReceipts(response.data.receipts || []);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingReceipts(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (!isOffline) {
                await api.post('/auth/logout');
            }
        } catch (e) {
            console.warn('Logout API грешка:', e.message);
        } finally {
            await clearSession();
            Toast.show({
                type: 'success',
                text1: 'Успех',
                text2: 'Успешно отписване от системата',
            });
            navigation.replace('Home');
        }
    };

    // Ако още зареждаме сесията
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LottieView
                    source={loadingAnimation}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}
                />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // return (
    //     <StepGuide onFinish={() => {
    //         console.log('finish');
    //     }} />
    // )

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <View style={styles.containerHome}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.greeting}>Здравей{displayName && `, \n${displayName}`}</Text>
                                <Text style={styles.dateText}>Днес {new Date().toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                                <Ionicons name="refresh" size={20} color="#52a447" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.searchButton} onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={20} color="#FF2c2c" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
                                <Ionicons name="settings-outline" size={18} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.quckActionsWrapper}>
                            <View style={[styles.quickActionsRow, { marginBottom: 10 }]}>
                                <TouchableOpacity
                                    style={[styles.quickActionLarge, { backgroundColor: '#AD1457' }]}
                                    onPress={() => navigation.navigate('BrochureProductsSearchScreen')}
                                >
                                    <View style={styles.quickActionInner}>
                                        <Ionicons name="pricetags-outline" size={34} color="#fff" />
                                        <Text style={styles.quickActionText}>Промоции</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.quickActionLarge, { backgroundColor: '#E91E63' }]}
                                    onPress={() => navigation.navigate('BrochuresListScreen')}
                                >
                                    <View style={styles.quickActionInner}>
                                        <Ionicons name="newspaper-outline" size={34} color="#fff" />
                                        <Text style={styles.quickActionText}>Брошури</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.quickActionsRow, { marginBottom: 10 }]}>
                                <TouchableOpacity
                                    style={[styles.quickActionLarge, { backgroundColor: '#2196F3' }]}
                                    onPress={() => navigation.navigate('QrCardsListScreen')}
                                >
                                    <View style={styles.quickActionInner}>
                                        <Ionicons name="card-outline" size={34} color="#fff" />
                                        <Text style={styles.quickActionText}>Карти</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.quickActionLarge, { backgroundColor: '#00BCD4' }]}
                                    onPress={() => navigation.navigate('Scanner')}
                                >
                                    <View style={styles.quickActionInner}>
                                        <Ionicons name="qr-code-outline" size={34} color="#fff" />
                                        <Text style={styles.quickActionText}>Сканирай</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.quickActionsRow}>
                                <TouchableOpacity
                                    style={[styles.quickActionCompact, { backgroundColor: '#4CAF50' }]}
                                    onPress={() => navigation.navigate('ManualExpenseScreen')}
                                >
                                    <View style={styles.quickActionInner}>
                                        <Ionicons name="add-circle-outline" size={26} color="#fff" />
                                        <Text style={styles.quickActionCompactText}>Разход</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.quickActionCompact, { backgroundColor: '#9C27B0' }]}
                                    onPress={() => navigation.navigate('ShoppingListsScreen')}
                                >
                                    <View style={styles.quickActionInner}>
                                        <Ionicons name="list-outline" size={26} color="#fff" />
                                        <Text style={styles.quickActionCompactText}>Списъци</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.quickActionCompact, { backgroundColor: '#FF9800' }]}
                                    onPress={() => navigation.navigate('Charts')}
                                >
                                    <View style={styles.quickActionInner}>
                                        <Ionicons name="bar-chart-outline" size={26} color="#fff" />
                                        <Text style={styles.quickActionCompactText}>Графики</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>


                        {/* Days selector */}
                        <View style={styles.daysRow}>
                            {days.map((day) => {
                                const isSelected = day.dateString === selectedDate;
                                return (
                                    <TouchableOpacity
                                        key={day.dateString}
                                        onPress={() => setSelectedDate(day.dateString)}
                                        style={{
                                            padding: 10,
                                            borderRadius: 10,
                                            backgroundColor: isSelected ? '#6c63ff' : '#eee',
                                            alignItems: 'center',
                                            minWidth: 60,
                                        }}
                                    >
                                        <Text style={{ color: isSelected ? '#fff' : '#333' }}>{day.label}</Text>
                                        <Text style={{ fontWeight: 'bold', color: isSelected ? '#fff' : '#333' }}>
                                            {day.dateString.slice(8)}{/* само деня */}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.latestReceiptsContainer}>
                            {loadingReceipts && <ActivityIndicator size="large" color="#6c63ff" />}
                            {error && (
                                <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>
                                    {error}
                                </Text>
                            )}
                            {!loadingReceipts && !error && receipts.length === 0 && (
                                <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
                                    Няма намерени сметки за избраната дата.
                                </Text>
                            )}

                            {
                                !loadingReceipts && !error && <ScrollView>
                                    {receipts.map((r) => {
                                        const categoryName = r.stores?.store_categories?.name || 'Други';
                                        const meta = categoryMeta[categoryName] || categoryMeta['Други'];

                                        return (
                                            <View
                                                key={r.id}
                                                style={{
                                                    backgroundColor: meta.color,
                                                    marginBottom: 12,
                                                    borderRadius: 10,
                                                    padding: 12,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 12,
                                                }}
                                            >
                                                <Ionicons name={meta.icon} size={32} color="white" />

                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                                        {r.title || r.stores?.name || 'Без заглавие'}
                                                    </Text>
                                                    <Text style={{ color: 'white' }}>Сума: {r.amount.toFixed(2)} лв</Text>
                                                    {/* <Text style={{ color: 'white' }}>Дата: {r.date}</Text>
                                                    <Text style={{ color: 'white' }}>Час: {r.time}</Text> */}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            }
                        </View>

                        <View style={styles.budgetsTitleHeader}>
                            <Text style={styles.sectionTitle}>Твоите сметки</Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('BudgetActions')}
                                style={styles.addBudget}
                            >
                                <Ionicons name="add" size={16} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.plansRow}>
                            {budgets.map((budget, index) => {
                                return (
                                    <TouchableOpacity
                                        key={budget.id}
                                        style={[
                                            styles.planCard,
                                            { backgroundColor: getColorByIndex(index) }
                                        ]}
                                        onPress={() => navigation.navigate('BudgetDetails', { budget })}
                                    >
                                        <Text style={styles.planTitle}>{budget?.name}</Text>
                                        <Text style={styles.planDetails}>
                                            <Text style={styles.planDetailsText}>
                                                Създаден на: {new Date(budget?.created_at).toLocaleDateString('bg-BG', {
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}
                                            </Text>{"\n"}
                                            <Text style={styles.planDetailsText}>
                                                Последна активност: {new Date(budget?.lastReceiptDate).toLocaleDateString('bg-BG', {
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}
                                            </Text>{"\n"}
                                            <Text style={styles.planDetailsText}>
                                                Потребители: {budget?.userCount}
                                            </Text>{"\n"}
                                        </Text>
                                        <View style={styles.planTypeBadge}>
                                            <Text style={{ color: '#fff' }}>Обща сума: {budget?.totalAmount.toFixed(2)}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </ScrollView>

                </View>
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#333',
    },
    containerHome: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 44,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    profileImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '700',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
    searchButton: {
        padding: 4,
    },
    refreshButton: {
        padding: 4,
    },
    settingsButton: {
        padding: 4,
    },
    challengeCard: {
        backgroundColor: '#c4b8ff',
        borderRadius: 20,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 20,
        shadowColor: '#999',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 6,
    },
    challengeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    challengeSubtitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
    },
    challengeUsers: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    challengeAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: -10,
        borderWidth: 2,
        borderColor: '#fff',
    },
    moreUsers: {
        width: 40,
        height: 40,
        backgroundColor: '#6c63ff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 8,
        marginBottom: 20,
    },
    dayItem: {
        width: 48,
        height: 64,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayItemSelected: {
        backgroundColor: '#6c63ff',
    },
    dayLabel: {
        fontSize: 12,
        color: '#444',
        marginBottom: 4,
    },
    dayDate: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#444',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    plansRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // за хоризонтално разпределение
        marginHorizontal: 16, // за padding отстрани на контейнера
        marginBottom: 70
    },

    planCard: {
        width: '48%',        // почти половината ширина, за да има място за margin
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,    // вертикално разстояние между редовете
        backgroundColor: '#fff', // примерно, да се виждат по-добре картите
        justifyContent: 'space-between',
    },
    planCardOrange: {
        backgroundColor: '#ffcb8b',
    },
    planCardBlue: {
        backgroundColor: '#b4d4ff',
    },
    planTypeBadge: {
        backgroundColor: '#6c63ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        color: "#fff"
    },
    planDetails: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
        lineHeight: 20,
    },
    trainerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trainerImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 8,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
    },
    socialIcon: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#999',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#222',
        justifyContent: 'space-around',
        paddingVertical: 14,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
    },
    navIcon: {
        fontSize: 28,
        color: '#fff',
    },
    planDetailsText: {
        color: '#fff',
    },
    latestReceiptsContainer: {
        flex: 1,
        marginHorizontal: 16
    },
    budgetsTitleHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: 16,
        marginTop: 30,
        marginBottom: 20
    },
    addBudget: {
        backgroundColor: '#80EF80',
        width: 60,
        height: 30,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    graphicsCard: {
        backgroundColor: '#FFB400'
    },
    mainActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        gap: 10,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    quickActionLarge: {
        flex: 1,
        height: 108,
        marginHorizontal: 4,
        borderRadius: 14,
        padding: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    quickActionCompact: {
        flex: 1,
        height: 84,
        marginHorizontal: 4,
        borderRadius: 14,
        padding: 6,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    quickActionInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 6,
    },
    quickActionCompactText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
    },
    quckActionsWrapper: {
        marginBottom: 20,
    },
});
