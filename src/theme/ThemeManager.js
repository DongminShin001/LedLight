import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/Logger';

class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.listeners = [];
    this.themes = {
      dark: {
        name: 'Dark Mode',
        description: 'Classic dark theme for comfortable viewing',
        colors: {
          primary: '#00ff88',
          secondary: '#4ecdc4',
          accent: '#ff6b6b',
          background: '#0f0f0f',
          surface: '#1a1a1a',
          card: '#1a1a1a',
          text: '#ffffff',
          textSecondary: '#aaaaaa',
          textMuted: '#666666',
          border: '#333333',
          shadow: '#000000',
          success: '#00ff88',
          warning: '#ffa500',
          error: '#ff4444',
          info: '#4facfe',
        },
        gradients: {
          primary: ['#00ff88', '#00cc6a'],
          secondary: ['#4ecdc4', '#44a08d'],
          accent: ['#ff6b6b', '#ff8e8e'],
          surface: ['#1a1a1a', '#2a2a2a'],
        },
        typography: {
          fontFamily: 'System',
          fontSize: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
          },
          fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
          },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          xxxl: 32,
        },
        borderRadius: {
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          full: 999,
        },
        shadows: {
          sm: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          },
          md: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
          lg: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 6},
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          },
        },
      },
      light: {
        name: 'Light Mode',
        description: 'Clean light theme for bright environments',
        colors: {
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF3B30',
          background: '#FFFFFF',
          surface: '#F2F2F7',
          card: '#FFFFFF',
          text: '#000000',
          textSecondary: '#666666',
          textMuted: '#999999',
          border: '#E5E5EA',
          shadow: '#000000',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        },
        gradients: {
          primary: ['#007AFF', '#0056CC'],
          secondary: ['#34C759', '#28A745'],
          accent: ['#FF3B30', '#CC2E26'],
          surface: ['#F2F2F7', '#E5E5EA'],
        },
        typography: {
          fontFamily: 'System',
          fontSize: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
          },
          fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
          },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          xxxl: 32,
        },
        borderRadius: {
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          full: 999,
        },
        shadows: {
          sm: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          },
          md: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 4,
          },
          lg: {
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          },
        },
      },
      neon: {
        name: 'Neon Cyber',
        description: 'Futuristic neon theme with cyberpunk vibes',
        colors: {
          primary: '#00FFFF',
          secondary: '#FF00FF',
          accent: '#FFFF00',
          background: '#0A0A0A',
          surface: '#1A0A1A',
          card: '#1A0A1A',
          text: '#FFFFFF',
          textSecondary: '#CCCCCC',
          textMuted: '#888888',
          border: '#330033',
          shadow: '#000000',
          success: '#00FF00',
          warning: '#FF8000',
          error: '#FF0040',
          info: '#0080FF',
        },
        gradients: {
          primary: ['#00FFFF', '#0080FF'],
          secondary: ['#FF00FF', '#FF0080'],
          accent: ['#FFFF00', '#FF8000'],
          surface: ['#1A0A1A', '#2A0A2A'],
        },
        typography: {
          fontFamily: 'System',
          fontSize: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
          },
          fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
          },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          xxxl: 32,
        },
        borderRadius: {
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          full: 999,
        },
        shadows: {
          sm: {
            shadowColor: '#00FFFF',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          },
          md: {
            shadowColor: '#00FFFF',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
          },
          lg: {
            shadowColor: '#00FFFF',
            shadowOffset: {width: 0, height: 6},
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 12,
          },
        },
      },
      ocean: {
        name: 'Ocean Breeze',
        description: 'Calming ocean-inspired theme',
        colors: {
          primary: '#4ECDC4',
          secondary: '#45B7D1',
          accent: '#96CEB4',
          background: '#0A1A2A',
          surface: '#1A2A3A',
          card: '#1A2A3A',
          text: '#FFFFFF',
          textSecondary: '#B8D4E3',
          textMuted: '#7A9CC6',
          border: '#2A3A4A',
          shadow: '#000000',
          success: '#4ECDC4',
          warning: '#FECA57',
          error: '#FF6B6B',
          info: '#45B7D1',
        },
        gradients: {
          primary: ['#4ECDC4', '#44A08D'],
          secondary: ['#45B7D1', '#96C93D'],
          accent: ['#96CEB4', '#FECA57'],
          surface: ['#1A2A3A', '#2A3A4A'],
        },
        typography: {
          fontFamily: 'System',
          fontSize: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
          },
          fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
          },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          xxxl: 32,
        },
        borderRadius: {
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          full: 999,
        },
        shadows: {
          sm: {
            shadowColor: '#4ECDC4',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          },
          md: {
            shadowColor: '#4ECDC4',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
          lg: {
            shadowColor: '#4ECDC4',
            shadowOffset: {width: 0, height: 6},
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          },
        },
      },
      sunset: {
        name: 'Sunset Glow',
        description: 'Warm sunset colors for cozy lighting',
        colors: {
          primary: '#FF6B6B',
          secondary: '#FFA726',
          accent: '#FFCC02',
          background: '#1A0A0A',
          surface: '#2A1A0A',
          card: '#2A1A0A',
          text: '#FFFFFF',
          textSecondary: '#FFE0B2',
          textMuted: '#CC8A65',
          border: '#4A2A0A',
          shadow: '#000000',
          success: '#66BB6A',
          warning: '#FFA726',
          error: '#EF5350',
          info: '#42A5F5',
        },
        gradients: {
          primary: ['#FF6B6B', '#FF8E8E'],
          secondary: ['#FFA726', '#FFB74D'],
          accent: ['#FFCC02', '#FFD54F'],
          surface: ['#2A1A0A', '#3A2A0A'],
        },
        typography: {
          fontFamily: 'System',
          fontSize: {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
            xxl: 24,
            xxxl: 32,
          },
          fontWeight: {
            light: '300',
            normal: '400',
            medium: '500',
            semibold: '600',
            bold: '700',
            extrabold: '800',
          },
        },
        spacing: {
          xs: 4,
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          xxxl: 32,
        },
        borderRadius: {
          sm: 8,
          md: 12,
          lg: 16,
          xl: 20,
          xxl: 24,
          full: 999,
        },
        shadows: {
          sm: {
            shadowColor: '#FF6B6B',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          },
          md: {
            shadowColor: '#FF6B6B',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          },
          lg: {
            shadowColor: '#FF6B6B',
            shadowOffset: {width: 0, height: 6},
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          },
        },
      },
    };
  }

  // Get current theme
  getCurrentTheme() {
    return this.themes[this.currentTheme];
  }

  // Get theme by name
  getTheme(themeName) {
    return this.themes[themeName] || this.themes.dark;
  }

  // Set theme
  async setTheme(themeName) {
    if (!this.themes[themeName]) {
      logger.error('Theme not found', {themeName});
      return false;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = themeName;

    try {
      await AsyncStorage.setItem('selectedTheme', themeName);
      logger.info('Theme changed', {from: previousTheme, to: themeName});
      
      // Notify listeners
      this.notifyListeners('themeChanged', {
        previousTheme,
        currentTheme: themeName,
        theme: this.themes[themeName]
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to save theme', error);
      this.currentTheme = previousTheme; // Revert on error
      return false;
    }
  }

  // Load saved theme
  async loadSavedTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && this.themes[savedTheme]) {
        this.currentTheme = savedTheme;
        logger.info('Theme loaded from storage', {theme: savedTheme});
      }
    } catch (error) {
      logger.error('Failed to load saved theme', error);
    }
  }

  // Get all available themes
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      id: key,
      name: this.themes[key].name,
      description: this.themes[key].description,
      colors: this.themes[key].colors,
      gradients: this.themes[key].gradients,
    }));
  }

  // Add theme listener
  addListener(event, callback) {
    this.listeners.push({event, callback});
  }

  // Remove theme listener
  removeListener(event, callback) {
    this.listeners = this.listeners.filter(
      listener => !(listener.event === event && listener.callback === callback)
    );
  }

  // Notify listeners
  notifyListeners(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => {
        try {
          listener.callback(data);
        } catch (error) {
          logger.error('Error in theme listener', error);
        }
      });
  }

  // Get theme-aware styles
  getStyles(styleFunction) {
    const theme = this.getCurrentTheme();
    return styleFunction(theme);
  }

  // Auto theme switching based on time
  async enableAutoTheme() {
    const hour = new Date().getHours();
    let suggestedTheme = 'dark';

    if (hour >= 6 && hour < 12) {
      suggestedTheme = 'light'; // Morning
    } else if (hour >= 12 && hour < 18) {
      suggestedTheme = 'ocean'; // Afternoon
    } else if (hour >= 18 && hour < 22) {
      suggestedTheme = 'sunset'; // Evening
    } else {
      suggestedTheme = 'dark'; // Night
    }

    try {
      await AsyncStorage.setItem('autoTheme', 'true');
      await this.setTheme(suggestedTheme);
      logger.info('Auto theme applied', {theme: suggestedTheme, hour});
    } catch (error) {
      logger.error('Failed to apply auto theme', error);
    }
  }

  // Disable auto theme
  async disableAutoTheme() {
    try {
      await AsyncStorage.removeItem('autoTheme');
      logger.info('Auto theme disabled');
    } catch (error) {
      logger.error('Failed to disable auto theme', error);
    }
  }

  // Check if auto theme is enabled
  async isAutoThemeEnabled() {
    try {
      const autoTheme = await AsyncStorage.getItem('autoTheme');
      return autoTheme === 'true';
    } catch (error) {
      logger.error('Failed to check auto theme status', error);
      return false;
    }
  }
}

export default new ThemeManager();
