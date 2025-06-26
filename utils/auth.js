import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveSession = async (token, email, user) => {
    try {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
        console.error('Грешка при записване на сесия:', e);
    }
};

export const getSession = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const email = await AsyncStorage.getItem('email');
        const userJson = await AsyncStorage.getItem('user');

        let user = null;
        if (userJson) {
            user = JSON.parse(userJson); // <--- Парсваме го обратно в обект
        }

        return token && email && user ? { token, email, user } : null;
    } catch (e) {
        console.error('Грешка при взимане на сесия:', e);
        return null;
    }
};

export const clearSession = async () => {
    try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('email');
    } catch (e) {
        console.error('Грешка при изчистване на сесията:', e);
    }
};
