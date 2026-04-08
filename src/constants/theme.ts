export const COLORS = {
  // Base palette — near-black charcoal
  background: '#080808',
  card: '#131313',
  cardLight: '#1C1C1C',
  surface: '#0F0F0F',

  // Single accent — neon green (only for interactive elements + live indicators)
  accent: '#00FF87',
  accentDark: '#00CC6A',
  accentGlow: 'rgba(0, 255, 135, 0.12)',

  // Semantic
  odds: '#00FF87',          // odds values = accent
  oddsSelected: '#00FF87',
  loss: '#FF453A',
  info: '#0A84FF',
  warning: '#FF9F0A',
  live: '#FF453A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#666666',
  textMuted: '#2E2E2E',

  // Borders
  border: '#1C1C1C',
  borderBright: '#2C2C2C',

  // Chat bubbles
  userBubble: 'rgba(0, 255, 135, 0.06)',      // subtle green-tinted glass
  userBubbleBorder: 'rgba(0, 255, 135, 0.25)',
  assistantBubble: '#131313',                  // dark for widget messages
  assistantBubbleWhite: '#FFFFFF',             // white for text-only messages
  assistantText: '#FFFFFF',
  assistantTextDark: '#0A0A0A',               // dark text on white bubble
  inputBg: '#131313',

  // Status
  win: '#00FF87',
  draw: '#FF9F0A',
  lossResult: '#FF453A',
  pending: '#FF9F0A',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  title: 28,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 22,
  xxl: 28,
  full: 999,
} as const;

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 6,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;

export const GRADIENT_COLORS = {
  card: ['#1C1C1C', '#111111'] as const,
  accent: ['#00FF87', '#00CC6A'] as const,
  header: ['#131313', '#080808'] as const,
  live: ['#FF453A', '#CC2A20'] as const,
} as const;
