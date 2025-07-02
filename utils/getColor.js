export const brightColors = [
    '#FF5A5F', // ярко червено-розово
    '#FFB400', // жълто-оранжево
    '#00CECB', // ярко тюркоазено
    '#FF6F61', // коралово
    '#1E90FF', // ярко синьо
];

export function getColorByIndex(index) {
    return brightColors[index % brightColors.length];
}