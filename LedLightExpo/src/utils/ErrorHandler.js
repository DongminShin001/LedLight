/**
 * Custom Error Classes for LED Controller App
 */

export class BluetoothError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'BluetoothError';
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export class DeviceConnectionError extends BluetoothError {
  constructor(message, deviceId, originalError = null) {
    super(message, 'DEVICE_CONNECTION_ERROR', originalError);
    this.name = 'DeviceConnectionError';
    this.deviceId = deviceId;
  }
}

export class PermissionError extends BluetoothError {
  constructor(message, permission, originalError = null) {
    super(message, 'PERMISSION_ERROR', originalError);
    this.name = 'PermissionError';
    this.permission = permission;
  }
}

export class CommandError extends BluetoothError {
  constructor(message, command, originalError = null) {
    super(message, 'COMMAND_ERROR', originalError);
    this.name = 'CommandError';
    this.command = command;
  }
}

export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.timestamp = new Date().toISOString();
  }
}

export class NetworkError extends Error {
  constructor(message, statusCode, originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error Handler Utility
 */
export class ErrorHandler {
  static handle(error, context = '') {
    const errorInfo = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    };

    // Log error for debugging
    console.error(`[${context}] Error:`, errorInfo);

    // In production, you might want to send this to a crash reporting service
    // like Crashlytics, Sentry, etc.
    if (__DEV__) {
      console.warn('Error details:', errorInfo);
    }

    return errorInfo;
  }

  static isBluetoothError(error) {
    return error instanceof BluetoothError;
  }

  static isPermissionError(error) {
    return error instanceof PermissionError;
  }

  static isConnectionError(error) {
    return error instanceof DeviceConnectionError;
  }

  static getUserFriendlyMessage(error) {
    if (error instanceof PermissionError) {
      return 'Please grant Bluetooth permissions to use this feature.';
    }
    
    if (error instanceof DeviceConnectionError) {
      return 'Unable to connect to LED device. Please check if the device is nearby and powered on.';
    }
    
    if (error instanceof CommandError) {
      return 'Failed to send command to LED device. Please try again.';
    }
    
    if (error instanceof ValidationError) {
      return `Invalid ${error.field}: ${error.message}`;
    }
    
    if (error instanceof NetworkError) {
      return 'Network error occurred. Please check your internet connection.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Error Boundary Component for React Native
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, errorInfo) {
    ErrorHandler.handle(error, 'ErrorBoundary');
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {ErrorHandler.getUserFriendlyMessage(this.state.error)}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({hasError: false, error: null})}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
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
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#00ff88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
