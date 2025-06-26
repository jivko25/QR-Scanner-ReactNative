import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://save-money-snowy.vercel.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Променлива, която ще държи навигационната функция
let navigateFunction = null;

// Функция за задаване на навигационната функция
export const setNavigator = (navigator) => {
  navigateFunction = navigator;
};

// Добавяме интерцептор за всяка заявка, за да слагаме токена
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Добавяме интерцептор за отговор, за да прихващаме грешки със сесията
api.interceptors.response.use(
  (response) => response, // При успешен отговор, просто го връщаме
  async (error) => {
    // Проверяваме дали грешката е 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized - Сесията е невалидна/изтекла.');
      
      // Изчистваме запазения токен и потребителски данни
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user'); // Ако пазиш и други данни за потребителя
      
      // Ако имаме достъп до навигационната функция, пренасочваме
      if (navigateFunction) {
        navigateFunction('Login'); // Навигирай към екрана за вход
        console.log('Пренасочване към Login екрана...');
      } else {
        console.warn('Няма достъп до навигационната функция. Потребителят трябва да рестартира приложението.');
        // Можеш да покажеш Alert, ако не можеш да навигираш
      }
    }
    return Promise.reject(error); // Продължаваме с отхвърлянето на грешката
  }
);

export default api;