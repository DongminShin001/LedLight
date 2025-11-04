# SmartLED Controller

<div align="center">

![SmartLED Logo](https://via.placeholder.com/200x200.png/00ff88/000000?text=SmartLED)

**Professional LED Lighting Control via Bluetooth**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React_Native-0.72.6-61DAFB.svg)](https://reactnative.dev/)
[![iOS](https://img.shields.io/badge/iOS-12.0+-000000.svg)](https://www.apple.com/ios/)
[![Android](https://img.shields.io/badge/Android-5.0+-3DDC84.svg)](https://www.android.com/)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Safety](#safety) • [License](#license)

</div>

---

## 🎯 Overview

SmartLED Controller is a professional-grade mobile application for controlling LED lighting devices via Bluetooth. Designed for both smart home enthusiasts and commercial lighting professionals, it provides comprehensive control over RGB LED systems with an intuitive interface and robust safety features.

### ✨ Key Highlights

- 🔌 **Bluetooth LED Control** - Wireless control of compatible LED devices
- 🎨 **Full RGB Color Picker** - Precise color selection with hex support
- 💡 **Brightness Control** - Smooth 0-100% brightness adjustment
- ✨ **Multiple Effects** - Rainbow, breathing, strobe, and custom animations
- 💾 **Custom Presets** - Save and manage favorite lighting configurations
- 🛡️ **Comprehensive Safety** - Multiple warnings and legal protections
- 📱 **Modern UI** - Beautiful, responsive interface with dark theme
- ⚡ **High Performance** - Optimized for smooth operation

---

## 📱 Features

### Core Functionality

#### LED Device Control
- **Bluetooth Connectivity**: Discover and connect to LED controllers
- **Real-time Control**: Instant response to color and brightness changes
- **Multiple Device Support**: Manage multiple LED devices
- **Connection Management**: Auto-reconnect and connection status monitoring

#### Color Management
- **RGB Color Picker**: Full spectrum color selection
- **Hex Color Input**: Direct hex code entry
- **Color Presets**: Quick access to common colors
- **Color History**: Remember recently used colors

#### Lighting Effects
- **Rainbow**: Smooth spectrum cycling
- **Breathing**: Gentle fade in/out
- **Strobe**: Adjustable flash rate
- **Fade**: Smooth color transitions
- **Custom Effects**: Create your own patterns

#### Advanced Features
- **Schedules**: Set automatic on/off times
- **Music Reactive**: Sync lights to music (coming soon)
- **Device Groups**: Control multiple devices together
- **Text Display**: Show scrolling text on LED matrices

### Safety Features

#### Electrical Safety
- ⚠️ **Professional Installation Required** - All installations must be performed by licensed electricians
- 🔐 **Safety Warnings** - Multiple confirmations before device control
- 📋 **Legal Protections** - Comprehensive terms and liability protections
- 🚨 **Emergency Procedures** - Clear instructions for hazardous situations

#### App Security
- 🔒 **Secure Connections** - Bluetooth pairing security
- 🛡️ **Input Validation** - All commands validated before sending
- 📊 **Error Handling** - Comprehensive error management
- 🔍 **Permission Management** - Proper Bluetooth permission handling

---

## 🚀 Installation

### Prerequisites

**For Users:**
- iOS 12.0+ or Android 5.0+
- Bluetooth-enabled device
- Compatible LED controller hardware
- **Licensed electrician for installation**

**For Developers:**
- Node.js 16+ and npm 8+
- React Native CLI
- Xcode 12+ (for iOS development)
- Android Studio (for Android development)

### User Installation

#### iOS (App Store)
```bash
# Coming soon to App Store
# Search for "SmartLED Controller"
```

#### Android (Google Play)
```bash
# Coming soon to Google Play
# Search for "SmartLED Controller"
```

### Developer Setup

```bash
# Clone the repository
git clone https://github.com/DongminShin001/LedLight.git
cd LedLight

# Install dependencies
npm install

# iOS: Install pods
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 📖 Usage

### First-Time Setup

1. **Accept Legal Agreement**
   - Read and accept Terms of Service on first launch
   - Review safety warnings carefully
   - Confirm professional installation

2. **Enable Bluetooth**
   - Grant Bluetooth permissions
   - Enable Bluetooth on your device
   - Ensure LED controller is powered on

3. **Connect to Device**
   - Tap "Connect Device" on home screen
   - Select your LED controller from the list
   - Wait for connection confirmation

### Basic Operations

#### Turning On/Off
```
1. Open app
2. Ensure device is connected
3. Read safety confirmation
4. Tap the power button
5. Confirm action
```

#### Changing Colors
```
1. Tap "Choose Color" button
2. Select color from picker
3. Or enter hex code directly
4. Changes apply immediately
```

#### Adjusting Brightness
```
1. Use brightness slider
2. Drag to desired level (0-100%)
3. Changes apply in real-time
```

#### Applying Effects
```
1. Navigate to "Effects" tab
2. Browse available effects
3. Tap to apply
4. Adjust speed/intensity as needed
```

#### Saving Presets
```
1. Configure desired settings
2. Navigate to "Presets" tab
3. Tap "Save Preset"
4. Name and save
```

---

## ⚡ Safety Information

### 🚨 CRITICAL WARNINGS

**THIS APP CONTROLS ELECTRICAL DEVICES**

Improper use can cause:
- **FIRE**
- **ELECTRIC SHOCK**
- **PROPERTY DAMAGE**
- **PERSONAL INJURY**
- **DEATH**

### ✅ Requirements

**BEFORE USING THIS APP:**

1. ✓ All LED installations performed by **licensed electricians**
2. ✓ All work complies with **local electrical codes**
3. ✓ Proper **circuit protection** installed
4. ✓ Equipment within **rated specifications**
5. ✓ Regular **inspections** performed

### 🚫 Prohibited Uses

**DO NOT USE FOR:**
- Medical devices or life-support systems
- Safety-critical applications (emergency lighting)
- Any use where failure could cause injury/death
- Installations not approved by professionals

### 🆘 Emergency Procedures

**IMMEDIATELY DISCONNECT POWER IF:**
- Smoke or burning smell
- Unusual heat
- Sparking or arcing
- Physical damage
- Water exposure

**IN CASE OF FIRE: CALL 911**

---

## 🏗️ Technical Architecture

### Design Patterns

The app implements professional OOP and design patterns:

- **Factory Pattern**: Screen and navigation creation
- **Observer Pattern**: Theme and event management
- **Strategy Pattern**: Effect algorithms
- **Command Pattern**: LED control commands
- **Singleton Pattern**: Device and theme managers
- **Repository Pattern**: Data persistence
- **Chain of Responsibility**: Error handling

### Tech Stack

- **Framework**: React Native 0.72.6
- **Navigation**: React Navigation 6.x
- **State Management**: React hooks + Context
- **Bluetooth**: react-native-bluetooth-classic
- **Storage**: AsyncStorage
- **UI Components**: react-native-linear-gradient, react-native-vector-icons
- **Testing**: Jest + React Native Testing Library

### Project Structure

```
src/
├── App.js                 # Main app entry
├── classes/               # Core business logic
│   ├── LEDController.js   # LED device control
│   ├── DeviceManager.js   # Bluetooth device management
│   └── ColorManager.js    # Color manipulation
├── components/            # Reusable UI components
│   ├── SafetyDisclaimer.js
│   └── SplashScreen.js
├── screens/               # App screens
│   ├── HomeScreen.js
│   ├── LegalAgreementScreen.js
│   └── [other screens]
├── services/              # External services
│   ├── BluetoothService.js
│   └── AnalyticsManager.js
├── theme/                 # Theming system
├── utils/                 # Utilities
└── patterns/              # Design pattern implementations
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Test Coverage

- Unit Tests: 80%+ coverage
- Integration Tests: Core flows covered
- E2E Tests: Critical user journeys

---

## 🔒 Privacy & Legal

### Privacy
- **Minimal data collection** - Only what's needed for functionality
- **Local storage** - Data stays on your device
- **No data selling** - We never sell your information
- **GDPR/CCPA compliant** - Full privacy rights

[Read Full Privacy Policy](LEGAL/UPDATED_PRIVACY_POLICY.md)

### Legal Protection
- **Zero liability** - Developers not responsible for damages
- **No warranties** - App provided "AS IS"
- **Arbitration** - Disputes resolved through arbitration
- **User responsibility** - You accept all risks

[Read Full Terms of Service](LEGAL/UPDATED_TERMS_OF_SERVICE.md)

---

## 🛠️ Development

### Build for Production

#### iOS
```bash
# Build release
cd ios
xcodebuild -workspace LedLight.xcworkspace \
  -scheme LedLight \
  -configuration Release \
  -archivePath LedLight.xcarchive archive
```

#### Android
```bash
# Build APK
cd android
./gradlew assembleRelease

# Build AAB (for Play Store)
./gradlew bundleRelease
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Security check
npm run security-check

# Type check
npm run type-check
```

---

## 📦 Dependencies

### Main Dependencies
- `react-native`: ^0.72.6
- `@react-navigation/native`: ^6.1.9
- `react-native-bluetooth-classic`: ^1.60.0-rc.5
- `react-native-linear-gradient`: ^2.8.3
- `@react-native-async-storage/async-storage`: ^1.19.0

### See full list in `package.json`

---

## 🤝 Contributing

We welcome contributions! However, due to the safety-critical nature of this app, all contributions must be carefully reviewed.

### Guidelines
1. **Safety First** - Never compromise safety features
2. **Code Quality** - Follow existing patterns and standards
3. **Testing** - Include tests for new features
4. **Documentation** - Update docs for changes

### Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit pull request
6. Wait for review

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
All third-party libraries are properly licensed. See `package.json` for details.

---

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and [LEGAL/](LEGAL/) folder
- **Issues**: [GitHub Issues](https://github.com/DongminShin001/LedLight/issues)
- **Email**: support@smartledcontroller.com (coming soon)

### FAQ

**Q: What LED controllers are compatible?**  
A: Currently supports Bluetooth Classic LED controllers. Check your device specifications.

**Q: Do I need an electrician?**  
A: **YES**. All electrical installations must be performed by licensed electricians.

**Q: Is the app free?**  
A: Yes, the app is free to download and use.

**Q: What if something goes wrong?**  
A: Immediately disconnect power and call a licensed electrician. Do not attempt repairs yourself.

**Q: Can I use this for commercial purposes?**  
A: Yes, but ensure all installations meet commercial electrical codes and regulations.

---

## 🗺️ Roadmap

### Version 1.0 (Current)
- ✅ Bluetooth LED control
- ✅ RGB color picker
- ✅ Multiple effects
- ✅ Custom presets
- ✅ Safety features

### Version 1.1 (Planned)
- 🔲 Music reactive mode
- 🔲 Additional effects
- 🔲 Cloud sync
- 🔲 Widget support

### Version 2.0 (Future)
- 🔲 Matter protocol support
- 🔲 HomeKit integration
- 🔲 Voice control
- 🔲 Automation scenes

---

## 👥 Team

**SmartLED Technologies**

- Main Developer: [DongminShin001](https://github.com/DongminShin001)

---

## 🙏 Acknowledgments

- React Native Community
- Open Source Contributors
- Beta Testers
- Electrical Safety Professionals

---

## ⚠️ Disclaimer

**THIS APP CONTROLS ELECTRICAL DEVICES. USE AT YOUR OWN RISK.**

The developers are NOT responsible for:
- Property damage
- Personal injury
- Fire or electrical hazards
- Any other damages

**YOU ACCEPT ALL RISKS BY USING THIS APP.**

See [LEGAL/LIABILITY_DISCLAIMER.md](LEGAL/LIABILITY_DISCLAIMER.md) for complete disclaimer.

---

<div align="center">

Made with ⚡ by SmartLED Technologies

**[Get Started](#installation)** • **[Report Bug](https://github.com/DongminShin001/LedLight/issues)** • **[Request Feature](https://github.com/DongminShin001/LedLight/issues)**

© 2024 SmartLED Technologies. All Rights Reserved.

</div>
