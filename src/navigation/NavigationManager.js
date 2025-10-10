import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import logger from '../utils/Logger';

/**
 * Base Navigation Manager class
 * Implements Strategy Pattern for different navigation types
 */
export class NavigationManager {
  constructor() {
    this.navigators = new Map();
    this.screenConfigs = new Map();
    this.theme = null;
  }

  /**
   * Set theme for navigation styling
   * @param {Theme} theme - Theme instance
   */
  setTheme(theme) {
    this.theme = theme;
    logger.info('Navigation theme updated', {themeId: theme.getId()});
  }

  /**
   * Register a navigator
   * @param {string} name - Navigator name
   * @param {Object} navigator - Navigator configuration
   */
  registerNavigator(name, navigator) {
    this.navigators.set(name, navigator);
    logger.info('Navigator registered', {name});
  }

  /**
   * Register screen configuration
   * @param {string} screenName - Screen name
   * @param {Object} config - Screen configuration
   */
  registerScreen(screenName, config) {
    this.screenConfigs.set(screenName, config);
    logger.info('Screen registered', {screenName});
  }

  /**
   * Get navigator by name
   * @param {string} name - Navigator name
   * @returns {Object} Navigator configuration
   */
  getNavigator(name) {
    return this.navigators.get(name);
  }

  /**
   * Get screen configuration
   * @param {string} screenName - Screen name
   * @returns {Object} Screen configuration
   */
  getScreenConfig(screenName) {
    return this.screenConfigs.get(screenName);
  }

  /**
   * Get all registered navigators
   * @returns {Map} Map of navigators
   */
  getAllNavigators() {
    return this.navigators;
  }

  /**
   * Get all registered screens
   * @returns {Map} Map of screen configurations
   */
  getAllScreens() {
    return this.screenConfigs;
  }

  /**
   * Clear all navigators and screens
   */
  clear() {
    this.navigators.clear();
    this.screenConfigs.clear();
    logger.info('Navigation manager cleared');
  }
}

/**
 * Stack Navigator Manager
 * Manages stack-based navigation
 */
export class StackNavigatorManager extends NavigationManager {
  constructor() {
    super();
    this.stackNavigator = createStackNavigator();
  }

  /**
   * Create stack navigator component
   * @param {Array} screens - Array of screen configurations
   * @returns {React.Component} Stack navigator component
   */
  createStackNavigator(screens = []) {
    const Stack = this.stackNavigator;

    return () => (
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: this.theme?.colors.surface || '#1a1a1a',
          },
          headerTintColor: this.theme?.colors.text || '#fff',
          headerTitleStyle: {
            fontWeight: '700',
          },
        }}>
        {screens.map(screen => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={screen.options || {headerShown: false}}
          />
        ))}
      </Stack.Navigator>
    );
  }

  /**
   * Add screen to stack
   * @param {string} name - Screen name
   * @param {React.Component} component - Screen component
   * @param {Object} options - Screen options
   */
  addScreen(name, component, options = {}) {
    this.registerScreen(name, {
      name,
      component,
      options,
      type: 'stack',
    });
  }
}

/**
 * Tab Navigator Manager
 * Manages tab-based navigation
 */
export class TabNavigatorManager extends NavigationManager {
  constructor() {
    super();
    this.tabNavigator = createBottomTabNavigator();
  }

  /**
   * Create tab navigator component
   * @param {Array} tabs - Array of tab configurations
   * @returns {React.Component} Tab navigator component
   */
  createTabNavigator(tabs = []) {
    const Tab = this.tabNavigator;

    return () => (
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            const tabConfig = tabs.find(tab => tab.name === route.name);
            const iconName = tabConfig?.icon || 'circle';
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: this.theme?.colors.primary || '#00ff88',
          tabBarInactiveTintColor: this.theme?.colors.textMuted || 'gray',
          tabBarStyle: {
            backgroundColor: this.theme?.colors.surface || '#1a1a1a',
            borderTopColor: this.theme?.colors.border || '#333',
            ...this.theme?.shadows?.sm,
          },
          headerStyle: {
            backgroundColor: this.theme?.colors.surface || '#1a1a1a',
          },
          headerTintColor: this.theme?.colors.text || '#fff',
          headerTitleStyle: {
            fontWeight: '700',
          },
        })}>
        {tabs.map(tab => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={tab.options || {title: tab.title}}
          />
        ))}
      </Tab.Navigator>
    );
  }

  /**
   * Add tab to navigator
   * @param {string} name - Tab name
   * @param {React.Component} component - Tab component
   * @param {string} icon - Icon name
   * @param {Object} options - Tab options
   */
  addTab(name, component, icon, options = {}) {
    this.registerScreen(name, {
      name,
      component,
      icon,
      options,
      type: 'tab',
    });
  }
}

/**
 * Navigation Factory
 * Creates appropriate navigator managers
 */
export class NavigationFactory {
  static createManager(type) {
    switch (type) {
      case 'stack':
        return new StackNavigatorManager();
      case 'tab':
        return new TabNavigatorManager();
      default:
        throw new Error(`Unknown navigator type: ${type}`);
    }
  }

  static createStackManager() {
    return new StackNavigatorManager();
  }

  static createTabManager() {
    return new TabNavigatorManager();
  }
}

/**
 * Navigation Observer
 * Observes navigation events
 */
export class NavigationObserver {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Add navigation listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove navigation listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeListener(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  notify(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('Error in navigation listener', error);
        }
      });
    }
  }
}
