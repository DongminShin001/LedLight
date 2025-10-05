/**
 * App Theme Configuration
 * Centralized theme management with beautiful color schemes
 */

export const themes = {
  dark: {
    name: 'Dark',
    colors: {
      primary: '#00ff88',
      secondary: '#ff6b6b',
      background: '#1a1a1a',
      surface: '#2d2d2d',
      card: '#333333',
      text: '#ffffff',
      textSecondary: '#999999',
      border: '#444444',
      success: '#00ff88',
      warning: '#ffa726',
      error: '#f44336',
      info: '#2196f3',
    },
    gradients: {
      primary: ['#00ff88', '#00cc6a'],
      secondary: ['#ff6b6b', '#ff5252'],
      background: ['#1a1a1a', '#2d2d2d', '#1a1a1a'],
      surface: ['#2d2d2d', '#333333'],
      card: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },
  light: {
    name: 'Light',
    colors: {
      primary: '#00cc6a',
      secondary: '#ff5252',
      background: '#ffffff',
      surface: '#f5f5f5',
      card: '#ffffff',
      text: '#333333',
      textSecondary: '#666666',
      border: '#e0e0e0',
      success: '#00cc6a',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    },
    gradients: {
      primary: ['#00cc6a', '#00a854'],
      secondary: ['#ff5252', '#ff1744'],
      background: ['#ffffff', '#f5f5f5', '#ffffff'],
      surface: ['#f5f5f5', '#ffffff'],
      card: ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)'],
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
    },
  },
  neon: {
    name: 'Neon',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      card: '#2a2a2a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#333333',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      info: '#00ffff',
    },
    gradients: {
      primary: ['#00ffff', '#0080ff'],
      secondary: ['#ff00ff', '#ff0080'],
      background: ['#0a0a0a', '#1a1a1a', '#0a0a0a'],
      surface: ['#1a1a1a', '#2a2a2a'],
      card: ['rgba(0,255,255,0.1)', 'rgba(0,255,255,0.05)'],
    },
    shadows: {
      small: {
        shadowColor: '#00ffff',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#00ffff',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#00ffff',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      background: '#2c1810',
      surface: '#3d2817',
      card: '#4d321f',
      text: '#ffffff',
      textSecondary: '#d4c4b7',
      border: '#5d3f2f',
      success: '#ff6b35',
      warning: '#f7931e',
      error: '#ff4444',
      info: '#ff6b35',
    },
    gradients: {
      primary: ['#ff6b35', '#f7931e'],
      secondary: ['#f7931e', '#ffcc02'],
      background: ['#2c1810', '#3d2817', '#2c1810'],
      surface: ['#3d2817', '#4d321f'],
      card: ['rgba(255,107,53,0.1)', 'rgba(255,107,53,0.05)'],
    },
    shadows: {
      small: {
        shadowColor: '#ff6b35',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#ff6b35',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#ff6b35',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

export const getTheme = (themeName = 'dark') => {
  return themes[themeName] || themes.dark;
};

export const getCurrentTheme = () => {
  // This would typically get the theme from a context or storage
  return getTheme('dark');
};

export default {
  themes,
  typography,
  spacing,
  borderRadius,
  animations,
  getTheme,
  getCurrentTheme,
};
