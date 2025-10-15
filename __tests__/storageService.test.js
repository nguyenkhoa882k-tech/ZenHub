import StorageService from '../src/services/storageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setItem', () => {
    it('should store data successfully', async () => {
      AsyncStorage.setItem.mockResolvedValue();

      const result = await StorageService.setItem('test-key', { data: 'test' });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        '{"data":"test"}',
      );
      expect(result).toBe(true);
    });

    it('should handle storage errors', async () => {
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await StorageService.setItem('test-key', { data: 'test' });

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getItem', () => {
    it('should retrieve and parse data', async () => {
      AsyncStorage.getItem.mockResolvedValue('{"data":"test"}');

      const result = await StorageService.getItem('test-key');

      expect(result).toEqual({ data: 'test' });
    });

    it('should return default value when key does not exist', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await StorageService.getItem('test-key', 'default');

      expect(result).toBe('default');
    });

    it('should handle parsing errors', async () => {
      AsyncStorage.getItem.mockResolvedValue('invalid-json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await StorageService.getItem('test-key', 'default');

      expect(result).toBe('default');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('setItemWithExpiry', () => {
    it('should store data with expiration', async () => {
      AsyncStorage.setItem.mockResolvedValue();
      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const result = await StorageService.setItemWithExpiry(
        'test-key',
        { data: 'test' },
        60000, // 1 minute
      );

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({
          data: { data: 'test' },
          expiry: mockDate.getTime() + 60000,
        }),
      );
      expect(result).toBe(true);

      global.Date.mockRestore();
    });
  });

  describe('getItemWithExpiry', () => {
    it('should return data if not expired', async () => {
      const futureTime = Date.now() + 60000; // 1 minute in future
      const mockData = {
        data: { test: 'data' },
        expiry: futureTime,
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));

      const result = await StorageService.getItemWithExpiry('test-key');

      expect(result).toEqual({ test: 'data' });
    });

    it('should return default and remove item if expired', async () => {
      const pastTime = Date.now() - 60000; // 1 minute ago
      const mockData = {
        data: { test: 'data' },
        expiry: pastTime,
      };
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockData));
      AsyncStorage.removeItem.mockResolvedValue();

      const result = await StorageService.getItemWithExpiry(
        'test-key',
        'default',
      );

      expect(result).toBe('default');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('removeItem', () => {
    it('should remove item successfully', async () => {
      AsyncStorage.removeItem.mockResolvedValue();

      const result = await StorageService.removeItem('test-key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all storage', async () => {
      AsyncStorage.clear.mockResolvedValue();

      const result = await StorageService.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
