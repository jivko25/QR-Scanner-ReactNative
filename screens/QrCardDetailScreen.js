import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import DefaultLayout from '../components/DefaultLayout';
import { useOffline } from '../storage/offlineContext';
import {
  getCachedQrCardById,
  removeCachedQrCard,
  upsertCachedQrCard,
} from '../utils/qrCardsCache';

export default function QrCardDetailScreen({ route, navigation }) {
  const { id, card: initialCard } = route.params || {};
  const [card, setCard] = useState(initialCard || null);
  const [loading, setLoading] = useState(!initialCard?.qr_content);
  const qrRef = useRef(null);
  const { isOffline } = useOffline();

  useEffect(() => {
    let cancelled = false;

    const loadCard = async () => {
      let localCard = initialCard || null;

      if (!localCard?.qr_content) {
        localCard = await getCachedQrCardById(id);
      }

      if (!cancelled && localCard?.qr_content) {
        setCard(localCard);
        setLoading(false);
      }

      if (isOffline) {
        if (!cancelled) {
          if (!localCard?.qr_content) {
            setCard(localCard);
          }
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get(`/qr-card/${id}`);
        if (!cancelled && res.data) {
          setCard(res.data);
          await upsertCachedQrCard(res.data);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          const cached = localCard || (await getCachedQrCardById(id));
          if (cached) {
            setCard(cached);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Грешка',
              text2: 'Картата не може да бъде заредена.',
            });
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCard();

    return () => {
      cancelled = true;
    };
  }, [id, isOffline, initialCard]);

  const handleDelete = async () => {
    if (isOffline) {
      Toast.show({
        type: 'info',
        text1: 'Офлайн',
        text2: 'Изтриването изисква интернет.',
      });
      return;
    }

    Alert.alert('Сигурен ли си?', 'Тази карта ще бъде изтрита.', [
      { text: 'Отказ', style: 'cancel' },
      {
        text: 'Изтрий',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/qr-card/${id}`);
            await removeCachedQrCard(id);
            navigation.goBack();
          } catch (err) {
            console.error(err);
            Toast.show({
              type: 'error',
              text1: 'Грешка',
              text2: 'Неуспешно изтриване.',
            });
          }
        },
      },
    ]);
  };

  if (loading && !card) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (!card?.qr_content) {
    return (
      <DefaultLayout>
        <View style={styles.missing}>
          <Ionicons name="qr-code-outline" size={48} color="#ccc" />
          <Text style={styles.missingText}>
            Картата не е налична офлайн. Отвори я веднъж с интернет.
          </Text>
        </View>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <LinearGradient colors={['#e6f2e6', '#f0fbf0']} style={styles.gradientBackground}>
        <View style={styles.container}>
          <Text style={styles.title}>{card.name}</Text>
          <View style={styles.qrWrapper}>
            <QRCode value={card.qr_content} size={240} getRef={qrRef} />
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.deleteButton, isOffline && styles.deleteButtonDisabled]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>
                {isOffline ? 'Изтрий (нужен интернет)' : 'Изтрий'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    marginBottom: 30,
    fontWeight: '700',
    color: '#222',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  qrWrapper: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 24,
    borderRadius: 20,
    ...Platform.select({
      ios: {},
      android: {},
    }),
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    marginBottom: 40,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  missingText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    lineHeight: 22,
  },
});
