import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';

export default function SettingsScreen() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkForUpdate();
  }, []);

  const checkForUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      setIsUpdateAvailable(update.isAvailable);
    } catch (e) {
      console.log('Грешка при проверка за ъпдейт:', e);
    } finally {
      setChecking(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const update = await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (e) {
      console.log('Грешка при ъпдейт:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Настройки</Text>
      <Button
        title={
          checking
            ? 'Проверка...'
            : isUpdateAvailable
            ? 'Инсталирай новата версия'
            : 'Няма наличен ъпдейт'
        }
        onPress={handleUpdate}
        disabled={!isUpdateAvailable || checking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
