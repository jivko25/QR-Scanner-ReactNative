import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveSession = async (token, email) => {
    try {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('email', email);
        // await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
        console.error('Грешка при записване на сесия:', e);
    }
};

export const getSession = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const email = await AsyncStorage.getItem('email');
        // const userJson = await AsyncStorage.getItem('user');

        // let user = null;
        // if (userJson) {
        //     user = JSON.parse(userJson); // <--- Парсваме го обратно в обект
        // }

        return token && email ? { token, email } : null;
    } catch (e) {
        console.error('Грешка при взимане на сесия:', e);
        return null;
    }
};

export const clearSession = async () => {
    try {
        await AsyncStorage.clear();
    } catch (e) {
        console.error('Грешка при изчистване на сесията:', e);
    }
};

