import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const active = route.name;

  const tabs = [
    { name: 'Home', label: 'Начало', icon: 'home-outline' },
    { name: 'Scanner', label: 'Сканиране', icon: 'receipt-outline' },
    { name: 'Charts', label: 'Графики', icon: 'bar-chart-outline' },
  ];

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
