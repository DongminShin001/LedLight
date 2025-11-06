import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const LoadingSkeleton = ({style, variant = 'card'}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getSkeletonStyle = () => {
    switch (variant) {
      case 'card':
        return styles.card;
      case 'button':
        return styles.button;
      case 'circle':
        return styles.circle;
      case 'line':
        return styles.line;
      default:
        return styles.card;
    }
  };

  return (
    <Animated.View style={[styles.skeleton, getSkeletonStyle(), style, {opacity}]}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  card: {
    width: width - 40,
    height: 120,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  button: {
    width: (width - 60) / 2,
    height: 100,
    borderRadius: 12,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  line: {
    width: '100%',
    height: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
});

export default LoadingSkeleton;

