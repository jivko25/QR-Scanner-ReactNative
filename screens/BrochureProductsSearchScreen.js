import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import useDebouncedValue from '../hooks/useDebouncedBalue';
import { useOffline } from '../storage/offlineContext';

const LIMIT = 50;
const STORES = [
    { label: 'Всички', value: null },
    { label: 'Lidl', value: 'Lidl' },
    { label: 'Kaufland', value: 'Kaufland' },
    { label: 'Billa', value: 'Billa' },
];

function formatPrice(price) {
    if (price == null || Number.isNaN(Number(price))) return '—';
    return `${Number(price).toFixed(2)} лв.`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
        return new Date(dateStr).toLocaleDateString('bg-BG');
    } catch {
        return dateStr;
    }
}

function storeAccent(storeName = '') {
    const name = storeName.toLowerCase();
    if (name.includes('kaufland')) return '#E60000';
    if (name.includes('lidl')) return '#003087';
    if (name.includes('billa')) return '#D40C1B';
    return '#607D8B';
}

export default function BrochureProductsSearchScreen() {
    const navigation = useNavigation();
    const { isOffline } = useOffline();
    const [query, setQuery] = useState('');
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);

    const debouncedQuery = useDebouncedValue(query.trim(), 450);

    const fetchProducts = useCallback(async ({ q, storeFilter, nextOffset = 0, append = false }) => {
        if (!q) {
            setProducts([]);
            setCount(0);
            setOffset(0);
            setHasSearched(false);
            setError(null);
            return;
        }

        if (isOffline) {
            setError('Няма интернет връзка');
            setHasSearched(true);
            if (!append) {
                setProducts([]);
                setCount(0);
            }
            Toast.show({
                type: 'info',
                text1: 'Офлайн',
                text2: 'Търсенето на промоции изисква интернет.',
            });
            return;
        }

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const params = {
                q,
                limit: LIMIT,
                offset: nextOffset,
            };
            if (storeFilter) {
                params.store = storeFilter;
            }
            
            const res = await api.get('/brochure-products', { params });
            const list = res.data.products || [];
            const total = res.data.count ?? list.length;
            
            setProducts((prev) => (append ? [...prev, ...list] : list));
            setCount(total);
            setOffset(nextOffset);
            setHasSearched(true);
        } catch (err) {
            const message =
                err?.response?.data?.error ||
                err?.response?.data?.details ||
                'Грешка при търсене на промоции.';
            setError(message);
            if (!append) {
                setProducts([]);
                setCount(0);
            }
            Toast.show({
                type: 'error',
                text1: 'Грешка при търсене',
                text2: message,
            });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [isOffline]);

    useEffect(() => {
        fetchProducts({ q: debouncedQuery, storeFilter: store, nextOffset: 0, append: false });
    }, [debouncedQuery, store, fetchProducts]);

    const handleSubmit = () => {
        Keyboard.dismiss();
        fetchProducts({ q: query.trim(), storeFilter: store, nextOffset: 0, append: false });
    };

    const handleLoadMore = () => {
        if (loading || loadingMore || !debouncedQuery) return;
        if (products.length >= count) return;
        fetchProducts({
            q: debouncedQuery,
            storeFilter: store,
            nextOffset: offset + LIMIT,
            append: true,
        });
    };

    const renderItem = ({ item }) => {
        const accent = storeAccent(item.store_name);

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                    navigation.navigate('BrochureProductDetailScreen', { id: item.id, product: item })
                }
            >
                <View style={styles.cardTop}>
                    {item.screenshot_url ? (
                        <Image
                            source={{ uri: item.screenshot_url }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                            <Ionicons name="image-outline" size={32} color="#bbb" />
                        </View>
                    )}

                    <View style={styles.cardInfo}>
                        <View style={[styles.storeBadge, { backgroundColor: accent }]}>
                            <Text style={styles.storeBadgeText}>{item.store_name || '—'}</Text>
                        </View>
                        <Text style={styles.name} numberOfLines={3}>
                            {item.name || 'Без име'}
                        </Text>
                        <Text style={styles.price}>{formatPrice(item.price)}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    {item.brand ? (
                        <Text style={styles.metaText}>
                            <Text style={styles.metaLabel}>Марка: </Text>
                            {item.brand}
                        </Text>
                    ) : null}
                    {item.quantity ? (
                        <Text style={styles.metaText}>
                            <Text style={styles.metaLabel}>Количество: </Text>
                            {item.quantity}
                        </Text>
                    ) : null}
                    {item.product_type ? (
                        <Text style={styles.metaText}>
                            <Text style={styles.metaLabel}>Тип: </Text>
                            {item.product_type}
                        </Text>
                    ) : null}
                    <Text style={styles.metaText}>
                        <Text style={styles.metaLabel}>Валидна до: </Text>
                        {formatDate(item.valid_until)}
                    </Text>
                    {item.note ? (
                        <View style={styles.noteBadge}>
                            <Text style={styles.noteText}>{item.note}</Text>
                        </View>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    const listEmpty = () => {
        if (loading) return null;
        if (!hasSearched && !debouncedQuery) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyTitle}>Търси промоции</Text>
                    <Text style={styles.emptySubtitle}>
                        Въведи ключова дума, напр. „кафе“, за да видиш текущите оферти от брошурите.
                    </Text>
                </View>
            );
        }
        if (error) {
            return (
                <View style={styles.emptyState}>
                    <Ionicons name="alert-circle-outline" size={48} color="#E53935" />
                    <Text style={styles.emptyTitle}>Нещо се обърка</Text>
                    <Text style={styles.emptySubtitle}>{error}</Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyState}>
                <Ionicons name="pricetag-outline" size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>Няма резултати</Text>
                <Text style={styles.emptySubtitle}>
                    Няма активни промоции за „{debouncedQuery}“. Опитай с друга дума.
                </Text>
            </View>
        );
    };

    return (
        <DefaultLayout>
            <View style={styles.container}>
                <Text style={styles.screenTitle}>Промоции от брошури</Text>
                <TouchableOpacity
                    style={styles.brochuresLink}
                    onPress={() => navigation.navigate('BrochuresListScreen')}
                >
                    <Ionicons name="newspaper-outline" size={16} color="#007AFF" />
                    <Text style={styles.brochuresLinkText}>Към PDF брошурите</Text>
                </TouchableOpacity>

                <View style={styles.searchRow}>
                    <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Търси продукт, напр. кафе"
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search"
                        onSubmitEditing={handleSubmit}
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                            <Ionicons name="close-circle" size={20} color="#aaa" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.searchButton} onPress={handleSubmit}>
                        <Text style={styles.searchButtonText}>Търси</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.storeFilters}>
                    {STORES.map((s) => {
                        const active = store === s.value;
                        return (
                            <TouchableOpacity
                                key={s.label}
                                style={[styles.storeChip, active && styles.storeChipActive]}
                                onPress={() => setStore(s.value)}
                            >
                                <Text style={[styles.storeChipText, active && styles.storeChipTextActive]}>
                                    {s.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {hasSearched && !loading && !error ? (
                    <Text style={styles.resultCount}>
                        {count} {count === 1 ? 'резултат' : 'резултата'}
                        {store ? ` · ${store}` : ''}
                    </Text>
                ) : null}

                {loading && products.length === 0 ? (
                    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={listEmpty}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.4}
                        keyboardShouldPersistTaps="handled"
                        ListFooterComponent={
                            loadingMore ? (
                                <ActivityIndicator style={{ marginVertical: 16 }} color="#007AFF" />
                            ) : products.length > 0 && products.length < count ? (
                                <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore}>
                                    <Text style={styles.loadMoreText}>Зареди още</Text>
                                </TouchableOpacity>
                            ) : null
                        }
                    />
                )}
            </View>
        </DefaultLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    brochuresLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    brochuresLinkText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 14,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#222',
        paddingVertical: 8,
    },
    searchButton: {
        marginLeft: 8,
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    storeFilters: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    storeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#eee',
    },
    storeChipActive: {
        backgroundColor: '#007AFF',
    },
    storeChipText: {
        color: '#444',
        fontWeight: '600',
        fontSize: 13,
    },
    storeChipTextActive: {
        color: '#fff',
    },
    resultCount: {
        fontSize: 13,
        color: '#666',
        marginBottom: 6,
        paddingHorizontal: 4,
    },
    listContent: {
        paddingBottom: 24,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    cardTop: {
        flexDirection: 'row',
    },
    thumbnail: {
        width: 88,
        height: 88,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
    },
    thumbnailPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'flex-start',
    },
    storeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 6,
    },
    storeBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: '#222',
        marginBottom: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1B5E20',
    },
    metaRow: {
        marginTop: 10,
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#555',
    },
    metaLabel: {
        fontWeight: '600',
        color: '#777',
    },
    noteBadge: {
        alignSelf: 'flex-start',
        marginTop: 4,
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    noteText: {
        color: '#E65100',
        fontWeight: '700',
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 48,
    },
    emptyTitle: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '700',
        color: '#444',
    },
    emptySubtitle: {
        marginTop: 6,
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 20,
    },
    loadMoreBtn: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginVertical: 8,
    },
    loadMoreText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});
