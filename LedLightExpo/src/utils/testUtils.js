/**
 * Test utilities and helpers
 */

import {render} from '@testing-library/react-native';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

// Custom render function that includes navigation context
export const renderWithNavigation = (component, options = {}) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>,
    options
  );
};

// Mock device data for testing
export const mockDevices = [
  {
    id: 'device1',
    name: 'LED Strip 1',
    address: '00:11:22:33:44:55',
  },
  {
    id: 'device2',
    name: 'LED Panel 2',
    address: '00:11:22:33:44:66',
  },
];

// Mock Bluetooth service responses
export const mockBluetoothResponses = {
  isBluetoothEnabled: true,
  bondedDevices: mockDevices,
  connectionSuccess: true,
  commandSuccess: true,
};

// Helper to create mock functions with default implementations
export const createMockFunction = (defaultReturn = undefined) => {
  const mockFn = jest.fn();
  if (defaultReturn !== undefined) {
    mockFn.mockReturnValue(defaultReturn);
  }
  return mockFn;
};

// Wait for async operations
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// Test data generators
export const generateTestColor = () => {
  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateTestBrightness = () => Math.floor(Math.random() * 101);

export const generateTestEffect = () => {
  const effects = ['rainbow', 'breathing', 'strobe', 'wave', 'fire', 'aurora'];
  return effects[Math.floor(Math.random() * effects.length)];
};
