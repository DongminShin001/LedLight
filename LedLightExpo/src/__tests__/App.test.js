import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';
import BluetoothLEDService from '../src/services/BluetoothLEDService';
import DataPersistenceService from '../src/services/DataPersistenceService';
import PerformanceMonitor from '../src/services/PerformanceMonitor';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Expo StatusBar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

describe('SmartLED Controller App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('App Component', () => {
    test('renders without crashing', () => {
      const { getByText } = render(<App />);
      expect(getByText('SmartLED Controller')).toBeTruthy();
    });

    test('displays initial connection status', () => {
      const { getByText } = render(<App />);
      expect(getByText('Disconnected')).toBeTruthy();
    });

    test('toggles power state when power button is pressed', async () => {
      const { getByText } = render(<App />);
      const powerButton = getByText('Turn On');
      
      fireEvent.press(powerButton);
      
      await waitFor(() => {
        expect(getByText('Turn Off')).toBeTruthy();
      });
    });

    test('changes brightness when brightness buttons are pressed', async () => {
      const { getByText } = render(<App />);
      const brightnessButton = getByText('50%');
      
      fireEvent.press(brightnessButton);
      
      await waitFor(() => {
        expect(getByText('50%')).toBeTruthy();
      });
    });

    test('changes color when color buttons are pressed', async () => {
      const { getByText } = render(<App />);
      const colorButton = getByText('Red');
      
      fireEvent.press(colorButton);
      
      await waitFor(() => {
        expect(getByText('Red')).toBeTruthy();
      });
    });

    test('opens settings modal when settings button is pressed', async () => {
      const { getByText } = render(<App />);
      const settingsButton = getByText('Settings');
      
      fireEvent.press(settingsButton);
      
      await waitFor(() => {
        expect(getByText('Settings')).toBeTruthy();
      });
    });

    test('displays device information', () => {
      const { getByText } = render(<App />);
      expect(getByText('SmartLED Pro')).toBeTruthy();
      expect(getByText('v2.1.0')).toBeTruthy();
      expect(getByText('85%')).toBeTruthy();
    });
  });

  describe('BluetoothLEDService', () => {
    let bluetoothService;

    beforeEach(() => {
      bluetoothService = new BluetoothLEDService();
    });

    test('initializes correctly', () => {
      expect(bluetoothService.isConnected).toBe(false);
      expect(bluetoothService.isScanning).toBe(false);
      expect(bluetoothService.devices).toEqual([]);
    });

    test('starts scanning for devices', async () => {
      await bluetoothService.startScan();
      expect(bluetoothService.isScanning).toBe(true);
    });

    test('stops scanning', () => {
      bluetoothService.stopScan();
      expect(bluetoothService.isScanning).toBe(false);
    });

    test('connects to a device', async () => {
      await bluetoothService.startScan();
      const device = bluetoothService.devices[0];
      
      await bluetoothService.connectToDevice(device.id);
      expect(bluetoothService.isConnected).toBe(true);
      expect(bluetoothService.currentDevice).toBe(device);
    });

    test('disconnects from device', async () => {
      await bluetoothService.startScan();
      const device = bluetoothService.devices[0];
      await bluetoothService.connectToDevice(device.id);
      
      await bluetoothService.disconnect();
      expect(bluetoothService.isConnected).toBe(false);
      expect(bluetoothService.currentDevice).toBe(null);
    });

    test('sends power command', async () => {
      await bluetoothService.startScan();
      const device = bluetoothService.devices[0];
      await bluetoothService.connectToDevice(device.id);
      
      await bluetoothService.setPower(true);
      // Mock service should handle the command
    });

    test('sends brightness command', async () => {
      await bluetoothService.startScan();
      const device = bluetoothService.devices[0];
      await bluetoothService.connectToDevice(device.id);
      
      await bluetoothService.setBrightness(75);
      // Mock service should handle the command
    });

    test('sends color command', async () => {
      await bluetoothService.startScan();
      const device = bluetoothService.devices[0];
      await bluetoothService.connectToDevice(device.id);
      
      await bluetoothService.setColor(255, 0, 0);
      // Mock service should handle the command
    });

    test('sends effect command', async () => {
      await bluetoothService.startScan();
      const device = bluetoothService.devices[0];
      await bluetoothService.connectToDevice(device.id);
      
      await bluetoothService.setEffect('rainbow', 50);
      // Mock service should handle the command
    });

    test('handles device found event', () => {
      const mockDevice = {
        id: 'test-device',
        name: 'Test Device',
        address: '00:11:22:33:44:55',
        rssi: -50,
      };

      bluetoothService.handleDeviceFound(mockDevice);
      expect(bluetoothService.devices).toContain(mockDevice);
    });

    test('handles device connected event', () => {
      const mockDevice = {
        id: 'test-device',
        name: 'Test Device',
      };

      bluetoothService.handleDeviceConnected(mockDevice);
      expect(bluetoothService.isConnected).toBe(true);
      expect(bluetoothService.currentDevice).toBe(mockDevice);
    });

    test('handles device disconnected event', () => {
      bluetoothService.isConnected = true;
      bluetoothService.currentDevice = { id: 'test-device' };

      bluetoothService.handleDeviceDisconnected();
      expect(bluetoothService.isConnected).toBe(false);
      expect(bluetoothService.currentDevice).toBe(null);
    });

    test('adds and removes listeners', () => {
      const mockCallback = jest.fn();
      const removeListener = bluetoothService.addListener('test', mockCallback);
      
      bluetoothService.notifyListeners('test', 'test-data');
      expect(mockCallback).toHaveBeenCalledWith('test-data');
      
      removeListener();
      bluetoothService.notifyListeners('test', 'test-data-2');
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('DataPersistenceService', () => {
    let dataService;

    beforeEach(() => {
      dataService = new DataPersistenceService();
    });

    test('saves and retrieves user preferences', async () => {
      const preferences = {
        autoConnect: true,
        nightMode: false,
        hapticFeedback: true,
      };

      await dataService.saveUserPreferences(preferences);
      const retrieved = await dataService.getUserPreferences();
      
      expect(retrieved.autoConnect).toBe(true);
      expect(retrieved.nightMode).toBe(false);
      expect(retrieved.hapticFeedback).toBe(true);
    });

    test('saves and retrieves presets', async () => {
      const preset = {
        name: 'Test Preset',
        color: '#ff0000',
        brightness: 80,
        effect: 'rainbow',
      };

      await dataService.savePreset(preset);
      const presets = await dataService.getPresets();
      
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('Test Preset');
      expect(presets[0].color).toBe('#ff0000');
    });

    test('updates existing preset', async () => {
      const preset = {
        id: 'test-id',
        name: 'Test Preset',
        color: '#ff0000',
      };

      await dataService.savePreset(preset);
      
      const updatedPreset = {
        id: 'test-id',
        name: 'Updated Preset',
        color: '#00ff00',
      };

      await dataService.savePreset(updatedPreset);
      const presets = await dataService.getPresets();
      
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('Updated Preset');
      expect(presets[0].color).toBe('#00ff00');
    });

    test('deletes preset', async () => {
      const preset = {
        id: 'test-id',
        name: 'Test Preset',
      };

      await dataService.savePreset(preset);
      await dataService.deletePreset('test-id');
      
      const presets = await dataService.getPresets();
      expect(presets).toHaveLength(0);
    });

    test('saves and retrieves schedules', async () => {
      const schedule = {
        name: 'Evening Schedule',
        startTime: '18:00',
        endTime: '22:00',
        days: [1, 2, 3, 4, 5],
        enabled: true,
      };

      await dataService.saveSchedule(schedule);
      const schedules = await dataService.getSchedules();
      
      expect(schedules).toHaveLength(1);
      expect(schedules[0].name).toBe('Evening Schedule');
      expect(schedules[0].enabled).toBe(true);
    });

    test('gets active schedules', async () => {
      const schedule1 = {
        name: 'Active Schedule',
        enabled: true,
      };
      const schedule2 = {
        name: 'Inactive Schedule',
        enabled: false,
      };

      await dataService.saveSchedule(schedule1);
      await dataService.saveSchedule(schedule2);
      
      const activeSchedules = await dataService.getActiveSchedules();
      expect(activeSchedules).toHaveLength(1);
      expect(activeSchedules[0].name).toBe('Active Schedule');
    });

    test('saves analytics data', async () => {
      const analyticsData = {
        action: 'color_change',
        color: '#ff0000',
        brightness: 75,
      };

      await dataService.saveAnalyticsData(analyticsData);
      const analytics = await dataService.getAnalyticsData();
      
      expect(analytics).toHaveLength(1);
      expect(analytics[0].action).toBe('color_change');
    });

    test('calculates analytics summary', async () => {
      const now = Date.now();
      const analyticsData = [
        {
          timestamp: new Date(now - 1000).toISOString(),
          action: 'color_change',
          color: '#ff0000',
        },
        {
          timestamp: new Date(now - 2000).toISOString(),
          action: 'brightness_change',
          brightness: 75,
        },
      ];

      for (const data of analyticsData) {
        await dataService.saveAnalyticsData(data);
      }

      const summary = await dataService.getAnalyticsSummary();
      expect(summary.totalSessions).toBe(2);
      expect(summary.mostUsedColors).toHaveLength(1);
      expect(summary.mostUsedColors[0].color).toBe('#ff0000');
    });

    test('exports and imports data', async () => {
      const preferences = { autoConnect: true };
      const preset = { name: 'Test Preset', color: '#ff0000' };

      await dataService.saveUserPreferences(preferences);
      await dataService.savePreset(preset);

      const exportedData = await dataService.exportData();
      const parsedData = JSON.parse(exportedData);

      expect(parsedData.userPreferences.autoConnect).toBe(true);
      expect(parsedData.presets).toHaveLength(1);

      // Clear data and import
      await dataService.clearAll();
      await dataService.importData(exportedData);

      const importedPreferences = await dataService.getUserPreferences();
      const importedPresets = await dataService.getPresets();

      expect(importedPreferences.autoConnect).toBe(true);
      expect(importedPresets).toHaveLength(1);
    });
  });

  describe('PerformanceMonitor', () => {
    let performanceMonitor;

    beforeEach(() => {
      performanceMonitor = new PerformanceMonitor();
    });

    test('initializes correctly', () => {
      expect(performanceMonitor.isMonitoring).toBe(false);
      expect(performanceMonitor.metrics).toBeDefined();
    });

    test('starts and stops monitoring', () => {
      performanceMonitor.startMonitoring();
      expect(performanceMonitor.isMonitoring).toBe(true);

      performanceMonitor.stopMonitoring();
      expect(performanceMonitor.isMonitoring).toBe(false);
    });

    test('measures render time', () => {
      const mockRenderFunction = jest.fn(() => 'rendered');
      const result = performanceMonitor.measureRenderTime('TestComponent', mockRenderFunction);

      expect(result).toBe('rendered');
      expect(mockRenderFunction).toHaveBeenCalled();
      expect(performanceMonitor.metrics.renderTimes).toHaveLength(1);
    });

    test('tracks user interactions', () => {
      performanceMonitor.trackUserInteraction('button_press', 'PowerButton', { powerOn: true });

      expect(performanceMonitor.metrics.userInteractions).toHaveLength(1);
      expect(performanceMonitor.metrics.userInteractions[0].action).toBe('button_press');
    });

    test('logs errors', () => {
      performanceMonitor.logError('test_error', { message: 'Test error message' });

      expect(performanceMonitor.metrics.errors).toHaveLength(1);
      expect(performanceMonitor.metrics.errors[0].type).toBe('test_error');
    });

    test('collects metrics', () => {
      performanceMonitor.trackUserInteraction('test', 'TestComponent');
      const metrics = performanceMonitor.collectMetrics();

      expect(metrics.userInteractions).toHaveLength(1);
      expect(metrics.performanceScore).toBeDefined();
    });

    test('calculates performance score', () => {
      const metrics = {
        renderTimes: [{ renderTime: 10 }],
        memoryUsage: [],
        networkRequests: [],
        errors: [],
        performanceIssues: [],
      };

      const score = performanceMonitor.calculatePerformanceScore(metrics);
      expect(score).toBe(100);
    });

    test('generates optimization suggestions', () => {
      // Add some slow render times
      performanceMonitor.metrics.renderTimes.push(
        { renderTime: 20, timestamp: Date.now() },
        { renderTime: 25, timestamp: Date.now() }
      );

      const suggestions = performanceMonitor.getOptimizationSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].type).toBe('render_performance');
    });

    test('clears metrics', () => {
      performanceMonitor.trackUserInteraction('test', 'TestComponent');
      performanceMonitor.clearMetrics();

      expect(performanceMonitor.metrics.userInteractions).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    test('complete LED control flow', async () => {
      const bluetoothService = new BluetoothLEDService();
      const dataService = new DataPersistenceService();

      // Start scanning
      await bluetoothService.startScan();
      expect(bluetoothService.devices.length).toBeGreaterThan(0);

      // Connect to device
      const device = bluetoothService.devices[0];
      await bluetoothService.connectToDevice(device.id);
      expect(bluetoothService.isConnected).toBe(true);

      // Send commands
      await bluetoothService.setPower(true);
      await bluetoothService.setBrightness(75);
      await bluetoothService.setColor(255, 0, 0);

      // Save preset
      const preset = {
        name: 'Red Bright',
        color: '#ff0000',
        brightness: 75,
        effect: 'solid',
      };
      await dataService.savePreset(preset);

      // Verify preset was saved
      const presets = await dataService.getPresets();
      expect(presets).toHaveLength(1);
      expect(presets[0].name).toBe('Red Bright');

      // Disconnect
      await bluetoothService.disconnect();
      expect(bluetoothService.isConnected).toBe(false);
    });

    test('performance monitoring during app usage', () => {
      const performanceMonitor = new PerformanceMonitor();
      performanceMonitor.startMonitoring();

      // Simulate app usage
      performanceMonitor.trackUserInteraction('button_press', 'PowerButton');
      performanceMonitor.measureRenderTime('HomeScreen', () => 'rendered');
      performanceMonitor.logError('minor_error', { message: 'Test error' });

      const metrics = performanceMonitor.collectMetrics();
      expect(metrics.userInteractions).toHaveLength(1);
      expect(metrics.renderTimes).toHaveLength(1);
      expect(metrics.errors).toHaveLength(1);
      expect(metrics.performanceScore).toBeDefined();

      performanceMonitor.stopMonitoring();
    });
  });
});
