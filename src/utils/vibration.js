import { Vibration } from 'react-native';

/**
 * Safe vibration wrapper that handles permission errors gracefully
 */
export const safeVibrate = (duration = 100) => {
  try {
    Vibration.vibrate(duration);
  } catch (error) {
    // Silently handle vibration permission errors
    // This can happen on some Android versions or when permission is denied
    if (__DEV__) {
      console.warn('Vibration not available:', error.message);
    }
  }
};

/**
 * Safe vibration pattern wrapper
 */
export const safeVibratePattern = pattern => {
  try {
    Vibration.vibrate(pattern);
  } catch (error) {
    if (__DEV__) {
      console.warn('Vibration pattern not available:', error.message);
    }
  }
};

/**
 * Cancel any ongoing vibration safely
 */
export const safeCancelVibration = () => {
  try {
    Vibration.cancel();
  } catch (error) {
    if (__DEV__) {
      console.warn('Vibration cancel not available:', error.message);
    }
  }
};

export default {
  safeVibrate,
  safeVibratePattern,
  safeCancelVibration,
};
