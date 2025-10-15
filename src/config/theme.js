// App theme configuration
const theme = {
  colors: {
    // Primary warm brown/beige palette
    primary: {
      50: '#fdf7f0',
      100: '#f7e8d8',
      200: '#f0d4b3',
      300: '#e7bb84',
      400: '#dd9f53',
      500: '#d18843', // Main brand color
      600: '#c47238',
      700: '#a35b31',
      800: '#834a2f',
      900: '#6b3e29',
    },

    // Secondary beige tones
    secondary: {
      50: '#faf8f5',
      100: '#f5f0e8',
      200: '#e8ddc7',
      300: '#d9c59f',
      400: '#c8a876',
      500: '#bc955c',
      600: '#a8844f',
      700: '#8d6d43',
      800: '#73583a',
      900: '#5e4931',
    },

    // Neutral grays
    gray: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      300: '#d6d3d1',
      400: '#a8a29e',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
      900: '#1c1917',
    },

    // Status colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',

    // Background colors
    background: '#fafaf9',
    surface: '#ffffff',

    // Text colors
    text: {
      primary: '#1c1917',
      secondary: '#44403c',
      muted: '#78716c',
      inverse: '#ffffff',
    },
  },

  // Card styling
  card: {
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  // Typography
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    semiBold: {
      fontFamily: 'System',
      fontWeight: '600',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  // Animation timings
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

export default theme;
