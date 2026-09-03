import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import FullScreenImageViewer from '../components/FullScreenImageViewer';

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

export default function BrochureProductDetailScreen({ route }) {
    const { id, product: initialProduct } = route.params || {};
    const [product, setProduct] = useState(initialProduct || null);
    const [loading, setLoading] = useState(!initialProduct);

    useEffect(() => {
        if (!id) return;

        let cancelled = false;
        setLoading(true);

        api.get(`/brochure-products/${id}`)
            .then((res) => {
                if (!cancelled) {
                    setProduct(res.data.product);
                }
            })
            .catch((err) => {
                const message =
                    err?.response?.data?.error || 'Продуктът не е намерен.';
                if (!cancelled) {
                    Toast.show({
                        type: 'error',
                        text1: 'Грешка',
                        text2: message,
                    });
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading && !product) {
        return (
            <DefaultLayout>
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
            </DefaultLayout>
        );
    }

    if (!product) {
        return (
            <DefaultLayout>
                <View style={styles.centered}>
                    <Text style={styles.errorText}>Продуктът не е намерен.</Text>
                </View>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <ScrollView contentContainerStyle={styles.container}>
                {product.screenshot_url ? (
                    <View style={styles.imageWrap}>
                        <FullScreenImageViewer
                            uri={product.screenshot_url}
                            thumbnailStyle={styles.image}
                        />
                    </View>
                ) : (
                    <View style={[styles.imagePlaceholder]}>
                        <Text style={styles.placeholderText}>Няма снимка</Text>
                    </View>
                )}

                <Text style={styles.name}>{product.name || 'Без име'}</Text>
                <Text style={styles.price}>{formatPrice(product.price)}</Text>

                <View style={styles.section}>
                    <Row label="Магазин" value={product.store_name} />
                    <Row label="Марка" value={product.brand} />
                    <Row label="Тип" value={product.product_type} />
                    <Row label="Количество" value={product.quantity} />
                    <Row label="Валидна до" value={formatDate(product.valid_until)} />
                    <Row label="Забележка" value={product.note} />
                    {product.page_number != null ? (
                        <Row label="Страница" value={String(product.page_number)} />
                    ) : null}
                </View>
            </ScrollView>
        </DefaultLayout>
    );
}

function Row({ label, value }) {
    if (!value) return null;
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
    },
    imageWrap: {
        height: 220,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 320,
        height: 220,
        borderRadius: 12,
    },
    imagePlaceholder: {
        width: '100%',
        height: 220,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderRadius: 12,
    },
    placeholderText: {
        color: '#999',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: '#222',
        marginBottom: 8,
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1B5E20',
        marginBottom: 16,
    },
    section: {
        backgroundColor: '#fafafa',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    row: {
        marginBottom: 10,
    },
    rowLabel: {
        fontSize: 12,
        color: '#888',
        fontWeight: '600',
        marginBottom: 2,
    },
    rowValue: {
        fontSize: 15,
        color: '#222',
    },
});
