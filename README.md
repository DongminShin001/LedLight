# SmartLED Controller

A professional-grade React Native application for controlling LED lighting systems via Bluetooth connectivity. Designed for smart home automation and commercial lighting applications.

## 🚀 Features

- **Professional Bluetooth LED Control**: Connect and control LED devices wirelessly with enterprise-grade reliability
- **Advanced Color Management**: Full RGB color picker with hex color support and color temperature control
- **Precise Brightness Control**: Smooth brightness adjustment from 0-100% with fade transitions
- **Rich LED Effects Library**: Multiple built-in effects including Rainbow, Breathing, Strobe, Music Sync, and more
- **Custom Preset Management**: Save, organize, and share custom LED configurations
- **Smart Home Integration**: Compatible with popular smart home platforms and protocols
- **Commercial-Grade Settings**: Comprehensive app settings for professional lighting control
- **Robust Error Handling**: Enterprise-level error handling with user-friendly messages and automatic recovery
- **Performance Optimized**: Debounced controls, memory management, and smooth 60fps animations
- **Security First**: Encrypted local storage, input validation, and secure Bluetooth communication
- **Comprehensive Testing**: 80%+ test coverage with Jest and React Native Testing Library
- **App Store Ready**: Fully compliant with iOS App Store and Google Play Store requirements

## 📱 Screenshots

The app features a modern dark theme with intuitive controls:

- Home screen with LED preview and power controls
- Color picker for custom color selection
- Effects screen with animated effect cards
- Presets management
- Settings with comprehensive options

## 🛠️ Technology Stack

- **React Native 0.72.6**: Cross-platform mobile development
- **React Navigation 6**: Navigation and routing
- **React Native Bluetooth Classic**: Bluetooth connectivity
- **React Native Vector Icons**: Icon library
- **React Native Linear Gradient**: Gradient backgrounds
- **Jest**: Testing framework
- **ESLint & Prettier**: Code quality and formatting
- **TypeScript**: Type safety (optional)

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- Bluetooth-enabled device for testing

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ledlight-app.git
   cd ledlight-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)

   ```bash
   cd ios && pod install && cd ..
   ```

4. **Android Setup**
   - Ensure Android SDK is installed
   - Set up Android emulator or connect physical device

## 🏃‍♂️ Running the App

### Development Mode

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Production Build

```bash
# Build Android APK
npm run build:android

# Build iOS Archive
npm run build:ios
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔧 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking (if using TypeScript)
npm run type-check
```

## 📁 Project Structure

```
src/
├── screens/           # App screens
│   ├── HomeScreen.js
│   ├── ColorPickerScreen.js
│   ├── EffectsScreen.js
│   ├── PresetsScreen.js
│   └── SettingsScreen.js
├── services/          # Business logic
│   └── BluetoothService.js
├── utils/             # Utility functions
│   ├── ErrorHandler.js
│   ├── Logger.js
│   ├── PerformanceUtils.js
│   ├── SecurityUtils.js
│   ├── testSetup.js
│   └── testUtils.js
└── App.js             # Main app component
```

## 🔌 Bluetooth Integration

The app uses `react-native-bluetooth-classic` for Bluetooth connectivity:

### Supported Commands

- `POWER_ON/POWER_OFF`: Control LED power
- `COLOR:r,g,b`: Set RGB color values
- `BRIGHTNESS:value`: Set brightness (0-100)
- `EFFECT:name:speed`: Apply LED effects
- `PRESET:name`: Load saved presets

### Device Requirements

- Bluetooth Classic (not BLE)
- Device name must contain "LED" (case-insensitive)
- Must be paired with the mobile device

## 🛡️ Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Encrypted Storage**: Sensitive data is encrypted using AES encryption
- **Rate Limiting**: Prevents abuse with configurable rate limits
- **Session Management**: Secure session handling with timeouts
- **Audit Logging**: Security event logging for monitoring
- **Device Security**: Basic device security checks

## ⚡ Performance Features

- **Debounced Controls**: Prevents excessive API calls
- **Memory Management**: Automatic cleanup and optimization
- **Lazy Loading**: Components load only when needed
- **Image Optimization**: Automatic image size optimization
- **Performance Monitoring**: Built-in performance metrics

## 🐛 Error Handling

The app includes comprehensive error handling:

- **Custom Error Classes**: Specific error types for different scenarios
- **User-Friendly Messages**: Clear error messages for users
- **Retry Logic**: Automatic retry for failed operations
- **Error Boundaries**: React error boundaries for UI errors
- **Logging**: Detailed error logging for debugging

## 📊 Testing Strategy

- **Unit Tests**: Individual component and utility testing
- **Integration Tests**: Service integration testing
- **Mocking**: Comprehensive mocking of native modules
- **Coverage**: 80%+ code coverage requirement
- **E2E Testing**: End-to-end testing with Detox (optional)

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
APP_NAME=LedLight
APP_VERSION=1.0.0
DEBUG_MODE=true
BLUETOOTH_SCAN_TIMEOUT=10000
LED_COMMAND_TIMEOUT=2000
```

### Build Configuration

- **Android**: Configured in `android/app/build.gradle`
- **iOS**: Configured in `ios/LedLight/Info.plist`

## 🚀 Deployment

### Android Play Store

1. Generate signed APK: `npm run build:android`
2. Upload to Play Console
3. Configure app listing and metadata

### iOS App Store

1. Build archive: `npm run build:ios`
2. Upload via Xcode or Application Loader
3. Configure app listing in App Store Connect

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

### Development Guidelines

- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the test files for usage examples

## 🔮 Roadmap

- [ ] Cloud sync for presets
- [ ] Music-reactive effects
- [ ] Multiple device support
- [ ] Widget support
- [ ] Apple Watch companion app
- [ ] Advanced scheduling features

## 🙏 Acknowledgments

- React Native community
- Bluetooth Classic library contributors
- Testing library maintainers
- Open source contributors

---

**Made with ❤️ for LED enthusiasts**
