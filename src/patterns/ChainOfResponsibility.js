import logger from '../utils/Logger';

/**
 * Base Error Handler - Implements Chain of Responsibility Pattern
 */
export class ErrorHandler {
  constructor() {
    this.nextHandler = null;
  }

  /**
   * Set next handler in chain
   * @param {ErrorHandler} handler - Next handler
   * @returns {ErrorHandler} Next handler
   */
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  /**
   * Handle error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @returns {boolean} True if error was handled
   */
  async handle(error, context = {}) {
    const handled = await this.process(error, context);
    
    if (!handled && this.nextHandler) {
      return await this.nextHandler.handle(error, context);
    }
    
    return handled;
  }

  /**
   * Process error (to be implemented by subclasses)
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @returns {Promise<boolean>} True if error was handled
   */
  async process(error, context) {
    return false;
  }
}

/**
 * Connection Error Handler
 */
export class ConnectionErrorHandler extends ErrorHandler {
  async process(error, context) {
    const connectionErrors = [
      'Connection failed',
      'Device not found',
      'Bluetooth not enabled',
      'Connection timeout',
      'ECONNREFUSED',
      'Network error',
    ];

    const isConnectionError = connectionErrors.some(msg => 
      error.message.includes(msg) || error.code?.includes('CONNECTION')
    );

    if (isConnectionError) {
      logger.error('Connection error handled', {
        error: error.message,
        context,
      });

      // Attempt reconnection
      if (context.attemptReconnect) {
        await this.attemptReconnection(context);
      }

      // Notify user
      if (context.notifyUser) {
        context.notifyUser({
          title: 'Connection Error',
          message: 'Failed to connect to device. Please check your Bluetooth settings.',
          type: 'error',
        });
      }

      return true;
    }

    return false;
  }

  async attemptReconnection(context) {
    if (context.device && context.reconnectCallback) {
      try {
        logger.info('Attempting reconnection', {deviceId: context.device.id});
        await context.reconnectCallback(context.device);
      } catch (error) {
        logger.error('Reconnection failed', error);
      }
    }
  }
}

/**
 * Permission Error Handler
 */
export class PermissionErrorHandler extends ErrorHandler {
  async process(error, context) {
    const permissionErrors = [
      'Permission denied',
      'Location permission',
      'Bluetooth permission',
      'PERMISSION_DENIED',
    ];

    const isPermissionError = permissionErrors.some(msg => 
      error.message.includes(msg) || error.code?.includes('PERMISSION')
    );

    if (isPermissionError) {
      logger.error('Permission error handled', {
        error: error.message,
        context,
      });

      // Request permissions
      if (context.requestPermissions) {
        await context.requestPermissions();
      }

      // Notify user
      if (context.notifyUser) {
        context.notifyUser({
          title: 'Permission Required',
          message: 'This app needs Bluetooth and Location permissions to function.',
          type: 'warning',
        });
      }

      return true;
    }

    return false;
  }
}

/**
 * Data Error Handler
 */
export class DataErrorHandler extends ErrorHandler {
  async process(error, context) {
    const dataErrors = [
      'Invalid data',
      'Parse error',
      'JSON',
      'Malformed',
      'Corrupted',
    ];

    const isDataError = dataErrors.some(msg => 
      error.message.includes(msg) || error.code?.includes('DATA')
    );

    if (isDataError) {
      logger.error('Data error handled', {
        error: error.message,
        context,
      });

      // Clear corrupted data
      if (context.clearData) {
        await context.clearData();
      }

      // Notify user
      if (context.notifyUser) {
        context.notifyUser({
          title: 'Data Error',
          message: 'Invalid data received. Please try again.',
          type: 'error',
        });
      }

      return true;
    }

    return false;
  }
}

/**
 * Timeout Error Handler
 */
export class TimeoutErrorHandler extends ErrorHandler {
  async process(error, context) {
    const timeoutErrors = [
      'Timeout',
      'ETIMEDOUT',
      'Request timeout',
      'Operation timed out',
    ];

    const isTimeoutError = timeoutErrors.some(msg => 
      error.message.includes(msg) || error.code?.includes('TIMEOUT')
    );

    if (isTimeoutError) {
      logger.error('Timeout error handled', {
        error: error.message,
        context,
      });

      // Retry operation
      if (context.retryOperation && context.retryCount < 3) {
        logger.info('Retrying operation', {attempt: context.retryCount + 1});
        await context.retryOperation();
      }

      // Notify user
      if (context.notifyUser) {
        context.notifyUser({
          title: 'Operation Timeout',
          message: 'The operation took too long. Please try again.',
          type: 'warning',
        });
      }

      return true;
    }

    return false;
  }
}

/**
 * Device Error Handler
 */
export class DeviceErrorHandler extends ErrorHandler {
  async process(error, context) {
    const deviceErrors = [
      'Device error',
      'Hardware error',
      'Firmware error',
      'Unsupported device',
    ];

    const isDeviceError = deviceErrors.some(msg => 
      error.message.includes(msg) || error.code?.includes('DEVICE')
    );

    if (isDeviceError) {
      logger.error('Device error handled', {
        error: error.message,
        context,
      });

      // Reset device
      if (context.resetDevice) {
        await context.resetDevice();
      }

      // Notify user
      if (context.notifyUser) {
        context.notifyUser({
          title: 'Device Error',
          message: 'The LED device encountered an error. Please reset the device.',
          type: 'error',
        });
      }

      return true;
    }

    return false;
  }
}

/**
 * Generic Error Handler (fallback)
 */
export class GenericErrorHandler extends ErrorHandler {
  async process(error, context) {
    logger.error('Generic error handled', {
      error: error.message,
      stack: error.stack,
      context,
    });

    // Log to analytics
    if (context.logAnalytics) {
      context.logAnalytics({
        type: 'error',
        message: error.message,
        stack: error.stack,
      });
    }

    // Notify user
    if (context.notifyUser) {
      context.notifyUser({
        title: 'An Error Occurred',
        message: error.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }

    // Always handle generic errors
    return true;
  }
}

/**
 * Error Handler Chain Builder
 */
export class ErrorHandlerChainBuilder {
  constructor() {
    this.handlers = [];
  }

  /**
   * Add connection error handler
   * @returns {ErrorHandlerChainBuilder} Builder instance
   */
  addConnectionHandler() {
    this.handlers.push(new ConnectionErrorHandler());
    return this;
  }

  /**
   * Add permission error handler
   * @returns {ErrorHandlerChainBuilder} Builder instance
   */
  addPermissionHandler() {
    this.handlers.push(new PermissionErrorHandler());
    return this;
  }

  /**
   * Add data error handler
   * @returns {ErrorHandlerChainBuilder} Builder instance
   */
  addDataHandler() {
    this.handlers.push(new DataErrorHandler());
    return this;
  }

  /**
   * Add timeout error handler
   * @returns {ErrorHandlerChainBuilder} Builder instance
   */
  addTimeoutHandler() {
    this.handlers.push(new TimeoutErrorHandler());
    return this;
  }

  /**
   * Add device error handler
   * @returns {ErrorHandlerChainBuilder} Builder instance
   */
  addDeviceHandler() {
    this.handlers.push(new DeviceErrorHandler());
    return this;
  }

  /**
   * Add generic error handler
   * @returns {ErrorHandlerChainBuilder} Builder instance
   */
  addGenericHandler() {
    this.handlers.push(new GenericErrorHandler());
    return this;
  }

  /**
   * Add custom handler
   * @param {ErrorHandler} handler - Custom handler
   * @returns {ErrorHandlerChainBuilder} Builder instance
   */
  addCustomHandler(handler) {
    this.handlers.push(handler);
    return this;
  }

  /**
   * Build the chain
   * @returns {ErrorHandler} First handler in chain
   */
  build() {
    if (this.handlers.length === 0) {
      throw new Error('No handlers added to chain');
    }

    // Link handlers together
    for (let i = 0; i < this.handlers.length - 1; i++) {
      this.handlers[i].setNext(this.handlers[i + 1]);
    }

    logger.info('Error handler chain built', {
      handlerCount: this.handlers.length,
    });

    return this.handlers[0];
  }

  /**
   * Build default chain
   * @returns {ErrorHandler} First handler in chain
   */
  static buildDefault() {
    return new ErrorHandlerChainBuilder()
      .addConnectionHandler()
      .addPermissionHandler()
      .addDataHandler()
      .addTimeoutHandler()
      .addDeviceHandler()
      .addGenericHandler()
      .build();
  }
}

/**
 * Error Handler Manager - Singleton
 */
export class ErrorHandlerManager {
  static instance = null;

  constructor() {
    if (ErrorHandlerManager.instance) {
      return ErrorHandlerManager.instance;
    }

    this.chain = ErrorHandlerChainBuilder.buildDefault();
    ErrorHandlerManager.instance = this;
  }

  /**
   * Get singleton instance
   * @returns {ErrorHandlerManager} Manager instance
   */
  static getInstance() {
    if (!ErrorHandlerManager.instance) {
      ErrorHandlerManager.instance = new ErrorHandlerManager();
    }
    return ErrorHandlerManager.instance;
  }

  /**
   * Handle error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   * @returns {Promise<boolean>} True if error was handled
   */
  async handleError(error, context = {}) {
    return await this.chain.handle(error, context);
  }

  /**
   * Set custom chain
   * @param {ErrorHandler} chain - Custom chain
   */
  setChain(chain) {
    this.chain = chain;
    logger.info('Custom error handler chain set');
  }

  /**
   * Reset to default chain
   */
  resetChain() {
    this.chain = ErrorHandlerChainBuilder.buildDefault();
    logger.info('Error handler chain reset to default');
  }
}
