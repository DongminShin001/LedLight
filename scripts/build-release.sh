#!/bin/bash

# SmartLED Controller - Release Build Script
# This script helps build production-ready releases for iOS and Android

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   SmartLED Controller - Release Build Script    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Check if platform is specified
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./scripts/build-release.sh [ios|android|both]${NC}"
    echo ""
    echo "Examples:"
    echo "  ./scripts/build-release.sh ios      # Build iOS only"
    echo "  ./scripts/build-release.sh android  # Build Android only"
    echo "  ./scripts/build-release.sh both     # Build both platforms"
    exit 1
fi

PLATFORM=$1

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm $(npm --version)${NC}"
    
    # Check for platform-specific tools
    if [ "$PLATFORM" == "ios" ] || [ "$PLATFORM" == "both" ]; then
        if ! command -v xcodebuild &> /dev/null; then
            echo -e "${RED}❌ Xcode is not installed (required for iOS)${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Xcode installed${NC}"
    fi
    
    if [ "$PLATFORM" == "android" ] || [ "$PLATFORM" == "both" ]; then
        if [ ! -d "$ANDROID_HOME" ]; then
            echo -e "${RED}❌ ANDROID_HOME not set or Android SDK not installed${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Android SDK installed${NC}"
    fi
    
    echo ""
}

# Function to run pre-build checks
pre_build_checks() {
    echo -e "${YELLOW}Running pre-build checks...${NC}"
    
    # Run linter
    echo "Running linter..."
    npm run lint || {
        echo -e "${RED}❌ Linter failed. Please fix errors before building.${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Linter passed${NC}"
    
    # Run tests
    echo "Running tests..."
    npm test || {
        echo -e "${YELLOW}⚠ Tests failed. Continue anyway? (y/n)${NC}"
        read -r response
        if [ "$response" != "y" ]; then
            exit 1
        fi
    }
    echo -e "${GREEN}✓ Tests passed${NC}"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ You have uncommitted changes. Commit before building? (y/n)${NC}"
        read -r response
        if [ "$response" == "y" ]; then
            git status
            echo -e "${YELLOW}Please commit your changes manually and run this script again.${NC}"
            exit 1
        fi
    fi
    
    echo ""
}

# Function to clean build
clean_build() {
    echo -e "${YELLOW}Cleaning previous builds...${NC}"
    
    if [ "$PLATFORM" == "ios" ] || [ "$PLATFORM" == "both" ]; then
        echo "Cleaning iOS..."
        cd ios
        xcodebuild clean || true
        cd ..
    fi
    
    if [ "$PLATFORM" == "android" ] || [ "$PLATFORM" == "both" ]; then
        echo "Cleaning Android..."
        cd android
        ./gradlew clean || true
        cd ..
    fi
    
    echo -e "${GREEN}✓ Clean complete${NC}"
    echo ""
}

# Function to build iOS
build_ios() {
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}       Building iOS Release${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    
    cd ios
    
    # Install pods
    echo "Installing CocoaPods dependencies..."
    pod install || {
        echo -e "${RED}❌ Pod install failed${NC}"
        exit 1
    }
    
    # Build archive
    echo "Building iOS archive..."
    xcodebuild \
        -workspace LedLight.xcworkspace \
        -scheme LedLight \
        -configuration Release \
        -archivePath "build/LedLight.xcarchive" \
        archive || {
        echo -e "${RED}❌ iOS build failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✓ iOS archive created successfully${NC}"
    echo -e "${YELLOW}Archive location: ios/build/LedLight.xcarchive${NC}"
    echo ""
    echo -e "${YELLOW}Next steps for iOS:${NC}"
    echo "1. Open Xcode"
    echo "2. Go to Window → Organizer"
    echo "3. Select your archive"
    echo "4. Click 'Distribute App'"
    echo "5. Choose 'App Store Connect'"
    echo "6. Follow the prompts"
    echo ""
    
    cd ..
}

# Function to build Android APK
build_android() {
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}       Building Android Release${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    
    cd android
    
    echo -e "${YELLOW}What would you like to build?${NC}"
    echo "1. APK (for testing/direct distribution)"
    echo "2. AAB (for Google Play Store)"
    echo "3. Both"
    read -r build_type
    
    if [ "$build_type" == "1" ] || [ "$build_type" == "3" ]; then
        echo "Building APK..."
        ./gradlew assembleRelease || {
            echo -e "${RED}❌ APK build failed${NC}"
            exit 1
        }
        echo -e "${GREEN}✓ APK created successfully${NC}"
        echo -e "${YELLOW}APK location: android/app/build/outputs/apk/release/app-release.apk${NC}"
        echo ""
    fi
    
    if [ "$build_type" == "2" ] || [ "$build_type" == "3" ]; then
        echo "Building AAB..."
        ./gradlew bundleRelease || {
            echo -e "${RED}❌ AAB build failed${NC}"
            exit 1
        }
        echo -e "${GREEN}✓ AAB created successfully${NC}"
        echo -e "${YELLOW}AAB location: android/app/build/outputs/bundle/release/app-release.aab${NC}"
        echo ""
    fi
    
    echo -e "${YELLOW}Next steps for Android:${NC}"
    if [ "$build_type" == "1" ] || [ "$build_type" == "3" ]; then
        echo "APK: Install on device with 'adb install app-release.apk'"
    fi
    if [ "$build_type" == "2" ] || [ "$build_type" == "3" ]; then
        echo "AAB: Upload to Google Play Console"
    fi
    echo ""
    
    cd ..
}

# Function to create release notes
create_release_notes() {
    echo -e "${YELLOW}Creating release notes...${NC}"
    
    VERSION=$(node -p "require('./package.json').version")
    DATE=$(date +"%Y-%m-%d")
    
    cat > RELEASE_NOTES.md <<EOL
# Release Notes - Version $VERSION

**Release Date:** $DATE

## What's New

### Features
- Initial release of SmartLED Controller
- Bluetooth LED device connectivity
- RGB color control with hex color support
- Brightness adjustment (0-100%)
- Multiple LED effects and animations
- Custom preset management
- Professional user interface
- Comprehensive safety warnings
- Legal protection system

### Improvements
- Optimized performance
- Enhanced error handling
- Improved Bluetooth connectivity
- Better user feedback

### Bug Fixes
- Various stability improvements

## Requirements
- iOS 12.0+ or Android 5.0+
- Bluetooth-enabled device
- Compatible LED controller hardware
- Professional electrical installation required

## Safety
⚠️ This app controls electrical devices. All installations must be performed by licensed electricians.

## Known Issues
- None at this time

## Support
For issues or questions:
- GitHub: https://github.com/DongminShin001/LedLight/issues
- Email: support@smartledcontroller.com

---
© 2024 SmartLED Technologies
EOL

    echo -e "${GREEN}✓ Release notes created: RELEASE_NOTES.md${NC}"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    pre_build_checks
    
    echo -e "${YELLOW}Ready to build. Continue? (y/n)${NC}"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Build cancelled."
        exit 0
    fi
    
    clean_build
    
    if [ "$PLATFORM" == "ios" ]; then
        build_ios
    elif [ "$PLATFORM" == "android" ]; then
        build_android
    elif [ "$PLATFORM" == "both" ]; then
        build_ios
        build_android
    else
        echo -e "${RED}Invalid platform: $PLATFORM${NC}"
        exit 1
    fi
    
    create_release_notes
    
    echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║            Build Complete! 🎉                    ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Don't forget to:${NC}"
    echo "1. Test the release build on real devices"
    echo "2. Verify all features work correctly"
    echo "3. Check legal agreement and safety warnings"
    echo "4. Upload to app stores when ready"
    echo ""
}

# Run main function
main

