const brightColors = [
    '#FF5A5F', // червено-розово
    '#FFB400', // жълто-оранжево
    '#00CECB', // тюркоазено
    '#FF6F61', // коралово
    '#1E90FF', // синьо
];

const contrastColors = [
    '#007AFF', // синьо (iOS стил)
    '#34C759', // зелено
    '#AF52DE', // лилаво
    '#5856D6', // индиго
];

export function getColorByIndex(index, type = 'primary') {
    const primary = brightColors[index % brightColors.length];
    const secondary = contrastColors[index % contrastColors.length];
    return type === 'primary' ? primary : secondary;
}