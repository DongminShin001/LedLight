import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/Logger';

/**
 * Base Theme class defining the interface and common functionality
 */
export class Theme {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.colors = {};
    this.gradients = {};
    this.typography = {};
    this.spacing = {};
    this.borderRadius = {};
    this.shadows = {};
  }

  /**
   * Abstract method to be implemented by subclasses
   */
  initializeTheme() {
    throw new Error('initializeTheme() must be implemented by subclass');
  }

  /**
   * Get theme identifier
   */
  getId() {
    return this.name.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Get theme display name
   */
  getDisplayName() {
    return this.name;
  }

  /**
   * Get theme description
   */
  getDescription() {
    return this.description;
  }

  /**
   * Get primary color
   */
  getPrimaryColor() {
    return this.colors.primary;
  }

  /**
   * Get background color
   */
  getBackgroundColor() {
    return this.colors.background;
  }

  /**
   * Get text color
   */
  getTextColor() {
    return this.colors.text;
  }

  /**
   * Get primary gradient colors
   */
  getPrimaryGradient() {
    return this.gradients.primary;
  }

  /**
   * Get shadow configuration by size
   */
  getShadow(size = 'md') {
    return this.shadows[size] || this.shadows.md;
  }

  /**
   * Get spacing value by size
   */
  getSpacing(size = 'md') {
    return this.spacing[size] || this.spacing.md;
  }

  /**
   * Get border radius by size
   */
  getBorderRadius(size = 'md') {
    return this.borderRadius[size] || this.borderRadius.md;
  }

  /**
   * Check if theme is dark
   */
  isDark() {
    return this.colors.background === '#0f0f0f' || 
           this.colors.background === '#0A0A0A' ||
           this.colors.background === '#0A1A2A' ||
           this.colors.background === '#1A0A0A' ||
           this.colors.background === '#2A1A0A';
  }

  /**
   * Check if theme is light
   */
  isLight() {
    return this.colors.background === '#FFFFFF' || 
           this.colors.background === '#F2F2F7';
  }

  /**
   * Get theme metadata
   */
  getMetadata() {
    return {
      id: this.getId(),
      name: this.getDisplayName(),
      description: this.getDescription(),
      isDark: this.isDark(),
      isLight: this.isLight(),
      primaryColor: this.getPrimaryColor(),
      backgroundColor: this.getBackgroundColor(),
    };
  }

  /**
   * Clone theme with modifications
   */
  clone(modifications = {}) {
    const clonedTheme = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    
    // Apply modifications
    Object.keys(modifications).forEach(key => {
      if (clonedTheme[key] && typeof clonedTheme[key] === 'object') {
        clonedTheme[key] = { ...clonedTheme[key], ...modifications[key] };
      } else {
        clonedTheme[key] = modifications[key];
      }
    });

    return clonedTheme;
  }

  /**
   * Validate theme structure
   */
  validate() {
    const required = ['colors', 'gradients', 'typography', 'spacing', 'borderRadius', 'shadows'];
    const missing = required.filter(prop => !this[prop] || Object.keys(this[prop]).length === 0);
    
    if (missing.length > 0) {
      throw new Error(`Theme validation failed. Missing properties: ${missing.join(', ')}`);
    }
    
    return true;
  }
}

/**
 * Dark Theme implementation
 */
export class DarkTheme extends Theme {
  constructor() {
    super('Dark Mode', 'Classic dark theme for comfortable viewing');
    this.initializeTheme();
  }

  initializeTheme() {
    this.colors = {
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
    };

    this.gradients = {
      primary: ['#00ff88', '#00cc6a'],
      secondary: ['#4ecdc4', '#44a08d'],
      accent: ['#ff6b6b', '#ff8e8e'],
      surface: ['#1a1a1a', '#2a2a2a'],
    };

    this.typography = {
      fontFamily: 'System',
      fontSize: {
        xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32,
      },
      fontWeight: {
        light: '300', normal: '400', medium: '500',
        semibold: '600', bold: '700', extrabold: '800',
      },
    };

    this.spacing = {
      xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
    };

    this.borderRadius = {
      sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
    };

    this.shadows = {
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
    };
  }
}

/**
 * Light Theme implementation
 */
export class LightTheme extends Theme {
  constructor() {
    super('Light Mode', 'Clean light theme for bright environments');
    this.initializeTheme();
  }

  initializeTheme() {
    this.colors = {
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
    };

    this.gradients = {
      primary: ['#007AFF', '#0056CC'],
      secondary: ['#34C759', '#28A745'],
      accent: ['#FF3B30', '#CC2E26'],
      surface: ['#F2F2F7', '#E5E5EA'],
    };

    this.typography = {
      fontFamily: 'System',
      fontSize: {
        xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32,
      },
      fontWeight: {
        light: '300', normal: '400', medium: '500',
        semibold: '600', bold: '700', extrabold: '800',
      },
    };

    this.spacing = {
      xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
    };

    this.borderRadius = {
      sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
    };

    this.shadows = {
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
    };
  }
}

/**
 * Neon Theme implementation
 */
export class NeonTheme extends Theme {
  constructor() {
    super('Neon Cyber', 'Futuristic neon theme with cyberpunk vibes');
    this.initializeTheme();
  }

  initializeTheme() {
    this.colors = {
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
    };

    this.gradients = {
      primary: ['#00FFFF', '#0080FF'],
      secondary: ['#FF00FF', '#FF0080'],
      accent: ['#FFFF00', '#FF8000'],
      surface: ['#1A0A1A', '#2A0A2A'],
    };

    this.typography = {
      fontFamily: 'System',
      fontSize: {
        xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32,
      },
      fontWeight: {
        light: '300', normal: '400', medium: '500',
        semibold: '600', bold: '700', extrabold: '800',
      },
    };

    this.spacing = {
      xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
    };

    this.borderRadius = {
      sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
    };

    this.shadows = {
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
    };
  }
}

/**
 * Ocean Theme implementation
 */
export class OceanTheme extends Theme {
  constructor() {
    super('Ocean Breeze', 'Calming ocean-inspired theme');
    this.initializeTheme();
  }

  initializeTheme() {
    this.colors = {
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
    };

    this.gradients = {
      primary: ['#4ECDC4', '#44A08D'],
      secondary: ['#45B7D1', '#96C93D'],
      accent: ['#96CEB4', '#FECA57'],
      surface: ['#1A2A3A', '#2A3A4A'],
    };

    this.typography = {
      fontFamily: 'System',
      fontSize: {
        xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32,
      },
      fontWeight: {
        light: '300', normal: '400', medium: '500',
        semibold: '600', bold: '700', extrabold: '800',
      },
    };

    this.spacing = {
      xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
    };

    this.borderRadius = {
      sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
    };

    this.shadows = {
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
    };
  }
}

/**
 * Sunset Theme implementation
 */
export class SunsetTheme extends Theme {
  constructor() {
    super('Sunset Glow', 'Warm sunset colors for cozy lighting');
    this.initializeTheme();
  }

  initializeTheme() {
    this.colors = {
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
    };

    this.gradients = {
      primary: ['#FF6B6B', '#FF8E8E'],
      secondary: ['#FFA726', '#FFB74D'],
      accent: ['#FFCC02', '#FFD54F'],
      surface: ['#2A1A0A', '#3A2A0A'],
    };

    this.typography = {
      fontFamily: 'System',
      fontSize: {
        xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32,
      },
      fontWeight: {
        light: '300', normal: '400', medium: '500',
        semibold: '600', bold: '700', extrabold: '800',
      },
    };

    this.spacing = {
      xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
    };

    this.borderRadius = {
      sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999,
    };

    this.shadows = {
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
    };
  }
}
