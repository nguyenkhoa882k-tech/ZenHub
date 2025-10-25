import { useState, useCallback } from 'react';

/**
 * Theme Service for ZenHub App
 * Provides different color themes for different app sections
 * Converted to function-based with React hooks
 */

// Theme definitions
const THEMES = {
  FOCUS: {
    name: 'Focus',
    primary: '#FF6B6B',
    secondary: '#FF8E8E',
    light: '#FFF5F5',
    gradient: ['#FF6B6B', '#FF8E8E', '#FFA8A8'],
    accent: '#FF4757',
    dark: '#E55656',
    shadow: 'rgba(255, 107, 107, 0.3)',
    background: '#FFF5F5',
    text: '#2D3436',
    icon: '🍅',
  },
  SHORT_BREAK: {
    name: 'Short Break',
    primary: '#4ECDC4',
    secondary: '#7BDAD5',
    light: '#F0FDFC',
    gradient: ['#4ECDC4', '#7BDAD5', '#9EE5E1'],
    accent: '#00D2D3',
    dark: '#3BB3AB',
    shadow: 'rgba(78, 205, 196, 0.3)',
    background: '#F0FDFC',
    text: '#2D3436',
    icon: '☕',
  },
  LONG_BREAK: {
    name: 'Long Break',
    primary: '#FFE66D',
    secondary: '#FFED8A',
    light: '#FFFEF5',
    gradient: ['#FFE66D', '#FFED8A', '#FFF2A3'],
    accent: '#FFC048',
    dark: '#E6CF5C',
    shadow: 'rgba(255, 230, 109, 0.3)',
    background: '#FFFEF5',
    text: '#2D3436',
    icon: '🛋️',
  },
  DARK: {
    name: 'Dark Mode',
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    light: '#2D3436',
    gradient: ['#6C5CE7', '#A29BFE', '#C7C7FF'],
    accent: '#5F3DC4',
    dark: '#5A4FCF',
    shadow: 'rgba(108, 92, 231, 0.3)',
    background: '#2D3436',
    text: '#FFFFFF',
    icon: '🌙',
  },
  NATURE: {
    name: 'Nature',
    primary: '#00B894',
    secondary: '#55C4A1',
    light: '#F0FDFA',
    gradient: ['#00B894', '#55C4A1', '#7DD3B8'],
    accent: '#00A085',
    dark: '#009B7D',
    shadow: 'rgba(0, 184, 148, 0.3)',
    background: '#F0FDFA',
    text: '#2D3436',
    icon: '🌿',
  },
};

// Custom hook for Theme functionality
export const useThemeService = () => {
  const [currentTheme, setCurrentTheme] = useState('FOCUS');

  // Get theme by session type
  const getThemeBySession = useCallback(sessionType => {
    switch (sessionType) {
      case 'focus':
        return THEMES.FOCUS;
      case 'short_break':
        return THEMES.SHORT_BREAK;
      case 'long_break':
        return THEMES.LONG_BREAK;
      default:
        return THEMES.FOCUS;
    }
  }, []);

  // Get current theme
  const getCurrentTheme = useCallback(() => {
    return THEMES[currentTheme] || THEMES.FOCUS;
  }, [currentTheme]);

  // Set theme
  const setTheme = useCallback(themeName => {
    if (THEMES[themeName]) {
      setCurrentTheme(themeName);
    }
  }, []);

  // Get all available themes
  const getAllThemes = useCallback(() => {
    return Object.keys(THEMES).map(key => ({
      key,
      ...THEMES[key],
    }));
  }, []);

  // Get theme colors for session
  const getSessionColors = useCallback(
    sessionType => {
      return getThemeBySession(sessionType);
    },
    [getThemeBySession],
  );

  return {
    currentTheme,
    getCurrentTheme,
    setTheme,
    getAllThemes,
    getSessionColors,
    getThemeBySession,
  };
};

// Legacy singleton for backward compatibility
const createThemeService = () => {
  let currentTheme = 'FOCUS';

  const getThemeBySession = sessionType => {
    switch (sessionType) {
      case 'focus':
        return THEMES.FOCUS;
      case 'short_break':
        return THEMES.SHORT_BREAK;
      case 'long_break':
        return THEMES.LONG_BREAK;
      default:
        return THEMES.FOCUS;
    }
  };

  const getCurrentTheme = () => {
    return THEMES[currentTheme] || THEMES.FOCUS;
  };

  const setTheme = themeName => {
    if (THEMES[themeName]) {
      currentTheme = themeName;
    }
  };

  const getAllThemes = () => {
    return Object.keys(THEMES).map(key => ({
      key,
      ...THEMES[key],
    }));
  };

  const getSessionColors = sessionType => {
    return getThemeBySession(sessionType);
  };

  return {
    getCurrentTheme,
    setTheme,
    getAllThemes,
    getSessionColors,
    getThemeBySession,
  };
};

// Export singleton instance for backward compatibility
const themeService = createThemeService();
export default themeService;
