import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultLayout from '../components/DefaultLayout';
import Toast from 'react-native-toast-message';
import { ALL_TABS, DEFAULT_TAB_NAMES, MAX_BOTTOM_TABS } from '../utils/tabs';

const STORAGE_KEY = 'selectedTabs';

export default function SettingsScreen() {
  const [selectedTabs, setSelectedTabs] = useState(DEFAULT_TAB_NAMES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSelectedTabs();
  }, []);

  const loadSelectedTabs = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Пазим реда от ALL_TABS и ограничаваме до максимума
          const ordered = ALL_TABS.map((t) => t.name).filter((name) =>
            parsed.includes(name)
          );
          setSelectedTabs(
            ordered.length > 0
              ? ordered.slice(0, MAX_BOTTOM_TABS)
              : DEFAULT_TAB_NAMES
          );
          return;
        }
      }
      setSelectedTabs(DEFAULT_TAB_NAMES);
    } catch (e) {
      console.log('Грешка при зареждане на настройки', e);
      setSelectedTabs(DEFAULT_TAB_NAMES);
    }
  };

  const toggleTab = (tabName) => {
    setSelectedTabs((prev) => {
      if (prev.includes(tabName)) {
        if (prev.length === 1) {
          Toast.show({
            text1: 'Внимание',
            text2: 'Трябва да имаш поне един активен таб.',
            type: 'error',
          });
          return prev;
        }
        return prev.filter((t) => t !== tabName);
      }

      if (prev.length >= MAX_BOTTOM_TABS) {
        Toast.show({
          text1: 'Внимание',
          text2: `Можеш да избереш максимум ${MAX_BOTTOM_TABS} таба.`,
          type: 'error',
        });
        return prev;
      }

      // Запазваме реда според ALL_TABS
      const next = [...prev, tabName];
      return ALL_TABS.map((t) => t.name).filter((name) => next.includes(name));
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const ordered = ALL_TABS.map((t) => t.name)
        .filter((name) => selectedTabs.includes(name))
        .slice(0, MAX_BOTTOM_TABS);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));
      setSelectedTabs(ordered);
      Toast.show({
        text1: 'Успешно',
        text2: 'Настройките са запазени.',
        type: 'success',
      });
    } catch (e) {
      Toast.show({
        text1: 'Грешка',
        text2: 'Неуспешно записване.',
        type: 'error',
      });
      console.log('Грешка при запис на настройки', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DefaultLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Избери табове за долното меню (максимум {MAX_BOTTOM_TABS})
        </Text>

        {ALL_TABS.map((tab) => (
          <View key={tab.name} style={styles.row}>
            <Text style={styles.label}>{tab.label}</Text>
            <Switch
              value={selectedTabs.includes(tab.name)}
              onValueChange={() => toggleTab(tab.name)}
              trackColor={{ true: tab.backgroundColor }}
              thumbColor={tab.backgroundColor}
            />
          </View>
        ))}

        <Button
          title={saving ? 'Записване...' : 'Запази'}
          onPress={saveSettings}
          disabled={saving}
        />
      </ScrollView>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
  },
});
