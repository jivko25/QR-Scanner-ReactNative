import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { resolveTabs } from '../utils/tabs';

const STORAGE_KEY = 'selectedTabs';

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const active = route.name;

  const [tabs, setTabs] = useState(() => resolveTabs());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadTabs = async () => {
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          const selectedNames = saved ? JSON.parse(saved) : null;
          if (!cancelled) {
            setTabs(resolveTabs(selectedNames));
          }
        } catch (error) {
          console.log('Грешка при зареждане на табове:', error);
          if (!cancelled) {
            setTabs(resolveTabs());
          }
        }
      };

      loadTabs();

      return () => {
        cancelled = true;
      };
    }, [])
  );

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
          <Text
            style={[styles.label, active === tab.name && styles.activeLabel]}
            numberOfLines={1}
          >
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
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  activeLabel: {
    color: '#007aff',
    fontWeight: '600',
  },
});
