# SmartLED Controller - Professional LED Control System

## 📱 Overview

SmartLED Controller is a professional-grade mobile application for controlling LED strips and smart lighting systems. Built with React Native and Expo, it provides an intuitive interface for managing LED colors, brightness, effects, and automation.

## 🚀 Features

### Core Features
- **Real-time LED Control** - Instant color and brightness adjustments
- **Advanced Effects** - Rainbow, breathing, strobe, wave, and music-reactive effects
- **Bluetooth Connectivity** - Seamless connection to LED controllers
- **Scheduling System** - Automated lighting schedules
- **Preset Management** - Save and recall custom lighting configurations
- **Music Sync** - LED strips that react to music and audio
- **Device Management** - Support for multiple LED devices

### Advanced Features
- **Performance Monitoring** - Real-time app performance tracking
- **Data Persistence** - Local storage for preferences and presets
- **Analytics** - Usage tracking and optimization insights
- **Theme System** - Multiple UI themes and customization
- **Error Handling** - Comprehensive error management and reporting
- **Testing Suite** - Complete unit and integration tests

## 🛠️ Technical Architecture

### Design Patterns Implemented
- **Singleton** - Theme and service management
- **Factory** - Component and service creation
- **Observer** - Event handling and notifications
- **Strategy** - Bluetooth communication strategies
- **Command** - LED operation commands with undo/redo
- **State** - LED controller state management
- **Decorator** - LED effect enhancements
- **Repository** - Data persistence abstraction
- **Chain of Responsibility** - Error handling pipeline
- **Adapter** - Device compatibility layer
- **Memento** - State snapshots and restoration
- **Facade** - Simplified LED control interface
- **Proxy** - Access control and lazy loading
- **Composite** - LED group management
- **Flyweight** - Efficient rendering optimization
- **Mediator** - Component communication
- **Abstract Factory** - LED component families

### Service Architecture
```
src/
├── services/
│   ├── BluetoothLEDService.js      # Bluetooth connectivity
│   ├── DataPersistenceService.js   # Local data storage
│   ├── PerformanceMonitor.js       # Performance tracking
│   ├── AnalyticsManager.js         # Usage analytics
│   ├── CrashReportingManager.js    # Error reporting
│   └── LoggingManager.js          # Logging system
├── components/
│   ├── ErrorBoundary.js           # Error handling
│   ├── SplashScreen.js           # App loading screen
│   └── UIComponents.js            # Reusable UI components
├── screens/
│   ├── HomeScreen.js              # Main control interface
│   ├── ColorPickerScreen.js       # Color selection
│   ├── EffectsScreen.js           # Effect management
│   ├── SettingsScreen.js          # App settings
│   └── LegalAgreementScreen.js    # Legal compliance
├── theme/
│   ├── ThemeManager.js            # Theme management
│   ├── ThemeFactory.js            # Theme creation
│   ├── ThemeObserver.js           # Theme notifications
│   └── Themes.js                  # Theme definitions
├── patterns/
│   ├── CommandPattern.js          # Command pattern implementation
│   ├── StatePattern.js            # State pattern implementation
│   ├── DecoratorPattern.js        # Decorator pattern implementation
│   └── [other patterns...]        # Additional design patterns
└── utils/
    ├── ErrorHandler.js            # Error handling utilities
    ├── Logger.js                  # Logging utilities
    └── PerformanceUtils.js       # Performance utilities
```

## 📦 Installation

### Prerequisites
- Node.js 18.16.0 or higher
- npm 9.8.0 or higher
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/DongminShin001/LedLight.git
   cd LedLight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - **iOS**: `npx expo run:ios`
   - **Android**: `npx expo run:android`
   - **Web**: `npx expo start --web`

## 🔧 Configuration

### Environment Setup

1. **Metro Configuration** (`metro.config.js`)
   ```javascript
   const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
   const config = {};
   module.exports = mergeConfig(getDefaultConfig(__dirname), config);
   ```

2. **Babel Configuration** (`babel.config.js`)
   ```javascript
   module.exports = {
     presets: ['module:metro-react-native-babel-preset'],
     plugins: [
       ['module-resolver', {
         root: ['./src'],
         extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
         alias: {
           '@': './src',
           '@components': './src/components',
           '@screens': './src/screens',
           '@services': './src/services',
         },
       }],
     ],
   };
   ```

### Bluetooth Configuration

The app supports both real Bluetooth devices and mock services for development:

```javascript
// Real Bluetooth (production)
const bluetoothService = new BluetoothLEDService();

// Mock Bluetooth (development)
bluetoothService.isMockService = true;
```

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Modern dark theme with indigo accents
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle elevation for depth
- **Animations**: Smooth transitions and micro-interactions

### Component Library
- **Cards**: Elevated containers for content grouping
- **Buttons**: Interactive elements with hover states
- **Sliders**: Touch-friendly brightness controls
- **Color Picker**: Intuitive color selection interface
- **Status Indicators**: Real-time connection feedback

## 🔌 Bluetooth Integration

### Supported Devices
- Arduino-based LED controllers
- ESP32 LED controllers
- WS2812B LED strips
- Generic Bluetooth LED controllers

### Communication Protocol
```javascript
// Command structure
{
  type: 'POWER' | 'BRIGHTNESS' | 'COLOR' | 'EFFECT' | 'MUSIC_MODE' | 'SCHEDULE',
  value: number | boolean | object,
  timestamp: number
}

// Example commands
await bluetoothService.setPower(true);
await bluetoothService.setBrightness(75);
await bluetoothService.setColor(255, 0, 0);
await bluetoothService.setEffect('rainbow', 50);
```

## 💾 Data Management

### Local Storage
- **User Preferences**: App settings and configurations
- **LED Presets**: Custom color and effect combinations
- **Device Settings**: Per-device configurations
- **Schedules**: Automated lighting schedules
- **Analytics**: Usage data and performance metrics

### Data Export/Import
```javascript
// Export all data
const data = await dataService.exportData();

// Import data
await dataService.importData(jsonData);
```

## 📊 Performance Monitoring

### Metrics Tracked
- **Render Performance**: Component render times
- **Memory Usage**: App memory consumption
- **Network Performance**: Request latency and success rates
- **User Interactions**: Button presses and navigation
- **Errors**: Application errors and crashes

### Performance Optimization
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Prevent unnecessary re-renders
- **Image Optimization**: Compressed assets
- **Bundle Splitting**: Code splitting for faster loading

## 🧪 Testing

### Test Suite
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service integration testing
- **E2E Tests**: Complete user flow testing
- **Performance Tests**: Rendering and memory tests

### Running Tests
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# All tests
npm test
```

## 🚀 Deployment

### Build Configuration

1. **iOS Build** (`ios/`)
   - Xcode project configuration
   - App Store metadata
   - Code signing setup

2. **Android Build** (`android/`)
   - Gradle configuration
   - Google Play Store metadata
   - Signing configuration

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Code Quality**: ESLint, Prettier, TypeScript checks
- **Security Scanning**: Dependency vulnerability checks
- **Performance Testing**: Bundle analysis and optimization

## 📱 App Store Submission

### iOS App Store
- **App Store Connect**: Metadata and screenshots
- **TestFlight**: Beta testing distribution
- **Review Guidelines**: Compliance with Apple guidelines

### Google Play Store
- **Google Play Console**: App listing and distribution
- **Internal Testing**: Alpha and beta testing
- **Review Guidelines**: Compliance with Google policies

## 🔒 Security & Privacy

### Data Protection
- **Local Storage**: All data stored locally
- **No Tracking**: No personal data collection
- **Permissions**: Minimal required permissions
- **Encryption**: Sensitive data encryption

### Legal Compliance
- **Terms of Service**: Comprehensive user agreement
- **Privacy Policy**: GDPR/CCPA compliant privacy policy
- **EULA**: End user license agreement
- **Safety Warnings**: Electrical safety disclaimers

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint and Prettier configurations
2. **Testing**: Write tests for new features
3. **Documentation**: Update documentation for changes
4. **Performance**: Monitor performance impact
5. **Security**: Follow security best practices

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request
5. Address review feedback

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Reference**: Complete API documentation
- **User Guide**: Step-by-step user instructions
- **Developer Guide**: Technical implementation guide
- **FAQ**: Frequently asked questions

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Community discussions and support
- **Wiki**: Community-maintained documentation

## 🔄 Version History

### v2.0.0 (Current)
- Complete UI redesign with modern interface
- Advanced Bluetooth connectivity
- Comprehensive data persistence
- Performance monitoring system
- Extensive testing suite
- Professional documentation

### v1.0.0
- Initial release
- Basic LED control functionality
- Simple Bluetooth connectivity
- Basic UI interface

## 🎯 Roadmap

### Upcoming Features
- **Cloud Sync**: Cross-device data synchronization
- **Voice Control**: Voice-activated LED control
- **AI Effects**: Machine learning-powered effects
- **HomeKit Integration**: Apple HomeKit compatibility
- **Smart Home**: Integration with smart home systems

### Long-term Goals
- **Platform Expansion**: Desktop and web versions
- **Hardware Development**: Custom LED controller hardware
- **Community Features**: User-generated effects and presets
- **Enterprise Features**: Commercial and industrial applications

---

**SmartLED Controller** - Professional LED Control System
Built with ❤️ using React Native and Expo
