import { Platform } from 'react-native';
import React from 'react';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  MobileAds,
} from 'react-native-google-mobile-ads';
import { STORAGE_KEYS } from '../config/constants';
import { getItem, setItem } from './storageService';

// Ad configuration constants
const AD_CONFIG = {
  ENABLE_ADS: true,
  INTERSTITIAL_COOLDOWN: 90000, // 90 seconds
  // Use test ad unit IDs for development
  ADMOB_BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
  ADMOB_BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  ADMOB_INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
  ADMOB_INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
  ADMOB_REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',
  ADMOB_REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
};

// State management
let isInitialized = false;
let interstitialAd = null;
let rewardedAd = null;
let lastInterstitialTime = 0;
let isAdLoaded = false;

/**
 * Initialize Google Mobile Ads SDK
 */
export const initializeAds = async () => {
  if (isInitialized) {
    if (__DEV__) {
      console.log('Google Mobile Ads SDK already initialized');
    }
    return true;
  }

  try {
    console.log('Starting Google Mobile Ads SDK initialization...');
    await MobileAds().initialize();
    isInitialized = true;
    console.log('Google Mobile Ads SDK initialized successfully');

    // Add a small delay to ensure everything is ready
    setTimeout(() => {
      // Load ads after initialization
      loadInterstitialAd();
      loadRewardedAd();
    }, 1000);

    await loadLastInterstitialTime();

    return true;
  } catch (error) {
    console.log('Failed to initialize Google Mobile Ads SDK:', error);
    return false;
  }
};

/**
 * Load last interstitial time from storage
 */
export const loadLastInterstitialTime = async () => {
  try {
    lastInterstitialTime = await getItem(STORAGE_KEYS.LAST_INTERSTITIAL, 0);
  } catch (error) {
    console.log('Error loading last interstitial time:', error);
    lastInterstitialTime = 0;
  }
};

/**
 * Save last interstitial time to storage
 */
export const saveLastInterstitialTime = async () => {
  try {
    lastInterstitialTime = Date.now();
    await setItem(STORAGE_KEYS.LAST_INTERSTITIAL, lastInterstitialTime);
  } catch (error) {
    console.log('Error saving last interstitial time:', error);
  }
};

/**
 * Get Banner Ad Unit ID
 */
export const getBannerAdUnitId = () => {
  if (__DEV__) {
    return TestIds.BANNER;
  }
  return Platform.OS === 'ios'
    ? AD_CONFIG.ADMOB_BANNER_IOS
    : AD_CONFIG.ADMOB_BANNER_ANDROID;
};

/**
 * Get Interstitial Ad Unit ID
 */
export const getInterstitialAdUnitId = () => {
  if (__DEV__) {
    return TestIds.INTERSTITIAL;
  }
  return Platform.OS === 'ios'
    ? AD_CONFIG.ADMOB_INTERSTITIAL_IOS
    : AD_CONFIG.ADMOB_INTERSTITIAL_ANDROID;
};

/**
 * Get Rewarded Ad Unit ID
 */
export const getRewardedAdUnitId = () => {
  if (__DEV__) {
    return TestIds.REWARDED;
  }
  return Platform.OS === 'ios'
    ? AD_CONFIG.ADMOB_REWARDED_IOS
    : AD_CONFIG.ADMOB_REWARDED_ANDROID;
};

/**
 * Load Interstitial Ad
 */
export const loadInterstitialAd = async () => {
  if (!isInitialized) {
    console.log('Google Mobile Ads SDK not initialized yet');
    return;
  }

  // Prevent creating multiple ads
  if (interstitialAd && isAdLoaded) {
    if (__DEV__) {
      console.log('Interstitial ad already loaded, skipping...');
    }
    return;
  }

  const adUnitId = getInterstitialAdUnitId();
  if (__DEV__) {
    console.log('Creating InterstitialAd with unit ID:', adUnitId);
  }

  try {
    // Use the correct API method for version 15.x
    interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Set up event listeners
    interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      isAdLoaded = true;
      console.log('Interstitial ad loaded successfully');
    });

    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      isAdLoaded = false;
      saveLastInterstitialTime();
      // Preload next ad
      setTimeout(() => {
        loadInterstitialAd();
      }, 1000);
    });

    interstitialAd.addAdEventListener(AdEventType.ERROR, error => {
      // Only log non-fill errors in development mode
      if (__DEV__ && !error.message?.includes('No fill')) {
        console.log('Interstitial ad error:', error);
      }
      isAdLoaded = false;
      // Retry loading after delay
      setTimeout(() => {
        loadInterstitialAd();
      }, 5000);
    });

    // Load the ad
    interstitialAd.load();
    if (__DEV__) {
      console.log('InterstitialAd created and loading...');
    }
  } catch (error) {
    console.log('Error creating InterstitialAd:', error);
  }
};

/**
 * Load Rewarded Ad
 */
export const loadRewardedAd = async () => {
  if (!isInitialized) {
    console.log('Google Mobile Ads SDK not initialized yet');
    return;
  }

  const adUnitId = getRewardedAdUnitId();
  console.log('Creating RewardedAd with unit ID:', adUnitId);

  try {
    // Use the correct API method for version 15.x
    rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded ad loaded');
    });

    rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      console.log('Rewarded ad earned reward:', reward);
    });

    rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      // Preload next ad
      setTimeout(() => {
        loadRewardedAd();
      }, 1000);
    });

    // Load the ad
    rewardedAd.load();
    console.log('RewardedAd created and loading...');
  } catch (error) {
    console.log('Error creating RewardedAd:', error);
  }
};

/**
 * Check if can show interstitial ad
 */
export const canShowInterstitial = () => {
  const enableAds = AD_CONFIG.ENABLE_ADS;
  if (!enableAds) return false;

  const now = Date.now();
  const timeSinceLastAd = now - lastInterstitialTime;
  const cooldown = AD_CONFIG.INTERSTITIAL_COOLDOWN;

  return isAdLoaded && timeSinceLastAd >= cooldown;
};

/**
 * Show Interstitial Ad
 */
export const showInterstitial = async () => {
  if (canShowInterstitial() && interstitialAd) {
    try {
      await interstitialAd.show();
      return true;
    } catch (error) {
      console.log('Error showing interstitial ad:', error);
      return false;
    }
  }
  return false;
};

/**
 * Show Rewarded Ad
 */
export const showRewardedAd = async () => {
  if (rewardedAd) {
    try {
      await rewardedAd.show();
      return true;
    } catch (error) {
      console.log('Error showing rewarded ad:', error);
      return false;
    }
  }
  return false;
};

/**
 * Create Banner Ad Component
 */
export const createBannerAd = (className = '') => {
  const enableAds = AD_CONFIG.ENABLE_ADS;
  if (!enableAds) return null;

  return (
    <BannerAd
      unitId={getBannerAdUnitId()}
      size={BannerAdSize.BANNER}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
      className={className}
    />
  );
};

/**
 * Initialize ads service when module loads
 */
/**
 * Auto-initialize ads when needed
 * Comment out auto-init to prevent multiple calls
 */
// initializeAds();

// Default export for backward compatibility
const adsService = {
  initializeAds,
  loadInterstitialAd,
  loadRewardedAd,
  canShowInterstitial,
  showInterstitial,
  showRewardedAd,
  createBannerAd,
  getBannerAdUnitId,
  getInterstitialAdUnitId,
  getRewardedAdUnitId,
};

export default adsService;
