/**
 * Design Patterns Index
 * Comprehensive OOP Design Patterns for SmartLED Controller
 */

// Command Pattern - For LED operations with undo/redo
export {
  Command,
  SetColorCommand,
  SetBrightnessCommand,
  TogglePowerCommand,
  SetEffectCommand,
  MacroCommand,
  CommandInvoker,
  CommandFactory,
} from './CommandPattern';

// State Pattern - For LED controller state management
export {
  LEDState,
  OffState,
  OnState,
  EffectState,
  ConnectingState,
  ErrorState,
  LEDStateContext,
} from './StatePattern';

// Decorator Pattern - For enhanced LED effects
export {
  EffectDecorator,
  Effect,
  SpeedDecorator,
  IntensityDecorator,
  ColorFilterDecorator,
  ReverseDecorator,
  FadeDecorator,
  StrobeDecorator,
  EffectBuilder,
  RainbowEffect,
  PulseEffect,
  WaveEffect,
  SparkleEffect,
  BreathingEffect,
  ChaseEffect,
  EffectFactory,
} from './DecoratorPattern';

// Repository Pattern - For data persistence
export {
  Repository,
  PresetRepository,
  ScheduleRepository,
  DeviceRepository,
  AnalyticsRepository,
  RepositoryFactory,
} from './RepositoryPattern';

// Strategy Pattern - For Bluetooth communication
export {
  BluetoothStrategy,
  BluetoothClassicStrategy,
  BLEStrategy,
  WiFiStrategy,
  MockStrategy,
  BluetoothContext,
} from './StrategyPattern';

// Chain of Responsibility - For error handling
export {
  ErrorHandler,
  ConnectionErrorHandler,
  PermissionErrorHandler,
  DataErrorHandler,
  TimeoutErrorHandler,
  DeviceErrorHandler,
  GenericErrorHandler,
  ErrorHandlerChainBuilder,
  ErrorHandlerManager,
} from './ChainOfResponsibility';

// Adapter Pattern - For device compatibility
export {
  DeviceAdapter,
  ArduinoLEDAdapter,
  ESP32LEDAdapter,
  WS2812BAdapter,
  GenericBluetoothAdapter,
  AdapterFactory,
  AdapterManager,
} from './AdapterPattern';

// Memento Pattern - For undo/redo functionality
export {
  Memento,
  LEDStateOriginator,
  MementoCaretaker,
  MementoManager,
} from './MementoPattern';

/**
 * Pattern Usage Guide:
 * 
 * 1. Command Pattern:
 *    - Use for all LED operations that need undo/redo
 *    - Example: const cmd = CommandFactory.createSetColorCommand(receiver, color);
 *              invoker.executeCommand(cmd);
 *              invoker.undo();
 * 
 * 2. State Pattern:
 *    - Use for managing LED controller states
 *    - Example: const context = new LEDStateContext();
 *              context.powerOn();
 *              context.changeColor('#ff0000');
 * 
 * 3. Decorator Pattern:
 *    - Use for enhancing LED effects
 *    - Example: const effect = EffectFactory.createBuilder(new RainbowEffect())
 *                              .withSpeed(2.0)
 *                              .withIntensity(80)
 *                              .build();
 * 
 * 4. Repository Pattern:
 *    - Use for data persistence
 *    - Example: const repo = RepositoryFactory.getPresetRepository();
 *              await repo.save('preset1', data);
 * 
 * 5. Strategy Pattern:
 *    - Use for Bluetooth communication
 *    - Example: const context = new BluetoothContext();
 *              context.setStrategy('BLE');
 *              await context.connect(device);
 * 
 * 6. Chain of Responsibility:
 *    - Use for error handling
 *    - Example: const manager = ErrorHandlerManager.getInstance();
 *              await manager.handleError(error, context);
 * 
 * 7. Adapter Pattern:
 *    - Use for device compatibility
 *    - Example: const adapter = AdapterFactory.createAdapter(device);
 *              const cmd = adapter.convertCommand({type: 'color', value: rgb});
 * 
 * 8. Memento Pattern:
 *    - Use for state snapshots and undo/redo
 *    - Example: const manager = new MementoManager();
 *              manager.setState(newState);
 *              manager.undo();
 */
