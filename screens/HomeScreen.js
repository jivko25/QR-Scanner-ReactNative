import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../storage/authContext';
import { useBudgets } from '../storage/budgetsContext';

export default function HomeScreen({ navigation }) {
    const { session, loadSessionFromStorage, clearSession, loading, error } = useAuth();
    const [checkedSession, setCheckedSession] = useState(true);
    const { fetchBudgets, loading: loadingBudgets, error: errorBudgets } = useBudgets();

    useEffect(() => {
        const initialize = async () => {
          await loadSessionFromStorage(); // независимо дали има session в момента
          setCheckedSession(true);
        };
      
        initialize();
      }, []);

    // useEffect(() => {
    //     if (session?.token && checkedSession) {
    //       fetchBudgets();
    //     }
    //   }, [session?.token, checkedSession]);

    const handleLogout = async () => {
        await clearSession();
        navigation.replace('Login');
    };

    // Ако още зареждаме сесията (от AsyncStorage или бекенд)
    if (loadingBudgets || loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#000" />
                <Text>{session?.refresh_token || 'no'}</Text>
                <Text style={{ marginTop: 20, fontSize: 16 }}>Зареждане...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text>{errorBudgets}</Text>
            <Text style={styles.title}>
                {session?.user?.email ? `Здравей, ${session.user.email}!` : 'Добре дошъл!'}
            </Text>

            {session?.user ? (
                <>
                    <Button title="Сканирай бележка" onPress={() => navigation.navigate('Scanner')} />
                    <View style={{ height: 20 }} />
                    <Button title="Виж моите сметки" onPress={() => navigation.navigate('Budgets')} />
                    <View style={{ height: 20 }} />
                    <Button title="Виж графики" onPress={() => navigation.navigate('Charts')} />
                    <View style={{ height: 20 }} />
                    <Button title="Изход" onPress={handleLogout} />
                </>
            ) : (
                <>
                    <Button title="Регистрация" onPress={() => navigation.navigate('Register')} />
                    <View style={{ height: 20 }} />
                    <Button title="Логване" onPress={() => navigation.navigate('Login')} />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 40,
    },
});
