import React, {Component} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import managers
import ThemeManager from '../theme/ThemeManager';
import {NavigationFactory, TabNavigatorManager, StackNavigatorManager} from './NavigationManager';
import {ScreenManager, ScreenLifecycleManager, ScreenFactory} from './ScreenManager';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import EffectsScreen from '../screens/EffectsScreen';
import PresetsScreen from '../screens/PresetsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AdvancedEffectsScreen from '../screens/AdvancedEffectsScreen';
import MusicReactiveScreen from '../screens/MusicReactiveScreen';
import SchedulingScreen from '../screens/SchedulingScreen';
import DeviceManagementScreen from '../screens/DeviceManagementScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ThemeSelectionScreen from '../screens/ThemeSelectionScreen';
import EnhancedColorPickerScreen from '../screens/EnhancedColorPickerScreen';
import EnhancedTextDisplayScreen from '../screens/EnhancedTextDisplayScreen';
import DirectionalEffectsScreen from '../screens/DirectionalEffectsScreen';
import LegalAgreementScreen, {checkLegalAcceptance} from '../screens/LegalAgreementScreen';
import OnboardingTutorial, {shouldShowOnboarding} from '../components/OnboardingTutorial';
import Toast, {ToastManager} from '../components/Toast';

import logger from '../utils/Logger';

/**
 * Main App Class - OOP Design
 * Manages application lifecycle, navigation, and theming
 */
export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      error: null,
      theme: null,
      isInitialized: false,
      legalAgreementsAccepted: false,
      showOnboarding: false,
      toastVisible: false,
      toastMessage: '',
      toastType: 'info',
    };

    // Initialize managers
    this.themeManager = ThemeManager;
    this.navigationManager = NavigationFactory.createTabManager();
    this.stackManager = NavigationFactory.createStackManager();
    this.screenManager = new ScreenManager();
    this.lifecycleManager = new ScreenLifecycleManager();

    // Bind methods
    this.initializeApp = this.initializeApp.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleError = this.handleError.bind(this);
    this.renderLoadingScreen = this.renderLoadingScreen.bind(this);
    this.renderErrorScreen = this.renderErrorScreen.bind(this);
    this.renderMainApp = this.renderMainApp.bind(this);
  }

  /**
   * Component did mount
   */
  async componentDidMount() {
    try {
      // Set up toast manager
      ToastManager.show = (message, type) => {
        this.setState({
          toastVisible: true,
          toastMessage: message,
          toastType: type,
        });
      };

      await this.initializeApp();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Initialize application
   */
  async initializeApp() {
    try {
      logger.info('Initializing application...');

      // Check if legal agreements have been accepted
      const agreementsAccepted = await this.checkLegalAgreements();

      // Initialize theme manager
      await this.themeManager.initialize();
      const currentTheme = this.themeManager.getCurrentTheme();
      
      // Set theme for navigation managers
      this.navigationManager.setTheme(currentTheme);
      this.stackManager.setTheme(currentTheme);

      // Register screens
      this.registerScreens();

      // Set up theme change listener
      this.setupThemeListener();

      // Check if onboarding should be shown
      const needsOnboarding = await shouldShowOnboarding();

      // Update state
      this.setState({
        isLoading: false,
        theme: currentTheme,
        isInitialized: true,
        legalAgreementsAccepted: agreementsAccepted,
        showOnboarding: agreementsAccepted && needsOnboarding, // Only show if legal accepted
      });

      logger.info('Application initialized successfully', {
        themeId: currentTheme.getId(),
        screenCount: this.screenManager.getAllScreens().size,
        agreementsAccepted,
        needsOnboarding,
      });
    } catch (error) {
      logger.error('Failed to initialize application', error);
      throw error;
    }
  }

  /**
   * Register all application screens
   */
  registerScreens() {
    // Register main screens
    this.screenManager.registerScreen('HomeMain', HomeScreen, {
      title: 'SmartLED Controller',
      type: 'stack',
    });

    this.screenManager.registerScreen('ColorPicker', EnhancedColorPickerScreen, {
      title: 'Color Picker',
      type: 'stack',
    });

    this.screenManager.registerScreen('TextDisplay', EnhancedTextDisplayScreen, {
      title: 'Text Display',
      type: 'stack',
    });

    this.screenManager.registerScreen('AdvancedEffects', AdvancedEffectsScreen, {
      title: 'Advanced Effects',
      type: 'stack',
    });

    this.screenManager.registerScreen('MusicReactive', MusicReactiveScreen, {
      title: 'Music Reactive',
      type: 'stack',
    });

    this.screenManager.registerScreen('Scheduling', SchedulingScreen, {
      title: 'Scheduling',
      type: 'stack',
    });

    this.screenManager.registerScreen('DeviceManagement', DeviceManagementScreen, {
      title: 'Device Management',
      type: 'stack',
    });

    this.screenManager.registerScreen('Analytics', AnalyticsScreen, {
      title: 'Analytics',
      type: 'stack',
    });

    this.screenManager.registerScreen('ThemeSelection', ThemeSelectionScreen, {
      title: 'Themes',
      type: 'stack',
    });

    // Register tab screens
    this.screenManager.registerScreen('Effects', EffectsScreen, {
      title: 'LED Effects',
      icon: 'auto-fix-high',
      type: 'tab',
    });

    this.screenManager.registerScreen('Presets', PresetsScreen, {
      title: 'Presets',
      icon: 'bookmark',
      type: 'tab',
    });

    this.screenManager.registerScreen('Settings', SettingsScreen, {
      title: 'Settings',
      icon: 'settings',
      type: 'tab',
    });

    logger.info('Screens registered', {
      count: this.screenManager.getAllScreens().size,
    });
  }

  /**
   * Set up theme change listener
   */
  setupThemeListener() {
    const themeObserver = {
      onThemeChanged: themeData => {
        this.handleThemeChange(themeData.theme);
      },
    };

    this.themeManager.addObserver(themeObserver);
  }

  /**
   * Check if legal agreements have been accepted
   */
  async checkLegalAgreements() {
    try {
      const hasAccepted = await checkLegalAcceptance();
      logger.info('Legal agreement status checked', {hasAccepted});
      return hasAccepted;
    } catch (error) {
      logger.error('Failed to check legal agreements', error);
      return false;
    }
  }

  /**
   * Handle legal agreement acceptance
   */
  handleLegalAgreementAccept = (agreementData) => {
    logger.info('Legal agreements accepted', agreementData);
    this.setState({legalAgreementsAccepted: true});
  };

  /**
   * Handle legal agreement decline
   */
  handleLegalAgreementDecline = () => {
    logger.info('Legal agreements declined');
    // In a real app, you might want to exit the app or show a different screen
    this.setState({legalAgreementsAccepted: false});
  };

  /**
   * Handle theme change
   * @param {Theme} newTheme - New theme instance
   */
  handleThemeChange(newTheme) {
    // Update navigation managers with new theme
    this.navigationManager.setTheme(newTheme);
    this.stackManager.setTheme(newTheme);

    // Update state
    this.setState({
      theme: newTheme,
    });

    logger.info('Theme changed in App', {
      themeId: newTheme.getId(),
      themeName: newTheme.getDisplayName(),
    });
  }

  /**
   * Handle application errors
   * @param {Error} error - Error instance
   */
  handleError(error) {
    logger.error('Application error', error);
    this.setState({
      isLoading: false,
      error: error.message,
    });
  }

  /**
   * Create home stack navigator
   * @returns {React.Component} Stack navigator component
   */
  createHomeStack() {
    const stackScreens = [
      {name: 'HomeMain', component: HomeScreen, options: {headerShown: false}},
      {name: 'ColorPicker', component: EnhancedColorPickerScreen, options: {headerShown: false}},
      {name: 'TextDisplay', component: EnhancedTextDisplayScreen, options: {headerShown: false}},
      {name: 'DirectionalEffects', component: DirectionalEffectsScreen, options: {headerShown: false}},
      {name: 'AdvancedEffects', component: AdvancedEffectsScreen, options: {headerShown: false}},
      {name: 'MusicReactive', component: MusicReactiveScreen, options: {headerShown: false}},
      {name: 'Scheduling', component: SchedulingScreen, options: {headerShown: false}},
      {name: 'DeviceManagement', component: DeviceManagementScreen, options: {headerShown: false}},
      {name: 'Analytics', component: AnalyticsScreen, options: {headerShown: false}},
      {name: 'ThemeSelection', component: ThemeSelectionScreen, options: {headerShown: false}},
    ];

    return this.stackManager.createStackNavigator(stackScreens);
  }

  /**
   * Create main tab navigator
   * @returns {React.Component} Tab navigator component
   */
  createMainTabs() {
    const HomeStack = this.createHomeStack();

    const tabScreens = [
      {name: 'Home', component: HomeStack, icon: 'home', options: {headerShown: false}},
      {
        name: 'Effects',
        component: EffectsScreen,
        icon: 'auto-fix-high',
        options: {title: 'LED Effects'},
      },
      {name: 'Presets', component: PresetsScreen, icon: 'bookmark', options: {title: 'Presets'}},
      {name: 'Settings', component: SettingsScreen, icon: 'settings', options: {title: 'Settings'}},
    ];

    return this.navigationManager.createTabNavigator(tabScreens);
  }

  /**
   * Render loading screen
   * @returns {React.Component} Loading screen component
   */
  renderLoadingScreen() {
    const {theme} = this.state;
    const backgroundColor = theme?.colors.background || '#0f0f0f';
    const primaryColor = theme?.colors.primary || '#00ff88';
    const textColor = theme?.colors.text || '#fff';

  return (
      <View style={[styles.loadingContainer, {backgroundColor}]}>
        <Icon name="palette" size={64} color={primaryColor} />
        <Text style={[styles.loadingText, {color: textColor}]}>
          Initializing SmartLED Controller...
        </Text>
        <ActivityIndicator size="large" color={primaryColor} style={styles.loadingSpinner} />
      </View>
    );
  }

  /**
   * Render error screen
   * @returns {React.Component} Error screen component
   */
  renderErrorScreen() {
    const {theme, error} = this.state;
    const backgroundColor = theme?.colors.background || '#0f0f0f';
    const errorColor = theme?.colors.error || '#ff4444';
    const textColor = theme?.colors.text || '#fff';

  return (
      <View style={[styles.errorContainer, {backgroundColor}]}>
        <Icon name="error" size={64} color={errorColor} />
        <Text style={[styles.errorTitle, {color: textColor}]}>Application Error</Text>
        <Text style={[styles.errorMessage, {color: textColor}]}>{error}</Text>
      </View>
    );
  }

  /**
   * Render main application
   * @returns {React.Component} Main app component
   */
  renderMainApp() {
    const MainTabs = this.createMainTabs();

    return (
      <NavigationContainer>
        <MainTabs />
    </NavigationContainer>
  );
}

  /**
   * Render component
   * @returns {React.Component} App component
   */
  render() {
    const {isLoading, error, isInitialized, legalAgreementsAccepted} = this.state;

    if (isLoading) {
      return this.renderLoadingScreen();
    }

    if (error) {
      return this.renderErrorScreen();
    }

    if (!isInitialized) {
      return this.renderLoadingScreen();
    }

    // Show legal agreement screen if not accepted
    if (!legalAgreementsAccepted) {
      return (
        <LegalAgreementScreen
          onAccept={this.handleLegalAgreementAccept}
          onDecline={this.handleLegalAgreementDecline}
        />
      );
    }

    const mainApp = this.renderMainApp();

    return (
      <>
        {mainApp}
        
        {/* Onboarding Tutorial */}
        <OnboardingTutorial
          visible={this.state.showOnboarding}
          onComplete={() => this.setState({showOnboarding: false})}
        />

        {/* Toast Notifications */}
        <Toast
          visible={this.state.toastVisible}
          message={this.state.toastMessage}
          type={this.state.toastType}
          onHide={() => this.setState({toastVisible: false})}
        />
      </>
    );
  }

  /**
   * Component will unmount
   */
  componentWillUnmount() {
    // Cleanup resources
    this.themeManager.cleanup();
    this.screenManager.clear();
    logger.info('App component unmounted');
  }
}

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSpinner: {
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default App;
