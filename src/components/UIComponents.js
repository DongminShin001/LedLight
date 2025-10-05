/**
 * Enhanced UI Components with modern design
 * Beautiful, animated components for better user experience
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

// Animated Button Component
export const AnimatedButton = ({
  title,
  onPress,
  icon,
  gradient = ['#00ff88', '#00cc6a'],
  style,
  textStyle,
  disabled = false,
  loading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{scale: scaleAnim}],
          opacity: opacityAnim,
        },
        style,
      ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}>
        <LinearGradient
          colors={disabled ? ['#666', '#555'] : gradient}
          style={[styles.animatedButton, disabled && styles.disabledButton]}>
          {loading ? (
            <AnimatedSpinner size={20} color="#fff" />
          ) : (
            <>
              {icon && <Icon name={icon} size={20} color="#fff" style={styles.buttonIcon} />}
              <Text style={[styles.animatedButtonText, textStyle]}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Spinner Component
export const AnimatedSpinner = ({size = 20, color = '#fff'}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    return () => spin.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{transform: [{rotate: spin}]}}>
      <Icon name="refresh" size={size} color={color} />
    </Animated.View>
  );
};

// Floating Action Button
export const FloatingActionButton = ({onPress, icon, color = '#00ff88'}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    rotateAnim.setValue(0);
    onPress();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.fab,
        {
          backgroundColor: color,
          transform: [
            {scale: scaleAnim},
            {rotate: rotate},
          ],
        },
      ]}>
      <TouchableOpacity onPress={handlePress} style={styles.fabTouchable}>
        <Icon name={icon} size={24} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Card Component with Glass Effect
export const GlassCard = ({children, style, gradient = ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}) => {
  return (
    <View style={[styles.glassCard, style]}>
      <LinearGradient colors={gradient} style={styles.glassGradient}>
        {children}
      </LinearGradient>
    </View>
  );
};

// Animated LED Preview
export const AnimatedLEDPreview = ({color, brightness, isOn, size = 120}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOn) {
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      // Glow animation
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();
      glow.start();

      return () => {
        pulse.stop();
        glow.stop();
      };
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isOn, pulseAnim, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.ledPreviewContainer}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.ledGlow,
          {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: color,
            opacity: glowOpacity,
            transform: [{scale: pulseAnim}],
          },
        ]}
      />
      
      {/* Main LED */}
      <Animated.View
        style={[
          styles.ledMain,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isOn ? color : '#333',
            opacity: isOn ? brightness / 100 : 0.3,
            transform: [{scale: pulseAnim}],
            shadowColor: color,
            shadowOffset: {width: 0, height: 0},
            shadowOpacity: isOn ? 0.8 : 0,
            shadowRadius: 20,
            elevation: isOn ? 15 : 0,
          },
        ]}
      />
      
      {/* Inner highlight */}
      <Animated.View
        style={[
          styles.ledHighlight,
          {
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            opacity: isOn ? 0.6 : 0,
            transform: [{scale: pulseAnim}],
          },
        ]}
      />
    </View>
  );
};

// Progress Bar Component
export const ProgressBar = ({progress, color = '#00ff88', height = 8, animated = true}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, progressAnim, animated]);

  return (
    <View style={[styles.progressBarContainer, {height}]}>
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            backgroundColor: color,
            width: animated ? progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }) : `${progress}%`,
          },
        ]}
      />
    </View>
  );
};

// Status Indicator Component
export const StatusIndicator = ({status, size = 12}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'connected') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status, pulseAnim]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#00ff88';
      case 'connecting': return '#ffa726';
      case 'disconnected': return '#ff4444';
      case 'error': return '#f44336';
      default: return '#666';
    }
  };

  return (
    <Animated.View
      style={[
        styles.statusIndicator,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getStatusColor(),
          transform: [{scale: pulseAnim}],
        },
      ]}
    />
  );
};

// Slide-in Animation Component
export const SlideInView = ({children, direction = 'up', delay = 0, style}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const slideValue = direction === 'up' ? 50 : direction === 'down' ? -50 : 0;
    const translateValue = direction === 'left' ? 50 : direction === 'right' ? -50 : slideValue;

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: translateValue,
        duration: 600,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim, direction, delay]);

  const translateY = direction === 'up' || direction === 'down' ? slideAnim : 0;
  const translateX = direction === 'left' || direction === 'right' ? slideAnim : 0;

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [
            {translateY},
            {translateX},
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  animatedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  glassGradient: {
    padding: 20,
  },
  ledPreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ledGlow: {
    position: 'absolute',
  },
  ledMain: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ledHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: '20%',
    left: '20%',
  },
  progressBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusIndicator: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
