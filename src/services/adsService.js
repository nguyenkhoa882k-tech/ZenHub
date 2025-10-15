import { Platform } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import env from '../config/env';
import { STORAGE_KEYS } from '../config/constants';
import StorageService from './storageService';

class AdsService {
  constructor() {
    this.interstitialAd = null;
    this.rewardedAd = null;
    this.lastInterstitialTime = 0;
    this.isAdLoaded = false;
    this.initializeAds();
  }

  initializeAds() {
    this.loadInterstitialAd();
    this.loadRewardedAd();
    this.loadLastInterstitialTime();
  }

  async loadLastInterstitialTime() {
    this.lastInterstitialTime = await StorageService.getItem(
      STORAGE_KEYS.LAST_INTERSTITIAL,
      0,
    );
  }

  async saveLastInterstitialTime() {
    this.lastInterstitialTime = Date.now();
    await StorageService.setItem(
      STORAGE_KEYS.LAST_INTERSTITIAL,
      this.lastInterstitialTime,
    );
  }

  getBannerAdUnitId() {
    if (__DEV__) {
      return TestIds.BANNER;
    }
    return Platform.OS === 'ios'
      ? env.ADMOB_BANNER_IOS
      : env.ADMOB_BANNER_ANDROID;
  }

  getInterstitialAdUnitId() {
    if (__DEV__) {
      return TestIds.INTERSTITIAL;
    }
    return Platform.OS === 'ios'
      ? env.ADMOB_INTERSTITIAL_IOS
      : env.ADMOB_INTERSTITIAL_ANDROID;
  }

  getRewardedAdUnitId() {
    if (__DEV__) {
      return TestIds.REWARDED;
    }
    return Platform.OS === 'ios'
      ? env.ADMOB_REWARDED_IOS
      : env.ADMOB_REWARDED_ANDROID;
  }

  loadInterstitialAd() {
    this.interstitialAd = InterstitialAd.createForAdUnitId(
      this.getInterstitialAdUnitId(),
    );

    this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      this.isAdLoaded = true;
    });

    this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      this.isAdLoaded = false;
      this.saveLastInterstitialTime();
      // Preload next ad
      setTimeout(() => {
        this.loadInterstitialAd();
      }, 1000);
    });

    this.interstitialAd.addAdEventListener(AdEventType.ERROR, error => {
      console.log('Interstitial ad error:', error);
      this.isAdLoaded = false;
      // Retry loading after delay
      setTimeout(() => {
        this.loadInterstitialAd();
      }, 5000);
    });

    this.interstitialAd.load();
  }

  loadRewardedAd() {
    this.rewardedAd = RewardedAd.createForAdUnitId(this.getRewardedAdUnitId());

    this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded ad loaded');
    });

    this.rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('Rewarded ad earned reward:', reward);
      },
    );

    this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      // Preload next ad
      setTimeout(() => {
        this.loadRewardedAd();
      }, 1000);
    });

    this.rewardedAd.load();
  }

  canShowInterstitial() {
    if (!env.ENABLE_ADS) return false;

    const now = Date.now();
    const timeSinceLastAd = now - this.lastInterstitialTime;

    return this.isAdLoaded && timeSinceLastAd >= env.INTERSTITIAL_COOLDOWN;
  }

  async showInterstitial() {
    if (this.canShowInterstitial()) {
      try {
        await this.interstitialAd.show();
        return true;
      } catch (error) {
        console.log('Error showing interstitial ad:', error);
        return false;
      }
    }
    return false;
  }

  async showRewardedAd() {
    if (this.rewardedAd) {
      try {
        await this.rewardedAd.show();
        return true;
      } catch (error) {
        console.log('Error showing rewarded ad:', error);
        return false;
      }
    }
    return false;
  }

  createBannerAd(className = '') {
    if (!env.ENABLE_ADS) return null;

    return (
      <BannerAd
        unitId={this.getBannerAdUnitId()}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        className={className}
      />
    );
  }
}

const adsService = new AdsService();
export default adsService;
