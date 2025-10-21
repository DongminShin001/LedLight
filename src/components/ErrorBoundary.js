import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../hooks/useTheme';
import CrashReportingManager from '../services/CrashReportingManager';
import logger from '../utils/Logger';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    logger.error('Error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Report to crash reporting service
    const errorId = CrashReportingManager.reportCrash(error, {
      type: 'error_boundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown',
    });

    this.setState({
      error,
      errorInfo,
      errorId,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReportBug = () => {
    // In a real app, you would open a bug report form
    logger.info('User requested bug report', {
      errorId: this.state.errorId,
      error: this.state.error?.message,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          onRetry={this.handleRetry}
          onReportBug={this.handleReportBug}
          fallback={this.props.fallback}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component
 * Displays error information and recovery options
 */
const ErrorFallback = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReportBug,
  fallback,
}) => {
  const {theme} = useTheme();

  if (fallback) {
    return fallback(error, errorInfo, errorId, onRetry, onReportBug);
  }

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="error-outline" size={64} color={theme.colors.error} />
          <Text style={[styles.title, {color: theme.colors.text}]}>
            Oops! Something went wrong
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            We're sorry for the inconvenience. Our team has been notified.
          </Text>
        </View>

        {/* Error Details */}
        <View style={[styles.errorDetails, {backgroundColor: theme.colors.surface}]}>
          <Text style={[styles.errorTitle, {color: theme.colors.text}]}>
            Error Details
          </Text>
          
          {errorId && (
            <Text style={[styles.errorId, {color: theme.colors.textSecondary}]}>
              Error ID: {errorId}
            </Text>
          )}
          
          {error && (
            <View style={styles.errorMessage}>
              <Text style={[styles.errorLabel, {color: theme.colors.textSecondary}]}>
                Error Message:
              </Text>
              <Text style={[styles.errorText, {color: theme.colors.text}]}>
                {error.message}
              </Text>
            </View>
          )}

          {errorInfo && __DEV__ && (
            <View style={styles.errorStack}>
              <Text style={[styles.errorLabel, {color: theme.colors.textSecondary}]}>
                Component Stack:
              </Text>
              <Text style={[styles.errorText, {color: theme.colors.text}]}>
                {errorInfo.componentStack}
              </Text>
            </View>
          )}
        </View>

        {/* Recovery Options */}
        <View style={styles.recoveryOptions}>
          <TouchableOpacity
            style={[styles.retryButton, {backgroundColor: theme.colors.primary}]}
            onPress={onRetry}>
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reportButton, {backgroundColor: theme.colors.surface}]}
            onPress={onReportBug}>
            <Icon name="bug-report" size={20} color={theme.colors.primary} />
            <Text style={[styles.reportButtonText, {color: theme.colors.primary}]}>
              Report Bug
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text style={[styles.helpTitle, {color: theme.colors.text}]}>
            What can you do?
          </Text>
          <Text style={[styles.helpText, {color: theme.colors.textSecondary}]}>
            • Tap "Try Again" to restart the component
          </Text>
          <Text style={[styles.helpText, {color: theme.colors.textSecondary}]}>
            • Tap "Report Bug" to send us details about this error
          </Text>
          <Text style={[styles.helpText, {color: theme.colors.textSecondary}]}>
            • Restart the app if the problem persists
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Screen Error Boundary
 * Specialized error boundary for screen components
 */
export const ScreenErrorBoundary = ({children, screenName}) => (
  <ErrorBoundary name={`Screen: ${screenName}`}>
    {children}
  </ErrorBoundary>
);

/**
 * Component Error Boundary
 * Specialized error boundary for individual components
 */
export const ComponentErrorBoundary = ({children, componentName}) => (
  <ErrorBoundary name={`Component: ${componentName}`}>
    {children}
  </ErrorBoundary>
);

/**
 * Feature Error Boundary
 * Specialized error boundary for feature modules
 */
export const FeatureErrorBoundary = ({children, featureName}) => (
  <ErrorBoundary name={`Feature: ${featureName}`}>
    {children}
  </ErrorBoundary>
);

/**
 * Simple Error Boundary Hook
 * For functional components that need error handling
 */
export const useErrorHandler = () => {
  const handleError = (error, context = {}) => {
    logger.error('Error handled by hook', {
      error: error.message,
      stack: error.stack,
      context,
    });

    return CrashReportingManager.reportCrash(error, {
      type: 'error_handler_hook',
      ...context,
    });
  };

  const handleAsyncError = (error, context = {}) => {
    return handleError(error, {
      ...context,
      isAsync: true,
    });
  };

  return {
    handleError,
    handleAsyncError,
  };
};

/**
 * Error Boundary Manager
 * Manages error boundaries throughout the app
 */
export class ErrorBoundaryManager {
  static boundaries = new Map();

  static registerBoundary(name, boundary) {
    this.boundaries.set(name, boundary);
  }

  static unregisterBoundary(name) {
    this.boundaries.delete(name);
  }

  static getBoundary(name) {
    return this.boundaries.get(name);
  }

  static getAllBoundaries() {
    return Array.from(this.boundaries.values());
  }

  static clearAllBoundaries() {
    this.boundaries.clear();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorDetails: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorId: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  errorMessage: {
    marginBottom: 16,
  },
  errorStack: {
    marginBottom: 16,
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  recoveryOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginLeft: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpSection: {
    paddingBottom: 20,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default ErrorBoundary;
