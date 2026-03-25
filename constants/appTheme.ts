export const appTheme = {
  colors: {
    background: '#F8F9FF',
    surface: '#EFF4FF',
    surfaceRaised: '#FFFFFF',
    surfaceFloating: '#D2E4FF',
    surfaceGlass: 'rgba(248, 249, 255, 0.84)',
    primary: '#5148D8',
    primarySoft: 'rgba(81, 72, 216, 0.12)',
    primaryContainer: '#6F68F7',
    secondarySoft: '#E3E0F9',
    accent: '#625BEA',
    text: '#05345C',
    muted: '#3D618C',
    border: 'rgba(145, 180, 228, 0.2)',
    danger: '#C94B6A',
    overlay: 'rgba(248, 249, 255, 0.42)',
    white: '#FFFFFF',
  },
} as const;

export const elevatedCard = {
  shadowColor: '#05345C',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 32,
  elevation: 8,
};

export const glassCard = {
  shadowColor: '#05345C',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 24,
  elevation: 5,
};
