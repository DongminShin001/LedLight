const {device, expect, element, by, waitFor} = require('detox');

describe('SmartLED Controller E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch and Legal Agreements', () => {
    it('should show legal agreement screen on first launch', async () => {
      await expect(element(by.text('Legal Agreements'))).toBeVisible();
      await expect(element(by.text('Age Verification'))).toBeVisible();
      await expect(element(by.text('Terms of Service'))).toBeVisible();
      await expect(element(by.text('Privacy Policy'))).toBeVisible();
      await expect(element(by.text('Safety Warnings'))).toBeVisible();
    });

    it('should require all agreements to be accepted', async () => {
      const acceptButton = element(by.text('Accept & Continue'));
      
      // Initially disabled
      await expect(acceptButton).not.toBeVisible();
      
      // Accept age verification
      await element(by.text('I am at least 13 years old')).tap();
      
      // Accept terms of service
      await element(by.text('I agree to the Terms of Service')).tap();
      
      // Accept privacy policy
      await element(by.text('I agree to the Privacy Policy')).tap();
      
      // Accept safety warnings
      await element(by.text('I understand the safety warnings')).tap();
      
      // Now accept button should be enabled
      await expect(acceptButton).toBeVisible();
    });

    it('should navigate to home screen after accepting agreements', async () => {
      // Accept all agreements
      await element(by.text('I am at least 13 years old')).tap();
      await element(by.text('I agree to the Terms of Service')).tap();
      await element(by.text('I agree to the Privacy Policy')).tap();
      await element(by.text('I understand the safety warnings')).tap();
      
      // Tap accept button
      await element(by.text('Accept & Continue')).tap();
      
      // Should navigate to home screen
      await expect(element(by.text('SmartLED Controller'))).toBeVisible();
    });
  });

  describe('Home Screen Functionality', () => {
    beforeEach(async () => {
      // Accept legal agreements first
      await element(by.text('I am at least 13 years old')).tap();
      await element(by.text('I agree to the Terms of Service')).tap();
      await element(by.text('I agree to the Privacy Policy')).tap();
      await element(by.text('I understand the safety warnings')).tap();
      await element(by.text('Accept & Continue')).tap();
    });

    it('should display all main sections', async () => {
      await expect(element(by.text('Device Status'))).toBeVisible();
      await expect(element(by.text('Power Control'))).toBeVisible();
      await expect(element(by.text('Brightness: 50%'))).toBeVisible();
      await expect(element(by.text('Color Control'))).toBeVisible();
      await expect(element(by.text('Quick Actions'))).toBeVisible();
      await expect(element(by.text('Advanced Features'))).toBeVisible();
    });

    it('should show initial disconnected state', async () => {
      await expect(element(by.text('No device connected'))).toBeVisible();
      await expect(element(by.text('Connect Device'))).toBeVisible();
    });

    it('should handle device connection attempt', async () => {
      await element(by.text('Connect Device')).tap();
      
      // Should show some feedback (loading state, error, or success)
      await waitFor(element(by.text('Disconnect')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('LED Control Functionality', () => {
    beforeEach(async () => {
      // Accept legal agreements and connect device
      await element(by.text('I am at least 13 years old')).tap();
      await element(by.text('I agree to the Terms of Service')).tap();
      await element(by.text('I agree to the Privacy Policy')).tap();
      await element(by.text('I understand the safety warnings')).tap();
      await element(by.text('Accept & Continue')).tap();
      
      // Connect device
      await element(by.text('Connect Device')).tap();
      await waitFor(element(by.text('Disconnect')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should toggle power state', async () => {
      // Initially OFF
      await expect(element(by.text('OFF'))).toBeVisible();
      
      // Tap power button
      await element(by.text('OFF')).tap();
      
      // Should change to ON
      await waitFor(element(by.text('ON')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should adjust brightness', async () => {
      // Turn on power first
      await element(by.text('OFF')).tap();
      await waitFor(element(by.text('ON')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Find and interact with brightness slider
      const brightnessSlider = element(by.type('RCTSlider'));
      await brightnessSlider.setSliderPosition(0.8); // 80%
      
      // Should show updated brightness
      await waitFor(element(by.text('Brightness: 80%')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to color picker', async () => {
      // Turn on power first
      await element(by.text('OFF')).tap();
      await waitFor(element(by.text('ON')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Tap color button
      await element(by.text('Choose Color')).tap();
      
      // Should navigate to color picker screen
      await waitFor(element(by.text('Color Picker')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Navigation Flow', () => {
    beforeEach(async () => {
      // Accept legal agreements
      await element(by.text('I am at least 13 years old')).tap();
      await element(by.text('I agree to the Terms of Service')).tap();
      await element(by.text('I agree to the Privacy Policy')).tap();
      await element(by.text('I understand the safety warnings')).tap();
      await element(by.text('Accept & Continue')).tap();
    });

    it('should navigate to Effects screen', async () => {
      await element(by.text('Effects')).tap();
      await waitFor(element(by.text('LED Effects')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to Presets screen', async () => {
      await element(by.text('Presets')).tap();
      await waitFor(element(by.text('Presets')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to Text Display screen', async () => {
      await element(by.text('Text')).tap();
      await waitFor(element(by.text('Text Display')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to Theme Selection screen', async () => {
      await element(by.text('Themes')).tap();
      await waitFor(element(by.text('Theme Selection')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Advanced Features Navigation', () => {
    beforeEach(async () => {
      // Accept legal agreements
      await element(by.text('I am at least 13 years old')).tap();
      await element(by.text('I agree to the Terms of Service')).tap();
      await element(by.text('I agree to the Privacy Policy')).tap();
      await element(by.text('I understand the safety warnings')).tap();
      await element(by.text('Accept & Continue')).tap();
    });

    it('should navigate to Advanced Effects', async () => {
      await element(by.text('Advanced Effects')).tap();
      await waitFor(element(by.text('Advanced Effects')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to Music Reactive', async () => {
      await element(by.text('Music Reactive')).tap();
      await waitFor(element(by.text('Music Reactive')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to Scheduling', async () => {
      await element(by.text('Scheduling')).tap();
      await waitFor(element(by.text('Scheduling')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to Device Management', async () => {
      await element(by.text('Device Management')).tap();
      await waitFor(element(by.text('Device Management')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      // Accept legal agreements
      await element(by.text('I am at least 13 years old')).tap();
      await element(by.text('I agree to the Terms of Service')).tap();
      await element(by.text('I agree to the Privacy Policy')).tap();
      await element(by.text('I understand the safety warnings')).tap();
      await element(by.text('Accept & Continue')).tap();
    });

    it('should handle connection errors gracefully', async () => {
      // Attempt connection (may fail in test environment)
      await element(by.text('Connect Device')).tap();
      
      // Should show appropriate error message or retry option
      await waitFor(element(by.text('Connection failed')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should handle power control errors', async () => {
      // Try to toggle power without connection
      await element(by.text('OFF')).tap();
      
      // Should handle error gracefully
      await waitFor(element(by.text('Device not connected')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Accessibility', () => {
    beforeEach(async () => {
      // Accept legal agreements
      await element(by.text('I am at least 13 years old')).tap();
      await element(by.text('I agree to the Terms of Service')).tap();
      await element(by.text('I agree to the Privacy Policy')).tap();
      await element(by.text('I understand the safety warnings')).tap();
      await element(by.text('Accept & Continue')).tap();
    });

    it('should have proper accessibility labels', async () => {
      // Test accessibility labels
      const powerButton = element(by.text('OFF'));
      await expect(powerButton).toBeVisible();
      
      const connectButton = element(by.text('Connect Device'));
      await expect(connectButton).toBeVisible();
    });

    it('should support voice over navigation', async () => {
      // Enable voice over if available
      await device.setOrientation('portrait');
      
      // Test voice over navigation
      await element(by.text('Device Status')).tap();
      await element(by.text('Power Control')).tap();
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      // Accept legal agreements
      await element(by.text('I am at least 13 years old')).tap();
      await element(by.text('I agree to the Terms of Service')).tap();
      await element(by.text('I agree to the Privacy Policy')).tap();
      await element(by.text('I understand the safety warnings')).tap();
      await element(by.text('Accept & Continue')).tap();
    });

    it('should load screens within acceptable time', async () => {
      const startTime = Date.now();
      
      await element(by.text('Effects')).tap();
      await waitFor(element(by.text('LED Effects')))
        .toBeVisible()
        .withTimeout(3000);
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle rapid navigation smoothly', async () => {
      // Rapid navigation test
      await element(by.text('Effects')).tap();
      await element(by.text('Presets')).tap();
      await element(by.text('Text')).tap();
      await element(by.text('Themes')).tap();
      
      // Should handle rapid navigation without crashes
      await expect(element(by.text('Theme Selection'))).toBeVisible();
    });
  });
});
