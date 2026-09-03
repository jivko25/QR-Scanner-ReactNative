import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import { getColorByIndex } from '../utils/getColor';
import { getCachedQrCards, setCachedQrCards } from '../utils/qrCardsCache';
import { useOffline } from '../storage/offlineContext';

export default function QrCardsListScreen() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const navigation = useNavigation();
  const { isOffline } = useOffline();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadCards = async () => {
        setLoading(true);

        // Първо показваме кеша (бързо / офлайн)
        const cached = await getCachedQrCards();
        if (!cancelled && cached.length > 0) {
          setCards(cached);
          setFromCache(true);
          setLoading(false);
        }

        if (isOffline) {
          if (!cancelled) {
            setCards(cached);
            setFromCache(true);
            setLoading(false);
          }
          return;
        }

        try {
          const res = await api.get('/qr-card');
          const list = Array.isArray(res.data) ? res.data : [];
          const previous = await getCachedQrCards();

          // Запазваме qr_content от предишен кеш, ако списъкът не го връща
          let merged = list.map((item) => {
            const existing = previous.find((c) => String(c.id) === String(item.id));
            return existing ? { ...existing, ...item } : item;
          });

          if (!cancelled) {
            setCards(merged);
            setFromCache(false);
          }
          await setCachedQrCards(merged);

          // Prefetch на липсващи qr_content за офлайн ползване
          const missing = merged.filter((c) => !c.qr_content);
          if (missing.length > 0) {
            const details = await Promise.all(
              missing.map((c) =>
                api
                  .get(`/qr-card/${c.id}`)
                  .then((r) => r.data)
                  .catch(() => null)
              )
            );
            const byId = new Map(
              details.filter(Boolean).map((d) => [String(d.id), d])
            );
            merged = merged.map((c) => byId.get(String(c.id)) || c);
            await setCachedQrCards(merged);
            if (!cancelled) setCards(merged);
          }
        } catch (err) {
          console.error(err);
          if (!cancelled) {
            const fallback = cached.length > 0 ? cached : await getCachedQrCards();
            setCards(fallback);
            setFromCache(true);
            if (fallback.length === 0) {
              Toast.show({
                type: 'error',
                text1: 'Няма връзка',
                text2: 'Неуспешно зареждане на картите.',
              });
            }
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      loadCards();

      return () => {
        cancelled = true;
      };
    }, [isOffline])
  );

  const openCreate = () => {
    if (isOffline) {
      Toast.show({
        type: 'info',
        text1: 'Офлайн',
        text2: 'Добавянето на карта изисква интернет.',
      });
      return;
    }
    navigation.navigate('QrCardCreateScreen');
  };

  if (loading && cards.length === 0) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <DefaultLayout>
      <View style={styles.container}>
        {(isOffline || fromCache) && (
          <View style={styles.cacheHint}>
            <Ionicons name="cloud-offline-outline" size={14} color="#546E7A" />
            <Text style={styles.cacheHintText}>
              {isOffline
                ? 'Показват се запазени карти (офлайн)'
                : 'Заредени от кеш / последна синхронизация'}
            </Text>
          </View>
        )}

        <FlatList
          data={cards}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="qr-code-outline" size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>Няма карти</Text>
              <Text style={styles.emptySubtitle}>
                {isOffline
                  ? 'Офлайн си и няма запазени карти. Отвори ги веднъж с интернет.'
                  : 'Добави карта, за да я ползваш и офлайн.'}
              </Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: getColorByIndex(index) }]}
              onPress={() =>
                navigation.navigate('QrCardDetailScreen', {
                  id: item.id,
                  card: item,
                })
              }
            >
              <View style={styles.cardContent}>
                <Ionicons
                  name="qr-code-outline"
                  size={32}
                  color="#fff"
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>Натисни за детайли</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity
          style={[styles.addButton, isOffline && styles.addButtonDisabled]}
          onPress={openCreate}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.addButtonText}>
            {isOffline ? 'Нова карта (нужен интернет)' : 'Нова карта'}
          </Text>
        </TouchableOpacity>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    position: 'relative',
  },
  cacheHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cacheHintText: {
    fontSize: 12,
    color: '#546E7A',
    fontWeight: '600',
  },
  card: {
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#f2f2f2',
    opacity: 0.85,
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
  addButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
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
});
