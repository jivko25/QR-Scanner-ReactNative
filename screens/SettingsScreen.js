import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DefaultLayout from '../components/DefaultLayout';
import Toast from 'react-native-toast-message';
import { ALL_TABS } from '../utils/tabs';

const STORAGE_KEY = 'selectedTabs';

export default function SettingsScreen() {
  const [selectedTabs, setSelectedTabs] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSelectedTabs();
  }, []);

  const loadSelectedTabs = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSelectedTabs(JSON.parse(saved));
      } else {
        // По подразбиране - всички табове избрани
        setSelectedTabs(ALL_TABS.map((t) => t.name));
      }
    } catch (e) {
      console.log('Грешка при зареждане на настройки', e);
    }
  };

  const toggleTab = (tabName) => {
    setSelectedTabs((prev) => {
      if (prev.includes(tabName)) {
        // Ако изключваме, винаги позволяваме, но поне 1 таб трябва да остане избран
        if (prev.length === 1) {
          Toast.show({
            text1: 'Внимание',
            text2: 'Трябва да имаш поне един активен таб.',
            type: 'error',
          });
          return prev;
        }
        return prev.filter((t) => t !== tabName);
      } else {
        // Ако включваме - проверяваме дали не превишаваме лимита
        if (prev.length >= 4) {
          console.log('prev', prev);
          
          Toast.show({
            text1: 'Внимание',
            text2: 'Можеш да избереш максимум 4 таба.',
            type: 'error',
          });
          return prev;
        }
        return [...prev, tabName];
      }
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTabs));
      Toast.show({
        text1: 'Успешно',
        text2: 'Настройките са запазени. Рестартирай приложението, за да видиш промените.',
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
        <Text style={styles.title}>Избери табове за долното меню (максимум 4)</Text>

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

        <Button title={saving ? 'Записване...' : 'Запази'} onPress={saveSettings} disabled={saving} />
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
