import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../hooks/useTheme';
import AnalyticsManager from '../services/AnalyticsManager';
import logger from '../utils/Logger';

const {width, height} = Dimensions.get('window');

const SplashScreen = ({onFinish}) => {
  const {theme} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeSplash();
  }, []);

  const initializeSplash = async () => {
    try {
      // Track splash screen view
      AnalyticsManager.trackScreenView('SplashScreen', {
        timestamp: Date.now(),
      });

      // Start animations
      await startAnimations();

      // Simulate initialization tasks
      await performInitializationTasks();

      // Complete splash screen
      await completeSplash();
    } catch (error) {
      logger.error('Splash screen initialization failed', error);
      // Still complete splash even if there's an error
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 2000);
    }
  };

  const startAnimations = () => {
    return new Promise(resolve => {
      // Logo rotation animation
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();

      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Scale animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();

      // Slide animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Progress animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();

      setTimeout(resolve, 1000);
    });
  };

  const performInitializationTasks = async () => {
    const tasks = [
      {name: 'Initializing Analytics', duration: 500},
      {name: 'Loading Theme System', duration: 300},
      {name: 'Setting up Error Handling', duration: 400},
      {name: 'Preparing LED Controller', duration: 600},
      {name: 'Loading User Preferences', duration: 200},
    ];

    for (const task of tasks) {
      logger.info(`Splash: ${task.name}`);
      await new Promise(resolve => setTimeout(resolve, task.duration));
    }
  };

  const completeSplash = () => {
    return new Promise(resolve => {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
        resolve();
      });
    });
  };

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 80],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark, theme.colors.background]}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [
                {scale: scaleAnim},
                {translateY: slideAnim},
                {rotate: logoRotation},
              ],
            },
          ]}>
          <View style={styles.logoContainer}>
            <Icon name="lightbulb" size={80} color="#fff" />
          </View>
          <Text style={styles.appName}>SmartLED Controller</Text>
          <Text style={styles.appTagline}>Illuminate Your World</Text>
        </Animated.View>

        {/* Loading Section */}
        <Animated.View
          style={[
            styles.loadingSection,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <Text style={styles.loadingText}>Initializing...</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressWidth,
                    backgroundColor: '#fff',
                  },
                ]}
              />
            </View>
          </View>

          {/* Loading Dots */}
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, {opacity: fadeAnim}]} />
            <Animated.View style={[styles.dot, {opacity: fadeAnim}]} />
            <Animated.View style={[styles.dot, {opacity: fadeAnim}]} />
          </View>
        </Animated.View>

        {/* Version Info */}
        <Animated.View
          style={[
            styles.versionSection,
            {
              opacity: fadeAnim,
            },
          ]}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 SmartLED Technologies</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    fontWeight: '600',
  },
  progressContainer: {
    width: width - 80,
    marginBottom: 20,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  versionSection: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.6,
  },
});

export default SplashScreen;
