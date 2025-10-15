import {
  formatDate,
  formatTime,
  truncateText,
  generateId,
  debounce,
  rgbToHex,
} from '../src/utils/helpers';

describe('Helper Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-15T10:30:00.000Z');
      const result = formatDate(date);

      // Should return a string in the format "Jan 15, 2023"
      expect(result).toMatch(/\w+ \d{1,2}, \d{4}/);
    });

    it('should handle invalid date', () => {
      const result = formatDate(new Date('invalid'));

      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatTime', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3661)).toBe('61:01'); // Over an hour
    });

    it('should handle negative values', () => {
      expect(formatTime(-30)).toBe('00:00');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const text = 'This is a very long text that should be truncated';
      const result = truncateText(text, 20);

      expect(result).toBe('This is a very long...');
      expect(result.length).toBe(22); // 19 + "..." = 22 (trimmed)
    });

    it('should return original text if shorter than maxLength', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);

      expect(result).toBe('Short text');
    });

    it('should handle empty text', () => {
      const result = truncateText('', 10);

      expect(result).toBe('');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn();
      jest.advanceTimersByTime(300);

      debouncedFn(); // This should cancel the previous call
      jest.advanceTimersByTime(300);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(200);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex correctly', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(209, 136, 67)).toBe('#d18843'); // Our primary color
      expect(rgbToHex(120, 113, 108)).toBe('#78716c'); // Our gray color
    });

    it('should handle edge cases', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
    });
  });
});
