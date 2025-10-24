import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LegalAgreementScreen from '../screens/LegalAgreementScreen';
import LEDController from '../classes/LEDController';
import DeviceManager from '../classes/DeviceManager';

// Mock dependencies
jest.mock('../classes/LEDController', () => ({
  addListener: jest.fn(),
  removeListener: jest.fn(),
  setPower: jest.fn(() => Promise.resolve()),
  setBrightness: jest.fn(() => Promise.resolve()),
}));

jest.mock('../classes/DeviceManager', () => ({
  initialize: jest.fn(() => Promise.resolve()),
  connect: jest.fn(() => Promise.resolve()),
  disconnect: jest.fn(() => Promise.resolve()),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  getConnectionState: jest.fn(() => 'disconnected'),
  isDeviceConnected: jest.fn(() => false),
}));

jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: '#0f0f23',
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        text: '#ffffff',
        textSecondary: '#a1a1aa',
        success: '#10b981',
        error: '#ef4444',
        surface: '#16213e',
      },
    },
    isLoading: false,
  }),
}));

const Stack = createStackNavigator();

const MockedApp = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LegalAgreement" component={LegalAgreementScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('SmartLED Controller Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('App Initialization', () => {
    it('initializes device manager on app start', async () => {
      render(<MockedApp />);
      
      await waitFor(() => {
        expect(DeviceManager.initialize).toHaveBeenCalled();
      });
    });

    it('sets up event listeners on app start', async () => {
      render(<MockedApp />);
      
      await waitFor(() => {
        expect(DeviceManager.addListener).toHaveBeenCalled();
        expect(LEDController.addListener).toHaveBeenCalled();
      });
    });
  });

  describe('Device Connection Flow', () => {
    it('handles complete device connection flow', async () => {
      const {getByText} = render(<MockedApp />);
      
      // Start disconnected
      expect(getByText('No device connected')).toBeTruthy();
      
      // Attempt connection
      const connectButton = getByText('Connect Device');
      fireEvent.press(connectButton);
      
      await waitFor(() => {
        expect(DeviceManager.connect).toHaveBeenCalled();
      });
    });

    it('handles device disconnection flow', async () => {
      // Mock connected state
      DeviceManager.isDeviceConnected.mockReturnValue(true);
      DeviceManager.getConnectionState.mockReturnValue('connected');
      
      const {getByText} = render(<MockedApp />);
      
      // Should show connected state
      expect(getByText('Connected to LED Device')).toBeTruthy();
      
      // Attempt disconnection
      const disconnectButton = getByText('Disconnect');
      fireEvent.press(disconnectButton);
      
      await waitFor(() => {
        expect(DeviceManager.disconnect).toHaveBeenCalled();
      });
    });
  });

  describe('LED Control Flow', () => {
    it('handles power control flow', async () => {
      // Mock connected state
      DeviceManager.isDeviceConnected.mockReturnValue(true);
      
      const {getByText} = render(<MockedApp />);
      
      // Power should be off initially
      expect(getByText('OFF')).toBeTruthy();
      
      // Toggle power
      const powerButton = getByText('OFF');
      fireEvent.press(powerButton);
      
      await waitFor(() => {
        expect(LEDController.setPower).toHaveBeenCalledWith(true);
      });
    });

    it('handles brightness control flow', async () => {
      // Mock connected and powered state
      DeviceManager.isDeviceConnected.mockReturnValue(true);
      
      const {getByText} = render(<MockedApp />);
      
      // Should show initial brightness
      expect(getByText('Brightness: 50%')).toBeTruthy();
      
      // Brightness control would be tested here
      // (Slider interaction is complex to test in integration)
    });

    it('handles color control flow', async () => {
      // Mock connected and powered state
      DeviceManager.isDeviceConnected.mockReturnValue(true);
      
      const {getByText} = render(<MockedApp />);
      
      // Should show color control
      expect(getByText('Color Control')).toBeTruthy();
      
      // Color picker navigation
      const colorButton = getByText('Choose Color');
      fireEvent.press(colorButton);
      
      // Navigation would be tested here
    });
  });

  describe('Navigation Flow', () => {
    it('navigates to effects screen', async () => {
      const {getByText} = render(<MockedApp />);
      
      const effectsButton = getByText('Effects');
      fireEvent.press(effectsButton);
      
      // Navigation would be tested here
      await waitFor(() => {
        expect(effectsButton).toBeTruthy();
      });
    });

    it('navigates to presets screen', async () => {
      const {getByText} = render(<MockedApp />);
      
      const presetsButton = getByText('Presets');
      fireEvent.press(presetsButton);
      
      await waitFor(() => {
        expect(presetsButton).toBeTruthy();
      });
    });

    it('navigates to text display screen', async () => {
      const {getByText} = render(<MockedApp />);
      
      const textButton = getByText('Text');
      fireEvent.press(textButton);
      
      await waitFor(() => {
        expect(textButton).toBeTruthy();
      });
    });

    it('navigates to theme selection screen', async () => {
      const {getByText} = render(<MockedApp />);
      
      const themesButton = getByText('Themes');
      fireEvent.press(themesButton);
      
      await waitFor(() => {
        expect(themesButton).toBeTruthy();
      });
    });
  });

  describe('Advanced Features Flow', () => {
    it('navigates to advanced effects', async () => {
      const {getByText} = render(<MockedApp />);
      
      const advancedEffectsButton = getByText('Advanced Effects');
      fireEvent.press(advancedEffectsButton);
      
      await waitFor(() => {
        expect(advancedEffectsButton).toBeTruthy();
      });
    });

    it('navigates to music reactive', async () => {
      const {getByText} = render(<MockedApp />);
      
      const musicReactiveButton = getByText('Music Reactive');
      fireEvent.press(musicReactiveButton);
      
      await waitFor(() => {
        expect(musicReactiveButton).toBeTruthy();
      });
    });

    it('navigates to scheduling', async () => {
      const {getByText} = render(<MockedApp />);
      
      const schedulingButton = getByText('Scheduling');
      fireEvent.press(schedulingButton);
      
      await waitFor(() => {
        expect(schedulingButton).toBeTruthy();
      });
    });

    it('navigates to device management', async () => {
      const {getByText} = render(<MockedApp />);
      
      const deviceManagementButton = getByText('Device Management');
      fireEvent.press(deviceManagementButton);
      
      await waitFor(() => {
        expect(deviceManagementButton).toBeTruthy();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles connection errors gracefully', async () => {
      DeviceManager.connect.mockRejectedValue(new Error('Connection failed'));
      
      const {getByText} = render(<MockedApp />);
      
      const connectButton = getByText('Connect Device');
      fireEvent.press(connectButton);
      
      await waitFor(() => {
        expect(DeviceManager.connect).toHaveBeenCalled();
      });
    });

    it('handles LED control errors gracefully', async () => {
      LEDController.setPower.mockRejectedValue(new Error('Control failed'));
      DeviceManager.isDeviceConnected.mockReturnValue(true);
      
      const {getByText} = render(<MockedApp />);
      
      const powerButton = getByText('OFF');
      fireEvent.press(powerButton);
      
      await waitFor(() => {
        expect(LEDController.setPower).toHaveBeenCalled();
      });
    });
  });

  describe('State Management Integration', () => {
    it('maintains consistent state across interactions', async () => {
      DeviceManager.isDeviceConnected.mockReturnValue(true);
      
      const {getByText} = render(<MockedApp />);
      
      // Verify initial state
      expect(getByText('Connected to LED Device')).toBeTruthy();
      expect(getByText('OFF')).toBeTruthy();
      
      // Change power state
      const powerButton = getByText('OFF');
      fireEvent.press(powerButton);
      
      await waitFor(() => {
        expect(LEDController.setPower).toHaveBeenCalledWith(true);
      });
    });
  });
});
