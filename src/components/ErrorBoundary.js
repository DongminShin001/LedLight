import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import logger from '../utils/Logger';

/**
 * Error Boundary Component
 * Catches JavaScript errors in component tree
 * Displays fallback UI instead of crashing
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to error reporting service
    logger.error('Error Boundary caught an error', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const theme = this.props.theme || {};
      const colors = theme.colors || {};

      return (
        <View
          style={[
            styles.container,
            {backgroundColor: colors.background || '#000'},
          ]}>
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={[styles.iconContainer, {backgroundColor: `${colors.primary || '#00ff88'}20`}]}>
              <Icon name="error-outline" size={80} color="#ff4444" />
            </View>

            {/* Error Title */}
            <Text style={[styles.title, {color: colors.text || '#fff'}]}>
              Oops! Something went wrong
            </Text>

            {/* Error Message */}
            <Text style={[styles.message, {color: colors.textSecondary || '#999'}]}>
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {/* Error Details (Collapsible) */}
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </ScrollView>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {backgroundColor: colors.primary || '#00ff88'},
                ]}
                onPress={this.handleReset}>
                <Icon name="refresh" size={20} color="#000" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  {borderColor: colors.primary || '#00ff88'},
                ]}
                onPress={() => {
                  // Report bug functionality
                  logger.info('User reported bug from error boundary');
                }}>
                <Icon name="bug-report" size={20} color={colors.primary || '#00ff88'} />
                <Text style={[styles.secondaryButtonText, {color: colors.primary || '#00ff88'}]}>
                  Report Issue
                </Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <Text style={[styles.helpText, {color: colors.textSecondary || '#999'}]}>
              If this problem persists, try restarting the app or contact support.
            </Text>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorDetails: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  errorTitle: {
    color: '#ff9800',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    color: '#999',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 2,
    marginHorizontal: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ErrorBoundary;
