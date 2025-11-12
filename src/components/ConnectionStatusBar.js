import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import haptic from '../utils/HapticFeedback';

/**
 * Connection Status Bar Component
 * Shows real-time connection status at the top
 */
const ConnectionStatusBar = ({status = 'disconnected', deviceName, onPress, theme}) => {
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'disconnected') {
      // Show the status bar
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide the status bar
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          backgroundColor: '#4CAF50',
          icon: 'check-circle',
          text: deviceName ? `Connected to ${deviceName}` : 'Connected',
          textColor: '#fff',
        };
      case 'connecting':
        return {
          backgroundColor: '#ff9800',
          icon: 'sync',
          text: 'Connecting...',
          textColor: '#fff',
        };
      case 'error':
        return {
          backgroundColor: '#f44336',
          icon: 'error',
          text: 'Connection Error',
          textColor: '#fff',
        };
      case 'disconnected':
      default:
        return {
          backgroundColor: '#666',
          icon: 'bluetooth-disabled',
          text: 'Disconnected',
          textColor: '#fff',
        };
    }
  };

  const config = getStatusConfig();

  if (status === 'disconnected') {
    return null; // Don't show when disconnected
  }

  const handlePress = () => {
    if (onPress) {
      haptic.light();
      onPress();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{translateY: slideAnim}],
          opacity,
        },
      ]}>
      <TouchableOpacity
        style={styles.content}
        onPress={handlePress}
        activeOpacity={onPress ? 0.7 : 1}>
        <Icon name={config.icon} size={20} color={config.textColor} style={styles.icon} />
        <Text style={[styles.text, {color: config.textColor}]}>{config.text}</Text>
        {status === 'connected' && (
          <View style={styles.statusDot}>
            <Animated.View
              style={[
                styles.pulse,
                {
                  opacity: useRef(
                    Animated.loop(
                      Animated.sequence([
                        Animated.timing(new Animated.Value(1), {
                          toValue: 0.3,
                          duration: 1000,
                          useNativeDriver: true,
                        }),
                        Animated.timing(new Animated.Value(0.3), {
                          toValue: 1,
                          duration: 1000,
                          useNativeDriver: true,
                        }),
                      ]),
                    ),
                  ).current,
                },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 50, // Account for status bar
    paddingBottom: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginLeft: 8,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});

export default ConnectionStatusBar;

