import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const {width} = Dimensions.get('window');

const Toast = ({visible, message, type = 'info', duration = 3000, onHide}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      const hapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      };

      if (type === 'success') {
        ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
      } else if (type === 'error') {
        ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
      } else {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }

      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
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

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {backgroundColor: '#4CAF50', icon: 'check-circle'};
      case 'error':
        return {backgroundColor: '#f44336', icon: 'error'};
      case 'warning':
        return {backgroundColor: '#ff9800', icon: 'warning'};
      case 'info':
      default:
        return {backgroundColor: '#2196F3', icon: 'info'};
    }
  };

  const style = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: style.backgroundColor,
          transform: [{translateY}],
          opacity,
        },
      ]}>
      <TouchableOpacity
        style={styles.content}
        activeOpacity={0.9}
        onPress={hideToast}>
        <Icon name={style.icon} size={24} color="#fff" style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Icon name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

// Toast Manager - Singleton to show toasts from anywhere
class ToastManager {
  static show = null;

  static success(message) {
    if (ToastManager.show) {
      ToastManager.show(message, 'success');
    }
  }

  static error(message) {
    if (ToastManager.show) {
      ToastManager.show(message, 'error');
    }
  }

  static warning(message) {
    if (ToastManager.show) {
      ToastManager.show(message, 'warning');
    }
  }

  static info(message) {
    if (ToastManager.show) {
      ToastManager.show(message, 'info');
    }
  }
}

export {ToastManager};
export default Toast;

