import { Platform, StatusBar, Dimensions } from 'react-native';

/**
 * Get StatusBar height for different platforms
 */
export const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    // For iOS, use different heights for different devices
    const { height } = Dimensions.get('window');
    if (height >= 812) {
      // iPhone X and above
      return 44;
    } else {
      // iPhone 8 and below
      return 20;
    }
  } else {
    // For Android, use StatusBar.currentHeight or fallback
    return StatusBar.currentHeight || 24;
  }
};

/**
 * Get safe header padding top
 */
export const getSafeHeaderPadding = (extraPadding = 16) => {
  return getStatusBarHeight() + extraPadding;
};
