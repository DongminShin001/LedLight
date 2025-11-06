import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');
const ONBOARDING_KEY = '@onboarding_completed';

const OnboardingTutorial = ({visible, onComplete}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const steps = [
    {
      icon: 'bluetooth',
      title: 'Connect Your Device',
      description: 'Tap the "Connect Device" button to pair with your LED controller via Bluetooth.',
      tip: '💡 Make sure your LED controller is powered on and in pairing mode.',
      color: '#00ff88',
    },
    {
      icon: 'palette',
      title: 'Choose Your Color',
      description: 'Pick any color you like from the color picker or enter a hex code directly.',
      tip: '🎨 Tap the color preview to quickly cycle through preset colors.',
      color: '#ff6b6b',
    },
    {
      icon: 'brightness-high',
      title: 'Adjust Brightness',
      description: 'Use the brightness slider to set the perfect light level from 0% to 100%.',
      tip: '✨ Slide to the left for dim, right for bright!',
      color: '#ffd93d',
    },
    {
      icon: 'arrow-forward',
      title: 'Try Running Effects',
      description: 'Tap "Running" to access directional effects with speed control.',
      tip: '🏃 Perfect for LED strips - watch colors run across your lights!',
      color: '#6bcf7f',
    },
    {
      icon: 'auto-fix-high',
      title: 'Explore Effects',
      description: 'Browse through rainbow, breathing, strobe, and many more amazing effects.',
      tip: '🎉 Each effect is customizable with different speeds and colors.',
      color: '#a084dc',
    },
    {
      icon: 'bookmark',
      title: 'Save Your Favorites',
      description: 'Create and save custom presets to quickly access your favorite light setups.',
      tip: '⭐ Save presets for different moods: party, relax, focus, sleep.',
      color: '#ff9ff3',
    },
    {
      icon: 'warning',
      title: 'Safety First!',
      description: 'Always ensure LED installations are done by licensed electricians.',
      tip: '⚠️ Disconnect power immediately if you smell smoke or see unusual behavior.',
      color: '#ff6b6b',
    },
    {
      icon: 'celebration',
      title: 'You\'re All Set!',
      description: 'Start controlling your LED lights like a pro. Have fun and be creative!',
      tip: '🎊 Explore all features and create amazing lighting scenes!',
      color: '#00ff88',
    },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.log('Failed to save onboarding status', error);
    }
    if (onComplete) onComplete();
  };

  const step = steps[currentStep];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.95)']}
          style={styles.gradient}>
          
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentStep && styles.progressDotActive,
                  {backgroundColor: index <= currentStep ? step.color : '#444'},
                ]}
              />
            ))}
          </View>

          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{scale: scaleAnim}],
              },
            ]}>
            
            {/* Icon */}
            <View style={[styles.iconContainer, {backgroundColor: `${step.color}20`}]}>
              <Icon name={step.icon} size={64} color={step.color} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{step.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{step.description}</Text>

            {/* Tip */}
            <View style={styles.tipContainer}>
              <Text style={styles.tip}>{step.tip}</Text>
            </View>
          </Animated.View>

          {/* Navigation */}
          <View style={styles.navigation}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>
                {currentStep + 1} / {steps.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.nextButton, {backgroundColor: step.color}]}
              onPress={handleNext}
              activeOpacity={0.8}>
              <Text style={styles.nextButtonText}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Icon
                name={currentStep === steps.length - 1 ? 'check' : 'arrow-forward'}
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

// Helper function to check if onboarding should be shown
export const shouldShowOnboarding = async () => {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
    return completed !== 'true';
  } catch (error) {
    return true; // Show onboarding by default if can't check
  }
};

// Helper to reset onboarding (for testing)
export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.log('Failed to reset onboarding', error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressDotActive: {
    width: 24,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  tipContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  tip: {
    fontSize: 14,
    color: '#ffd93d',
    textAlign: 'center',
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});

export default OnboardingTutorial;

