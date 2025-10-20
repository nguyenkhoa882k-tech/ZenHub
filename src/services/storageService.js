import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store data in AsyncStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {Promise<boolean>} Success status
 */
export const setItem = async (key, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error('StorageService - setItem error:', error);
    return false;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<any>} Retrieved data or default value
 */
export const getItem = async (key, defaultValue = null) => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    if (jsonData === null) {
      return defaultValue;
    }
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('StorageService - getItem error:', error);
    return defaultValue;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} Success status
 */
export const removeItem = async key => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('StorageService - removeItem error:', error);
    return false;
  }
};

/**
 * Clear all data from AsyncStorage
 * @returns {Promise<boolean>} Success status
 */
export const clear = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('StorageService - clear error:', error);
    return false;
  }
};

/**
 * Get all keys from AsyncStorage
 * @returns {Promise<Array<string>>} Array of keys
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('StorageService - getAllKeys error:', error);
    return [];
  }
};

/**
 * Store data with expiration
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @param {number} expirationTime - Expiration time in milliseconds
 * @returns {Promise<boolean>} Success status
 */
export const setItemWithExpiry = async (key, data, expirationTime) => {
  try {
    const now = new Date().getTime();
    const item = {
      data: data,
      expiry: now + expirationTime,
    };
    const jsonData = JSON.stringify(item);
    await AsyncStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error('StorageService - setItemWithExpiry error:', error);
    return false;
  }
};

/**
 * Get data with expiration check
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist or expired
 * @returns {Promise<any>} Retrieved data or default value
 */
export const getItemWithExpiry = async (key, defaultValue = null) => {
  try {
    const jsonData = await AsyncStorage.getItem(key);
    if (jsonData === null) {
      return defaultValue;
    }

    const item = JSON.parse(jsonData);
    const now = new Date().getTime();

    if (now > item.expiry) {
      // Item has expired, remove it
      await removeItem(key);
      return defaultValue;
    }

    return item.data;
  } catch (error) {
    console.error('StorageService - getItemWithExpiry error:', error);
    return defaultValue;
  }
};

/**
 * Check if a key exists in AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<boolean>} True if key exists
 */
export const hasItem = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error('StorageService - hasItem error:', error);
    return false;
  }
};

/**
 * Get multiple items from AsyncStorage
 * @param {Array<string>} keys - Array of keys
 * @returns {Promise<Object>} Object with key-value pairs
 */
export const getMultipleItems = async keys => {
  try {
    const keyValuePairs = await AsyncStorage.multiGet(keys);
    const result = {};

    keyValuePairs.forEach(([key, value]) => {
      try {
        result[key] = value ? JSON.parse(value) : null;
      } catch (parseError) {
        result[key] = value;
      }
    });

    return result;
  } catch (error) {
    console.error('StorageService - getMultipleItems error:', error);
    return {};
  }
};

/**
 * Set multiple items in AsyncStorage
 * @param {Object} keyValuePairs - Object with key-value pairs
 * @returns {Promise<boolean>} Success status
 */
export const setMultipleItems = async keyValuePairs => {
  try {
    const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);

    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('StorageService - setMultipleItems error:', error);
    return false;
  }
};

// Default export for backward compatibility
const StorageService = {
  setItem,
  getItem,
  removeItem,
  clear,
  getAllKeys,
  setItemWithExpiry,
  getItemWithExpiry,
  hasItem,
  getMultipleItems,
  setMultipleItems,
};

export default StorageService;
