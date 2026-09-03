import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOffline } from '../storage/offlineContext';

export default function OfflineBanner({ message }) {
  const { isOffline } = useOffline();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
      <Text style={styles.text}>
        {message || 'Офлайн режим — някои функции са недостъпни'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#546E7A',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
