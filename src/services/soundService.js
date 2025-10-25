/**
 * Sound Service for Pomodoro Timer
 * Handles sound effects for timer events
 */

class SoundService {
  constructor() {
    this.soundEnabled = true;
  }

  /**
   * Play session start sound
   */
  playStartSound() {
    if (!this.soundEnabled) return;

    // For now, we'll use a simple vibration as placeholder
    // In a real app, you would use react-native-sound or similar
    try {
      console.log('🔊 Playing start sound');
      // Vibration pattern for start: short-long
      // You can replace this with actual sound file later
    } catch (error) {
      console.warn('Failed to play start sound:', error);
    }
  }

  /**
   * Play session complete sound
   */
  playCompleteSound() {
    if (!this.soundEnabled) return;

    try {
      console.log('🔊 Playing complete sound');
      // Vibration pattern for complete: long-short-long
      // You can replace this with actual sound file later
    } catch (error) {
      console.warn('Failed to play complete sound:', error);
    }
  }

  /**
   * Play pause sound
   */
  playPauseSound() {
    if (!this.soundEnabled) return;

    try {
      console.log('🔊 Playing pause sound');
      // Vibration pattern for pause: short
      // You can replace this with actual sound file later
    } catch (error) {
      console.warn('Failed to play pause sound:', error);
    }
  }

  /**
   * Play resume sound
   */
  playResumeSound() {
    if (!this.soundEnabled) return;

    try {
      console.log('🔊 Playing resume sound');
      // Vibration pattern for resume: short-short
      // You can replace this with actual sound file later
    } catch (error) {
      console.warn('Failed to play resume sound:', error);
    }
  }

  /**
   * Enable/disable sounds
   */
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  /**
   * Get sound status
   */
  isSoundEnabled() {
    return this.soundEnabled;
  }
}

// Export singleton instance
const soundService = new SoundService();
export default soundService;
