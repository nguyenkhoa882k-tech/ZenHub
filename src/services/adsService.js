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
import env from '../config/env';
import { STORAGE_KEYS } from '../config/constants';
import { getItem, setItem } from './storageService';

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
  try {
    await MobileAds().initialize();
    isInitialized = true;
    console.log('Google Mobile Ads SDK initialized successfully');

    // Load ads after initialization
    loadInterstitialAd();
    loadRewardedAd();
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
    ? env.ADMOB_BANNER_IOS
    : env.ADMOB_BANNER_ANDROID;
};

/**
 * Get Interstitial Ad Unit ID
 */
export const getInterstitialAdUnitId = () => {
  if (__DEV__) {
    return TestIds.INTERSTITIAL;
  }
  return Platform.OS === 'ios'
    ? env.ADMOB_INTERSTITIAL_IOS
    : env.ADMOB_INTERSTITIAL_ANDROID;
};

/**
 * Get Rewarded Ad Unit ID
 */
export const getRewardedAdUnitId = () => {
  if (__DEV__) {
    return TestIds.REWARDED;
  }
  return Platform.OS === 'ios'
    ? env.ADMOB_REWARDED_IOS
    : env.ADMOB_REWARDED_ANDROID;
};

/**
 * Load Interstitial Ad
 */
export const loadInterstitialAd = () => {
  if (!isInitialized) {
    console.log('Google Mobile Ads SDK not initialized yet');
    return;
  }

  try {
    interstitialAd = InterstitialAd.createForAdUnitId(
      getInterstitialAdUnitId(),
    );

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
      console.log('Interstitial ad error:', error);
      isAdLoaded = false;
      // Retry loading after delay
      setTimeout(() => {
        loadInterstitialAd();
      }, 5000);
    });

    interstitialAd.load();
  } catch (error) {
    console.log('Error creating InterstitialAd:', error);
  }
};

/**
 * Load Rewarded Ad
 */
export const loadRewardedAd = () => {
  if (!isInitialized) {
    console.log('Google Mobile Ads SDK not initialized yet');
    return;
  }

  try {
    rewardedAd = RewardedAd.createForAdUnitId(getRewardedAdUnitId());

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

    rewardedAd.load();
  } catch (error) {
    console.log('Error creating RewardedAd:', error);
  }
};

/**
 * Check if can show interstitial ad
 */
export const canShowInterstitial = () => {
  if (!env.ENABLE_ADS) return false;

  const now = Date.now();
  const timeSinceLastAd = now - lastInterstitialTime;

  return isAdLoaded && timeSinceLastAd >= env.INTERSTITIAL_COOLDOWN;
};

/**
 * Show Interstitial Ad
 */
export const showInterstitial = async () => {
  if (canShowInterstitial()) {
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
  if (!env.ENABLE_ADS) return null;

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
initializeAds();

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
