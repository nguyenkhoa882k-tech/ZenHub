import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';

const BASE_URL = 'https://restcountries.com/v3.1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Internal state
let favorites = new Set();
let initialized = false;

// Initialize service
const initialize = async () => {
  if (initialized) return;

  try {
    await loadFavorites();
    initialized = true;
  } catch (error) {
    console.error('Error initializing countries service:', error);
  }
};

// Load favorites from storage
const loadFavorites = async () => {
  try {
    const favoritesData = await AsyncStorage.getItem(
      STORAGE_KEYS.COUNTRIES_FAVORITES,
    );
    if (favoritesData) {
      const favoritesArray = JSON.parse(favoritesData);
      favorites = new Set(favoritesArray);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
};

// Save favorites to storage
const saveFavorites = async () => {
  try {
    const favoritesArray = Array.from(favorites);
    await AsyncStorage.setItem(
      STORAGE_KEYS.COUNTRIES_FAVORITES,
      JSON.stringify(favoritesArray),
    );
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

// Cache management
const getCachedData = async key => {
  try {
    const cachedData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.COUNTRIES_CACHE}_${key}`,
    );
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error('Error getting cached data:', error);
  }
  return null;
};

const setCachedData = async (key, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.COUNTRIES_CACHE}_${key}`,
      JSON.stringify(cacheData),
    );
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
};

// API calls with error handling and retry logic
const makeApiCall = async (endpoint, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Making API call to: ${BASE_URL}${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`);

      console.log(
        `API Response status: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error Response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(
        `API Response: Received ${
          Array.isArray(data) ? data.length : 1
        } countries`,
      );
      return data;
    } catch (error) {
      console.warn(`API call attempt ${i + 1} failed:`, error.message);

      if (i === retries - 1) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Helper functions
const getCallingCode = idd => {
  if (!idd) return '';
  const root = idd.root || '';
  const suffixes = idd.suffixes || [''];
  return root + suffixes[0];
};

// Process single country data
const processCountry = country => {
  if (!country) return null;

  return {
    cca3: country.cca3 || country.cca2,
    cca2: country.cca2,
    name: {
      common: country.name?.common || 'Unknown',
      official: country.name?.official || country.name?.common || 'Unknown',
    },
    capital: Array.isArray(country.capital)
      ? country.capital
      : country.capital
      ? [country.capital]
      : [],
    region: country.region || 'Unknown',
    subregion: country.subregion || 'Unknown',
    population: country.population || 0,
    area: country.area || 0,
    flag: country.flags?.png || country.flags?.svg || '',
    flagAlt: country.flags?.alt || '',
    languages: country.languages || {},
    currencies: country.currencies || {},
    timezones: country.timezones || [],
    borders: country.borders || [],
    latlng: country.latlng || [0, 0],
    tld: country.tld || [],
    callingCode: getCallingCode(country.idd),
    car: country.car || { side: 'right' },
    independent: country.independent || false,
    unMember: country.unMember || false,
    status: country.status || 'Unknown',
    maps: {
      googleMaps: country.maps?.googleMaps || '',
      openStreetMaps: country.maps?.openStreetMaps || '',
    },
    isFavorite: favorites.has(country.cca3 || country.cca2),
  };
};

// Process countries data
const processCountries = countries => {
  if (!Array.isArray(countries)) {
    return [];
  }

  return countries.map(country => processCountry(country));
};

// Get all countries
const getAllCountries = async (forceRefresh = false) => {
  try {
    await initialize();

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedCountries = await getCachedData('all');
      if (cachedCountries) {
        return processCountries(cachedCountries);
      }
    }

    // Fetch from API - use simple field list or no fields
    let countries;
    try {
      // Try with basic fields first
      countries = await makeApiCall(
        '/all?fields=name,capital,region,population,area,flags,cca3',
      );
    } catch (error) {
      console.warn(
        'Failed with fields parameter, trying without fields:',
        error,
      );
      // Fallback to all data if fields parameter fails
      countries = await makeApiCall('/all');
    }

    // Cache the data
    await setCachedData('all', countries);

    return processCountries(countries);
  } catch (error) {
    console.error('Error fetching all countries:', error);

    // Return cached data even if expired in case of error
    const cachedCountries = await getCachedData('all');
    if (cachedCountries) {
      return processCountries(cachedCountries);
    }

    throw new Error('Failed to fetch countries data');
  }
};

// Get countries by region
const getCountriesByRegion = async region => {
  if (region === 'All') {
    return getAllCountries();
  }

  try {
    await initialize();

    const cacheKey = `region_${region}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return processCountries(cachedData);
    }

    const countries = await makeApiCall(
      `/region/${region}?fields=name,capital,region,subregion,population,area,flags,cca2,cca3`,
    );

    await setCachedData(cacheKey, countries);
    return processCountries(countries);
  } catch (error) {
    console.error(`Error fetching countries by region ${region}:`, error);
    throw new Error(`Failed to fetch countries in ${region}`);
  }
};

// Search countries by name
const searchCountries = (allCountries, query) => {
  if (!query || query.trim().length < 2) {
    return allCountries;
  }

  const searchTerm = query.toLowerCase().trim();

  return allCountries.filter(country => {
    return (
      country.name.toLowerCase().includes(searchTerm) ||
      country.capital.toLowerCase().includes(searchTerm) ||
      country.region.toLowerCase().includes(searchTerm) ||
      (country.subregion &&
        country.subregion.toLowerCase().includes(searchTerm))
    );
  });
};

// Get country by code
const getCountryByCode = async code => {
  try {
    await initialize();

    const cacheKey = `country_${code}`;
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return processCountry(cachedData[0]);
    }

    const countries = await makeApiCall(
      `/alpha/${code}?fields=name,capital,region,subregion,population,area,flags,cca2,cca3,languages,currencies,timezones,borders,car,latlng,tld,idd,independent,unMember,status`,
    );

    await setCachedData(cacheKey, countries);
    return processCountry(Array.isArray(countries) ? countries[0] : countries);
  } catch (error) {
    console.error(`Error fetching country by code ${code}:`, error);
    throw new Error(`Failed to fetch country with code ${code}`);
  }
};

// Get neighboring countries
const getNeighboringCountries = async borders => {
  if (!borders || borders.length === 0) {
    return [];
  }

  try {
    const borderCodes = borders.slice(0, 10); // Limit to 10 neighbors
    const neighbors = await makeApiCall(
      `/alpha?codes=${borderCodes.join(
        ',',
      )}&fields=name,flags,cca2,cca3,population,capital`,
    );
    return processCountries(neighbors);
  } catch (error) {
    console.error('Error fetching neighboring countries:', error);
    return [];
  }
};

// Favorites management
const toggleFavorite = async countryCode => {
  await initialize();

  if (favorites.has(countryCode)) {
    favorites.delete(countryCode);
  } else {
    favorites.add(countryCode);
  }

  await saveFavorites();
  return { isFavorite: favorites.has(countryCode) };
};

const isFavorite = countryCode => {
  return favorites.has(countryCode);
};

const getFavoriteCountries = async () => {
  if (favorites.size === 0) {
    return [];
  }

  try {
    const favoriteCodes = Array.from(favorites);
    const favoritesList = await makeApiCall(
      `/alpha?codes=${favoriteCodes.join(
        ',',
      )}&fields=name,capital,region,population,area,flags,cca2,cca3`,
    );
    return processCountries(favoritesList);
  } catch (error) {
    console.error('Error fetching favorite countries:', error);
    return [];
  }
};

// Statistics and analytics
const getRegionStats = countries => {
  const stats = {};

  countries.forEach(country => {
    const region = country.region;
    if (!stats[region]) {
      stats[region] = {
        count: 0,
        totalPopulation: 0,
        totalArea: 0,
        countries: [],
      };
    }

    stats[region].count++;
    stats[region].totalPopulation += country.population;
    stats[region].totalArea += country.area;
    stats[region].countries.push(country.name.common);
  });

  return stats;
};

// Sort and filter utilities
const sortCountries = (countries, sortBy = 'name', order = 'asc') => {
  return [...countries].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case 'name':
        valueA = (a.name?.common || '').toLowerCase();
        valueB = (b.name?.common || '').toLowerCase();
        break;
      case 'population':
        valueA = a.population;
        valueB = b.population;
        break;
      case 'area':
        valueA = a.area;
        valueB = b.area;
        break;
      case 'region':
        valueA = a.region.toLowerCase();
        valueB = b.region.toLowerCase();
        break;
      default:
        valueA = (a.name?.common || '').toLowerCase();
        valueB = (b.name?.common || '').toLowerCase();
    }

    if (order === 'desc') {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    } else {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    }
  });
};

// Clear cache
const clearCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const countryKeys = keys.filter(key =>
      key.startsWith(STORAGE_KEYS.COUNTRIES_CACHE),
    );
    await AsyncStorage.multiRemove(countryKeys);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

// Export all functions
export default {
  getAllCountries,
  getCountriesByRegion,
  searchCountries,
  getCountryByCode,
  getNeighboringCountries,
  toggleFavorite,
  isFavorite,
  getFavoriteCountries,
  getRegionStats,
  sortCountries,
  clearCache,
  processCountries,
  processCountry,
};
