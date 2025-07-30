import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ALL_TABS } from '../utils/tabs';

const STORAGE_KEY = 'selectedTabs';

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const active = route.name;

  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const loadTabs = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const selectedTabs = JSON.parse(saved);
          // Филтрираме всички табове по избраните имена
          const filtered = ALL_TABS.filter((tab) => selectedTabs.includes(tab.name));
          if (filtered.length) {
            setTabs(filtered);
            return;
          }
        }
        // Ако няма запазени настройки, ползваме всички по default
        setTabs(ALL_TABS);
      } catch (error) {
        console.log('Грешка при зареждане на табове:', error);
        setTabs(ALL_TABS);
      }
    };

    loadTabs();
  }, []);

  if (tabs.length === 0) {
    return null; // или loader
  }

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => navigation.navigate(tab.name)}
          style={styles.tab}
        >
          <Ionicons
            name={tab.icon}
            size={22}
            color={active === tab.name ? '#007aff' : '#888'}
          />
          <Text style={[styles.label, active === tab.name && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 6,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  activeLabel: {
    color: '#007aff',
    fontWeight: '600',
  },
});
