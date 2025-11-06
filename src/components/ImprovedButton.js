import React, {useRef} from 'react';
import {TouchableOpacity, Text, StyleSheet, Animated, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import haptic from '../utils/HapticFeedback';

/**
 * Improved Button Component
 * Enhanced visual feedback and states
 */
const ImprovedButton = ({
  title,
  onPress,
  icon,
  iconSize = 20,
  variant = 'primary', // primary, secondary, danger, success
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  style,
  textStyle,
  theme,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    haptic.light();
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyle = () => {
    const colors = theme?.colors || {};
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary || '#00ff88',
          color: '#000',
        };
      case 'secondary':
        return {
          backgroundColor: colors.surface || '#1a1a1a',
          color: colors.text || '#fff',
          borderWidth: 1,
          borderColor: colors.primary || '#00ff88',
        };
      case 'danger':
        return {
          backgroundColor: '#ff4444',
          color: '#fff',
        };
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          color: '#fff',
        };
      default:
        return {
          backgroundColor: colors.primary || '#00ff88',
          color: '#000',
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {paddingVertical: 8, paddingHorizontal: 16, fontSize: 14};
      case 'medium':
        return {paddingVertical: 12, paddingHorizontal: 24, fontSize: 16};
      case 'large':
        return {paddingVertical: 16, paddingHorizontal: 32, fontSize: 18};
      default:
        return {paddingVertical: 12, paddingHorizontal: 24, fontSize: 16};
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <Animated.View style={[{transform: [{scale: scaleAnim}]}]}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: variantStyle.backgroundColor,
            borderColor: variantStyle.borderColor,
            borderWidth: variantStyle.borderWidth || 0,
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator size="small" color={variantStyle.color} />
        ) : (
          <>
            {icon && (
              <Icon
                name={icon}
                size={iconSize}
                color={variantStyle.color}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.text,
                {
                  color: variantStyle.color,
                  fontSize: sizeStyle.fontSize,
                },
                textStyle,
              ]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
  },
});

export default ImprovedButton;

