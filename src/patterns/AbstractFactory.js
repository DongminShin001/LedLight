import logger from '../utils/Logger';

/**
 * Abstract Factory Pattern - Creates families of related objects
 */

/**
 * Abstract LED Factory
 */
export class AbstractLEDFactory {
  createController() {
    throw new Error('createController() must be implemented');
  }

  createConnector() {
    throw new Error('createConnector() must be implemented');
  }

  createProtocol() {
    throw new Error('createProtocol() must be implemented');
  }

  createUI() {
    throw new Error('createUI() must be implemented');
  }
}

/**
 * Arduino LED Factory - Creates Arduino-specific components
 */
export class ArduinoLEDFactory extends AbstractLEDFactory {
  createController() {
    logger.info('Creating Arduino LED Controller');
    return new ArduinoController();
  }

  createConnector() {
    logger.info('Creating Arduino Bluetooth Connector');
    return new ArduinoBluetoothConnector();
  }

  createProtocol() {
    logger.info('Creating Arduino Protocol Handler');
    return new ArduinoProtocol();
  }

  createUI() {
    logger.info('Creating Arduino UI Components');
    return new ArduinoUIComponents();
  }
}

/**
 * ESP32 LED Factory - Creates ESP32-specific components
 */
export class ESP32LEDFactory extends AbstractLEDFactory {
  createController() {
    logger.info('Creating ESP32 LED Controller');
    return new ESP32Controller();
  }

  createConnector() {
    logger.info('Creating ESP32 WiFi Connector');
    return new ESP32WiFiConnector();
  }

  createProtocol() {
    logger.info('Creating ESP32 Protocol Handler');
    return new ESP32Protocol();
  }

  createUI() {
    logger.info('Creating ESP32 UI Components');
    return new ESP32UIComponents();
  }
}

/**
 * WS2812B Factory - Creates WS2812B-specific components
 */
export class WS2812BFactory extends AbstractLEDFactory {
  createController() {
    logger.info('Creating WS2812B LED Controller');
    return new WS2812BController();
  }

  createConnector() {
    logger.info('Creating WS2812B Connector');
    return new WS2812BConnector();
  }

  createProtocol() {
    logger.info('Creating WS2812B Protocol Handler');
    return new WS2812BProtocol();
  }

  createUI() {
    logger.info('Creating WS2812B UI Components');
    return new WS2812BUIComponents();
  }
}

// Product implementations

class ArduinoController {
  constructor() {
    this.type = 'Arduino';
  }
  execute(command) {
    logger.info('Arduino executing command', {command});
    return `Arduino:${command}`;
  }
}

class ArduinoBluetoothConnector {
  constructor() {
    this.protocol = 'Bluetooth Classic';
  }
  connect(device) {
    logger.info('Arduino connecting via Bluetooth', {device});
    return true;
  }
}

class ArduinoProtocol {
  constructor() {
    this.format = 'Text';
  }
  encode(data) {
    return `ARD:${data}`;
  }
  decode(data) {
    return data.replace('ARD:', '');
  }
}

class ArduinoUIComponents {
  constructor() {
    this.theme = 'Arduino Blue';
  }
  render() {
    return {theme: this.theme, icons: 'arduino'};
  }
}

class ESP32Controller {
  constructor() {
    this.type = 'ESP32';
  }
  execute(command) {
    logger.info('ESP32 executing command', {command});
    return JSON.stringify({cmd: command});
  }
}

class ESP32WiFiConnector {
  constructor() {
    this.protocol = 'WiFi';
  }
  connect(device) {
    logger.info('ESP32 connecting via WiFi', {device});
    return true;
  }
}

class ESP32Protocol {
  constructor() {
    this.format = 'JSON';
  }
  encode(data) {
    return JSON.stringify(data);
  }
  decode(data) {
    return JSON.parse(data);
  }
}

class ESP32UIComponents {
  constructor() {
    this.theme = 'ESP32 Modern';
  }
  render() {
    return {theme: this.theme, icons: 'esp32'};
  }
}

class WS2812BController {
  constructor() {
    this.type = 'WS2812B';
  }
  execute(command) {
    logger.info('WS2812B executing command', {command});
    return `WS2812B:${command}`;
  }
}

class WS2812BConnector {
  constructor() {
    this.protocol = 'Serial/SPI';
  }
  connect(device) {
    logger.info('WS2812B connecting', {device});
    return true;
  }
}

class WS2812BProtocol {
  constructor() {
    this.format = 'Binary';
  }
  encode(data) {
    return Buffer.from(data);
  }
  decode(data) {
    return data.toString();
  }
}

class WS2812BUIComponents {
  constructor() {
    this.theme = 'Addressable';
  }
  render() {
    return {theme: this.theme, icons: 'strip'};
  }
}

/**
 * Factory Provider - Provides appropriate factory
 */
export class LEDFactoryProvider {
  static getFactory(deviceType) {
    switch (deviceType.toLowerCase()) {
      case 'arduino':
        return new ArduinoLEDFactory();
      case 'esp32':
        return new ESP32LEDFactory();
      case 'ws2812b':
        return new WS2812BFactory();
      default:
        logger.warn('Unknown device type, using Arduino factory', {deviceType});
        return new ArduinoLEDFactory();
    }
  }
}

/**
 * LED System Builder - Uses factory to build complete system
 */
export class LEDSystemBuilder {
  constructor(factory) {
    this.factory = factory;
    this.components = {};
  }

  buildController() {
    this.components.controller = this.factory.createController();
    return this;
  }

  buildConnector() {
    this.components.connector = this.factory.createConnector();
    return this;
  }

  buildProtocol() {
    this.components.protocol = this.factory.createProtocol();
    return this;
  }

  buildUI() {
    this.components.ui = this.factory.createUI();
    return this;
  }

  buildAll() {
    return this
      .buildController()
      .buildConnector()
      .buildProtocol()
      .buildUI();
  }

  getSystem() {
    return new LEDSystem(this.components);
  }
}

/**
 * LED System - Complete system with all components
 */
export class LEDSystem {
  constructor(components) {
    this.controller = components.controller;
    this.connector = components.connector;
    this.protocol = components.protocol;
    this.ui = components.ui;
  }

  async connect(device) {
    return await this.connector.connect(device);
  }

  async sendCommand(command) {
    const encoded = this.protocol.encode(command);
    return await this.controller.execute(encoded);
  }

  renderUI() {
    return this.ui.render();
  }

  getSystemInfo() {
    return {
      controllerType: this.controller.type,
      connectionProtocol: this.connector.protocol,
      dataFormat: this.protocol.format,
      uiTheme: this.ui.theme,
    };
  }
}

export default LEDFactoryProvider;
