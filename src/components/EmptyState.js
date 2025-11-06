import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const EmptyState = ({
  icon = 'inbox',
  title = 'Nothing Here Yet',
  message = 'Get started by adding something new',
  actionText,
  onAction,
  theme,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, {backgroundColor: `${theme?.colors?.primary || '#00ff88'}15`}]}>
        <Icon name={icon} size={64} color={theme?.colors?.primary || '#00ff88'} />
      </View>
      
      <Text style={[styles.title, {color: theme?.colors?.text || '#fff'}]}>
        {title}
      </Text>
      
      <Text style={[styles.message, {color: theme?.colors?.textSecondary || '#999'}]}>
        {message}
      </Text>
      
      {actionText && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: theme?.colors?.primary || '#00ff88'}]}
          onPress={onAction}
          activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
          <Icon name="arrow-forward" size={20} color="#000" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});

export default EmptyState;

