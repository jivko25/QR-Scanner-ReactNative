export const ALL_TABS = [
  {
    name: 'Home',
    label: 'Начало',
    icon: 'home-outline',
    backgroundColor: '#2196F3',
  },
  {
    name: 'BrochureProductsSearchScreen',
    label: 'Промоции',
    icon: 'pricetags-outline',
    backgroundColor: '#AD1457',
  },
  {
    name: 'BrochuresListScreen',
    label: 'Брошури',
    icon: 'newspaper-outline',
    backgroundColor: '#E91E63',
  },
  {
    name: 'ManualExpenseScreen',
    label: 'Добави разход',
    icon: 'add-circle-outline',
    backgroundColor: '#4CAF50',
  },
  {
    name: 'Charts',
    label: 'Графики',
    icon: 'bar-chart-outline',
    backgroundColor: '#FF9800',
  },
  {
    name: 'QrCardsListScreen',
    label: 'Карти',
    icon: 'card-outline',
    backgroundColor: '#2196F3',
  },
  {
    name: 'Scanner',
    label: 'Сканирай',
    icon: 'qr-code-outline',
    backgroundColor: '#00BCD4',
  },
  {
    name: 'ShoppingListsScreen',
    label: 'Списъци',
    icon: 'list-outline',
    backgroundColor: '#9C27B0',
  },
  {
    name: 'Settings',
    label: 'Настройки',
    icon: 'settings-outline',
    backgroundColor: '#FF5722',
  },
];

/** Дефолтни табове за нов потребител (макс. 4). */
export const DEFAULT_TAB_NAMES = [
  'Home',
  'BrochuresListScreen',
  'QrCardsListScreen',
  'Scanner',
];

export const MAX_BOTTOM_TABS = 4;

export function resolveTabs(selectedNames) {
  const names =
    Array.isArray(selectedNames) && selectedNames.length > 0
      ? selectedNames
      : DEFAULT_TAB_NAMES;

  const filtered = ALL_TABS.filter((tab) => names.includes(tab.name));
  return filtered.length > 0
    ? filtered.slice(0, MAX_BOTTOM_TABS)
    : ALL_TABS.filter((tab) => DEFAULT_TAB_NAMES.includes(tab.name));
}
