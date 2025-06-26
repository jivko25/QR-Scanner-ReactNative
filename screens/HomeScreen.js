import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getSession, clearSession } from '../utils/auth';

export default function HomeScreen({ navigation }) {
    const [displayName, setDisplayName] = useState(null);

    useEffect(() => {
        const loadSession = async () => {
            const session = await getSession();
            if (session?.user?.user_metadata?.display_name || session.email) {
                setDisplayName(session?.user?.user_metadata?.display_name || session.email);
            }
        };

        const unsubscribe = navigation.addListener('focus', loadSession);
        return unsubscribe;
    }, [navigation]);

    const handleLogout = async () => {
        await clearSession();
        setDisplayName(null);
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {displayName ? `Здравей, ${displayName}!` : 'Добре дошъл!'}
            </Text>

            {displayName ? (
                <>
                    <Button
                        title="Сканирай бележка"
                        onPress={() => navigation.navigate('Scanner')}
                    />
                    <View style={{ height: 20 }} />
                    <Button
                        title="Виж моите сметки"
                        onPress={() => navigation.navigate('Budgets')}
                    />
                    <View style={{ height: 20 }} />
                    <Button
                        title="Виж графики"
                        onPress={() => navigation.navigate('Charts')}
                    />
                    <View style={{ height: 20 }} />
                    <Button title="Изход" onPress={handleLogout} />
                </>
            ) : (
                <>
                    <Button
                        title="Регистрация"
                        onPress={() => navigation.navigate('Register')}
                    />
                    <View style={{ height: 20 }} />
                    <Button
                        title="Логване"
                        onPress={() => navigation.navigate('Login')}
                    />
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
