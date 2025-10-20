import Config from 'react-native-config';

// Environment configuration using .env variables
const env = {
  // API Keys
  QUOTES_API_URL: Config.QUOTES_API_URL || 'https://api.quotable.io',
  WEATHER_API_KEY: Config.WEATHER_API_KEY || 'YOUR_WEATHER_API_KEY_HERE',
  WEATHER_API_URL:
    Config.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
  NEWS_API_KEY: Config.NEWS_API_KEY || 'YOUR_NEWS_API_KEY_HERE',
  NEWS_API_URL: Config.NEWS_API_URL || 'https://newsapi.org/v2',
  DICTIONARY_API_URL:
    Config.DICTIONARY_API_URL ||
    'https://api.dictionaryapi.dev/api/v2/entries/en',
  WALLPAPER_API_KEY:
    Config.WALLPAPER_API_KEY || 'YOUR_UNSPLASH_ACCESS_KEY_HERE',
  WALLPAPER_API_URL: Config.WALLPAPER_API_URL || 'https://api.unsplash.com',

  // AdMob IDs
  ADMOB_BANNER_ANDROID:
    Config.ADMOB_BANNER_ANDROID || 'ca-app-pub-3940256099942544/6300978111',
  ADMOB_BANNER_IOS:
    Config.ADMOB_BANNER_IOS || 'ca-app-pub-3940256099942544/2934735716',
  ADMOB_INTERSTITIAL_ANDROID:
    Config.ADMOB_INTERSTITIAL_ANDROID ||
    'ca-app-pub-3940256099942544/1033173712',
  ADMOB_INTERSTITIAL_IOS:
    Config.ADMOB_INTERSTITIAL_IOS || 'ca-app-pub-3940256099942544/4411468910',
  ADMOB_REWARDED_ANDROID:
    Config.ADMOB_REWARDED_ANDROID || 'ca-app-pub-3940256099942544/5224354917',
  ADMOB_REWARDED_IOS:
    Config.ADMOB_REWARDED_IOS || 'ca-app-pub-3940256099942544/1712485313',

  // App Configuration
  APP_NAME: Config.APP_NAME || 'ZenHub',
  VERSION: Config.VERSION || '1.0.0',

  // Caching Duration (in milliseconds)
  WEATHER_CACHE_DURATION:
    parseInt(Config.WEATHER_CACHE_DURATION, 10) || 10 * 60 * 1000,
  QUOTES_CACHE_DURATION:
    parseInt(Config.QUOTES_CACHE_DURATION, 10) || 24 * 60 * 60 * 1000,
  NEWS_CACHE_DURATION:
    parseInt(Config.NEWS_CACHE_DURATION, 10) || 30 * 60 * 1000,

  // Ad Configuration
  INTERSTITIAL_COOLDOWN:
    parseInt(Config.INTERSTITIAL_COOLDOWN, 10) || 90 * 1000,
  INTERSTITIAL_SESSION_INTERVAL:
    parseInt(Config.INTERSTITIAL_SESSION_INTERVAL, 10) || 4,

  // Feature Flags
  ENABLE_ADS: Config.ENABLE_ADS === 'true' || true,
  ENABLE_SOUND: Config.ENABLE_SOUND === 'true' || true,
  ENABLE_VIBRATION: Config.ENABLE_VIBRATION === 'true' || true,
  ENABLE_NOTIFICATIONS: Config.ENABLE_NOTIFICATIONS === 'true' || true,
};

export default env;
