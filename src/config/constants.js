// App constants
export const MODULES = {
  HOME: 'Home',
  NOTES: 'Notes',
  QUOTES: 'Quotes',
  WEATHER: 'Weather',
  WALLPAPER: 'Wallpaper',
  NEWS: 'News',
  DICTIONARY: 'Dictionary',
  MATH_GAME: 'MathGame',
};

export const STORAGE_KEYS = {
  NOTES: '@zenhub_notes',
  WEATHER_CACHE: '@zenhub_weather_cache',
  QUOTES_CACHE: '@zenhub_quotes_cache',
  NEWS_CACHE: '@zenhub_news_cache',
  DICTIONARY_FAVORITES: '@zenhub_dictionary_favorites',
  MATH_GAME_SCORES: '@zenhub_math_game_scores',
  APP_SETTINGS: '@zenhub_app_settings',
  AD_SETTINGS: '@zenhub_ad_settings',
  LAST_INTERSTITIAL: '@zenhub_last_interstitial',
};

export const WEATHER_CONDITIONS = {
  CLEAR: 'clear',
  CLOUDS: 'clouds',
  RAIN: 'rain',
  SNOW: 'snow',
  THUNDERSTORM: 'thunderstorm',
  DRIZZLE: 'drizzle',
  MIST: 'mist',
  SMOKE: 'smoke',
  HAZE: 'haze',
  DUST: 'dust',
  FOG: 'fog',
  SAND: 'sand',
  ASH: 'ash',
  SQUALL: 'squall',
  TORNADO: 'tornado',
};

export const NEWS_CATEGORIES = [
  'general',
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology',
];

export const MATH_GAME_LEVELS = {
  EASY: {
    level: 1,
    operations: ['+', '-'],
    maxNumber: 10,
    timeLimit: 30,
  },
  MEDIUM: {
    level: 2,
    operations: ['+', '-', '*'],
    maxNumber: 50,
    timeLimit: 25,
  },
  HARD: {
    level: 3,
    operations: ['+', '-', '*', '/'],
    maxNumber: 100,
    timeLimit: 20,
  },
  EXPERT: {
    level: 4,
    operations: ['+', '-', '*', '/'],
    maxNumber: 200,
    timeLimit: 15,
  },
};
