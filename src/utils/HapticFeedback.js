import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

/**
 * Haptic Feedback Manager
 * Provides tactile feedback for user interactions
 */
class HapticFeedback {
  constructor() {
    this.options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
  }

  /**
   * Light impact - for subtle interactions
   * Use for: button taps, slider adjustments, toggles
   */
  light() {
    ReactNativeHapticFeedback.trigger('impactLight', this.options);
  }

  /**
   * Medium impact - for standard interactions
   * Use for: navigation, color selection, effect changes
   */
  medium() {
    ReactNativeHapticFeedback.trigger('impactMedium', this.options);
  }

  /**
   * Heavy impact - for significant actions
   * Use for: power on/off, critical actions, warnings
   */
  heavy() {
    ReactNativeHapticFeedback.trigger('impactHeavy', this.options);
  }

  /**
   * Success notification
   * Use for: device connected, preset saved, effect applied
   */
  success() {
    ReactNativeHapticFeedback.trigger('notificationSuccess', this.options);
  }

  /**
   * Error notification
   * Use for: connection failed, invalid input, permission denied
   */
  error() {
    ReactNativeHapticFeedback.trigger('notificationError', this.options);
  }

  /**
   * Warning notification
   * Use for: caution messages, confirmations needed
   */
  warning() {
    ReactNativeHapticFeedback.trigger('notificationWarning', this.options);
  }

  /**
   * Selection feedback
   * Use for: item selection, tab switching
   */
  selection() {
    ReactNativeHapticFeedback.trigger('selection', this.options);
  }

  /**
   * Rigid impact (iOS 13+)
   * Use for: UI elements that snap
   */
  rigid() {
    ReactNativeHapticFeedback.trigger('rigid', this.options);
  }

  /**
   * Soft impact (iOS 13+)
   * Use for: UI elements that are soft or elastic
   */
  soft() {
    ReactNativeHapticFeedback.trigger('soft', this.options);
  }
}

// Export singleton instance
const haptic = new HapticFeedback();
export default haptic;

// Named exports for convenience
export const {
  light,
  medium,
  heavy,
  success,
  error,
  warning,
  selection,
  rigid,
  soft,
} = haptic;

