/**
 * BluetoothService Tests
 */

import BluetoothService from '../services/BluetoothService';
import {
  BluetoothError,
  DeviceConnectionError,
  PermissionError,
  CommandError,
  ValidationError,
} from '../utils/ErrorHandler';
import BluetoothClassic from 'react-native-bluetooth-classic';
import {PermissionsAndroid, Platform} from 'react-native';
import {mockDevices, mockBluetoothResponses} from '../utils/testUtils';

// Mock the dependencies
jest.mock('react-native-bluetooth-classic');
jest.mock('react-native', () => ({
  PermissionsAndroid: {
    requestMultiple: jest.fn(),
    PERMISSIONS: {
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
  },
  Platform: {
    OS: 'android',
  },
}));

describe('BluetoothService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset service state
    BluetoothService.isConnected = false;
    BluetoothService.device = null;
    BluetoothService.listeners = [];
  });

  describe('requestPermissions', () => {
    it('should request permissions on Android', async () => {
      PermissionsAndroid.requestMultiple.mockResolvedValue({
        'android.permission.BLUETOOTH_SCAN': 'granted',
        'android.permission.BLUETOOTH_CONNECT': 'granted',
        'android.permission.ACCESS_FINE_LOCATION': 'granted',
      });

      const result = await BluetoothService.requestPermissions();

      expect(result).toBe(true);
      expect(PermissionsAndroid.requestMultiple).toHaveBeenCalledWith([
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
        'android.permission.ACCESS_FINE_LOCATION',
      ]);
    });

    it('should throw PermissionError when permissions are denied', async () => {
      PermissionsAndroid.requestMultiple.mockResolvedValue({
        'android.permission.BLUETOOTH_SCAN': 'denied',
        'android.permission.BLUETOOTH_CONNECT': 'granted',
        'android.permission.ACCESS_FINE_LOCATION': 'granted',
      });

      await expect(BluetoothService.requestPermissions()).rejects.toThrow(PermissionError);
    });

    it('should return true on iOS without requesting permissions', async () => {
      Platform.OS = 'ios';
      
      const result = await BluetoothService.requestPermissions();
      
      expect(result).toBe(true);
      expect(PermissionsAndroid.requestMultiple).not.toHaveBeenCalled();
    });
  });

  describe('enableBluetooth', () => {
    it('should enable Bluetooth when disabled', async () => {
      BluetoothClassic.isBluetoothEnabled.mockResolvedValueOnce(false);
      BluetoothClassic.isBluetoothEnabled.mockResolvedValueOnce(true);
      BluetoothClassic.requestBluetoothEnabled.mockResolvedValue();

      const result = await BluetoothService.enableBluetooth();

      expect(result).toBe(true);
      expect(BluetoothClassic.requestBluetoothEnabled).toHaveBeenCalled();
    });

    it('should return true when Bluetooth is already enabled', async () => {
      BluetoothClassic.isBluetoothEnabled.mockResolvedValue(true);

      const result = await BluetoothService.enableBluetooth();

      expect(result).toBe(true);
      expect(BluetoothClassic.requestBluetoothEnabled).not.toHaveBeenCalled();
    });

    it('should throw BluetoothError when enabling fails', async () => {
      BluetoothClassic.isBluetoothEnabled.mockResolvedValue(false);
      BluetoothClassic.requestBluetoothEnabled.mockRejectedValue(new Error('User denied'));

      await expect(BluetoothService.enableBluetooth()).rejects.toThrow(BluetoothError);
    });
  });

  describe('getPairedDevices', () => {
    it('should return LED devices from paired devices', async () => {
      const allDevices = [
        ...mockDevices,
        {id: 'other1', name: 'Other Device'},
        {id: 'other2', name: 'Another Device'},
      ];
      
      BluetoothClassic.getBondedDevices.mockResolvedValue(allDevices);

      const result = await BluetoothService.getPairedDevices();

      expect(result).toEqual(mockDevices);
      expect(BluetoothClassic.getBondedDevices).toHaveBeenCalled();
    });

    it('should throw BluetoothError when getting devices fails', async () => {
      BluetoothClassic.getBondedDevices.mockRejectedValue(new Error('Bluetooth error'));

      await expect(BluetoothService.getPairedDevices()).rejects.toThrow(BluetoothError);
    });
  });

  describe('connectToDevice', () => {
    it('should connect to device successfully', async () => {
      const device = mockDevices[0];
      BluetoothClassic.connectToDevice.mockResolvedValue();

      const result = await BluetoothService.connectToDevice(device);

      expect(result).toBe(true);
      expect(BluetoothService.isConnected).toBe(true);
      expect(BluetoothService.device).toBe(device);
      expect(BluetoothClassic.connectToDevice).toHaveBeenCalledWith(device.id);
    });

    it('should throw ValidationError for invalid device', async () => {
      await expect(BluetoothService.connectToDevice(null)).rejects.toThrow(ValidationError);
      await expect(BluetoothService.connectToDevice({})).rejects.toThrow(ValidationError);
    });

    it('should retry connection on failure', async () => {
      const device = mockDevices[0];
      BluetoothClassic.connectToDevice
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce();

      const result = await BluetoothService.connectToDevice(device);

      expect(result).toBe(true);
      expect(BluetoothClassic.connectToDevice).toHaveBeenCalledTimes(3);
    });

    it('should throw DeviceConnectionError after max retries', async () => {
      const device = mockDevices[0];
      BluetoothClassic.connectToDevice.mockRejectedValue(new Error('Connection failed'));

      await expect(BluetoothService.connectToDevice(device)).rejects.toThrow(DeviceConnectionError);
      expect(BluetoothClassic.connectToDevice).toHaveBeenCalledTimes(3);
    });
  });

  describe('setColor', () => {
    beforeEach(() => {
      BluetoothService.isConnected = true;
      BluetoothService.device = mockDevices[0];
    });

    it('should send color command successfully', async () => {
      const hexColor = '#ff0000';
      BluetoothClassic.writeToDevice.mockResolvedValue();

      const result = await BluetoothService.setColor(hexColor);

      expect(result).toBe(true);
      expect(BluetoothClassic.writeToDevice).toHaveBeenCalledWith(
        mockDevices[0].id,
        'COLOR:255,0,0\n'
      );
    });

    it('should throw ValidationError for invalid color', async () => {
      await expect(BluetoothService.setColor('')).rejects.toThrow(ValidationError);
      await expect(BluetoothService.setColor('invalid')).rejects.toThrow(ValidationError);
      await expect(BluetoothService.setColor('#gggggg')).rejects.toThrow(ValidationError);
    });

    it('should throw CommandError when not connected', async () => {
      BluetoothService.isConnected = false;

      await expect(BluetoothService.setColor('#ff0000')).rejects.toThrow(CommandError);
    });
  });

  describe('setBrightness', () => {
    beforeEach(() => {
      BluetoothService.isConnected = true;
      BluetoothService.device = mockDevices[0];
    });

    it('should send brightness command successfully', async () => {
      const brightness = 75;
      BluetoothClassic.writeToDevice.mockResolvedValue();

      const result = await BluetoothService.setBrightness(brightness);

      expect(result).toBe(true);
      expect(BluetoothClassic.writeToDevice).toHaveBeenCalledWith(
        mockDevices[0].id,
        'BRIGHTNESS:75\n'
      );
    });

    it('should throw ValidationError for invalid brightness', async () => {
      await expect(BluetoothService.setBrightness(-1)).rejects.toThrow(ValidationError);
      await expect(BluetoothService.setBrightness(101)).rejects.toThrow(ValidationError);
      await expect(BluetoothService.setBrightness('invalid')).rejects.toThrow(ValidationError);
    });
  });

  describe('Event Listeners', () => {
    it('should add and remove listeners correctly', () => {
      const callback = jest.fn();
      
      BluetoothService.addListener('test', callback);
      expect(BluetoothService.listeners).toHaveLength(1);
      
      BluetoothService.removeListener('test', callback);
      expect(BluetoothService.listeners).toHaveLength(0);
    });

    it('should notify listeners on events', () => {
      const callback = jest.fn();
      BluetoothService.addListener('connected', callback);
      
      BluetoothService.notifyListeners('connected', mockDevices[0]);
      
      expect(callback).toHaveBeenCalledWith(mockDevices[0]);
    });

    it('should throw ValidationError for invalid listener parameters', () => {
      expect(() => BluetoothService.addListener('', jest.fn())).toThrow(ValidationError);
      expect(() => BluetoothService.addListener('test', null)).toThrow(ValidationError);
    });
  });

  describe('getConnectionStatus', () => {
    it('should return correct status when disconnected', () => {
      const status = BluetoothService.getConnectionStatus();
      
      expect(status).toEqual({
        isConnected: false,
        device: null,
        connectionTime: null,
        listenerCount: 0,
      });
    });

    it('should return correct status when connected', () => {
      BluetoothService.isConnected = true;
      BluetoothService.device = mockDevices[0];
      
      const status = BluetoothService.getConnectionStatus();
      
      expect(status.isConnected).toBe(true);
      expect(status.device).toEqual({
        id: mockDevices[0].id,
        name: mockDevices[0].name,
        address: mockDevices[0].address,
      });
      expect(status.connectionTime).toBeDefined();
    });
  });
});
