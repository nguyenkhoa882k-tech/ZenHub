import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  /**
   * Store data in AsyncStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   */
  static async setItem(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.error('StorageService - setItem error:', error);
      return false;
    }
  }

  /**
   * Retrieve data from AsyncStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   */
  static async getItem(key, defaultValue = null) {
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
  }

  /**
   * Remove data from AsyncStorage
   * @param {string} key - Storage key
   */
  static async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('StorageService - removeItem error:', error);
      return false;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  static async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('StorageService - clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys from AsyncStorage
   */
  static async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('StorageService - getAllKeys error:', error);
      return [];
    }
  }

  /**
   * Store data with expiration
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   * @param {number} expirationTime - Expiration time in milliseconds
   */
  static async setItemWithExpiry(key, data, expirationTime) {
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
  }

  /**
   * Get data with expiration check
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist or expired
   */
  static async getItemWithExpiry(key, defaultValue = null) {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData === null) {
        return defaultValue;
      }

      const item = JSON.parse(jsonData);
      const now = new Date().getTime();

      if (now > item.expiry) {
        // Item has expired, remove it
        await this.removeItem(key);
        return defaultValue;
      }

      return item.data;
    } catch (error) {
      console.error('StorageService - getItemWithExpiry error:', error);
      return defaultValue;
    }
  }
}

export default StorageService;
