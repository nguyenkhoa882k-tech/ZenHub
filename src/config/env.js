// Environment configuration
const env = {
  // API Keys
  QUOTES_API_URL: 'https://api.quotable.io',
  WEATHER_API_KEY: 'YOUR_WEATHER_API_KEY_HERE', // Replace with actual key
  WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5',
  NEWS_API_KEY: 'YOUR_NEWS_API_KEY_HERE', // Replace with actual key
  NEWS_API_URL: 'https://newsapi.org/v2',
  DICTIONARY_API_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  WALLPAPER_API_KEY: 'YOUR_UNSPLASH_ACCESS_KEY_HERE', // Replace with actual key
  WALLPAPER_API_URL: 'https://api.unsplash.com',

  // AdMob IDs (Test IDs for development)
  ADMOB_BANNER_ANDROID: 'ca-app-pub-3940256099942544/6300978111',
  ADMOB_BANNER_IOS: 'ca-app-pub-3940256099942544/2934735716',
  ADMOB_INTERSTITIAL_ANDROID: 'ca-app-pub-3940256099942544/1033173712',
  ADMOB_INTERSTITIAL_IOS: 'ca-app-pub-3940256099942544/4411468910',
  ADMOB_REWARDED_ANDROID: 'ca-app-pub-3940256099942544/5224354917',
  ADMOB_REWARDED_IOS: 'ca-app-pub-3940256099942544/1712485313',

  // App Configuration
  APP_NAME: 'ZenHub',
  VERSION: '1.0.0',

  // Caching Duration (in milliseconds)
  WEATHER_CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  QUOTES_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  NEWS_CACHE_DURATION: 30 * 60 * 1000, // 30 minutes

  // Ad Configuration
  INTERSTITIAL_COOLDOWN: 90 * 1000, // 90 seconds
  INTERSTITIAL_SESSION_INTERVAL: 4, // Show after every 4 pomodoro sessions

  // Feature Flags
  ENABLE_ADS: true,
  ENABLE_SOUND: true,
  ENABLE_VIBRATION: true,
  ENABLE_NOTIFICATIONS: true,
};

export default env;
