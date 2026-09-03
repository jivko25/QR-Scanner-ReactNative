import AsyncStorage from '@react-native-async-storage/async-storage';

const QR_CARDS_CACHE_KEY = 'qr_cards_cache';

export async function getCachedQrCards() {
  try {
    const raw = await AsyncStorage.getItem(QR_CARDS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setCachedQrCards(cards) {
  try {
    const list = Array.isArray(cards) ? cards : [];
    await AsyncStorage.setItem(QR_CARDS_CACHE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Неуспешен запис на QR кеш:', e.message);
  }
}

export async function getCachedQrCardById(id) {
  const cards = await getCachedQrCards();
  return cards.find((card) => String(card.id) === String(id)) || null;
}

export async function upsertCachedQrCard(card) {
  if (!card?.id) return;
  const cards = await getCachedQrCards();
  const index = cards.findIndex((c) => String(c.id) === String(card.id));
  if (index >= 0) {
    cards[index] = { ...cards[index], ...card };
  } else {
    cards.unshift(card);
  }
  await setCachedQrCards(cards);
}

export async function removeCachedQrCard(id) {
  const cards = await getCachedQrCards();
  await setCachedQrCards(cards.filter((c) => String(c.id) !== String(id)));
}
