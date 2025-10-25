import { useState, useCallback, useRef } from 'react';

/**
 * Sound Service for ZenHub App
 * Handles sound effects for app events
 * Converted to function-based with React hooks
 */

// Global state for sound service
let globalSoundState = {
  soundEnabled: true,
};

// Custom hook for Sound functionality
export const useSoundService = () => {
  const [soundEnabled, setSoundEnabled] = useState(
    globalSoundState.soundEnabled,
  );
  const soundRef = useRef(null);

  // Play session start sound
  const playStartSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      console.log('🔊 Playing start sound');
      // Vibration pattern for start: short-long
      // You can replace this with actual sound file later
    } catch (error) {
      console.warn('Failed to play start sound:', error);
    }
  }, [soundEnabled]);

  // Play session complete sound
  const playCompleteSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      console.log('🔊 Playing complete sound');
      // Vibration pattern for complete: long-short-long
      // You can replace this with actual sound file later
    } catch (error) {
      console.warn('Failed to play complete sound:', error);
    }
  }, [soundEnabled]);

  // Play pause sound
  const playPauseSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      console.log('🔊 Playing pause sound');
      // Vibration pattern for pause: short
      // You can replace this with actual sound file later
    } catch (error) {
      console.warn('Failed to play pause sound:', error);
    }
  }, [soundEnabled]);

  // Play resume sound
  const playResumeSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      console.log('🔊 Playing resume sound');
      // Vibration pattern for resume: short-short
      // You can replace this with actual sound file later
    } catch (error) {
      console.warn('Failed to play resume sound:', error);
    }
  }, [soundEnabled]);

  // Enable/disable sounds
  const setSoundEnabledState = useCallback(enabled => {
    globalSoundState.soundEnabled = enabled;
    setSoundEnabled(enabled);
  }, []);

  // Get sound status
  const isSoundEnabled = useCallback(() => {
    return soundEnabled;
  }, [soundEnabled]);

  return {
    soundEnabled,
    playStartSound,
    playCompleteSound,
    playPauseSound,
    playResumeSound,
    setSoundEnabled: setSoundEnabledState,
    isSoundEnabled,
  };
};

// Legacy singleton for backward compatibility
const createSoundService = () => {
  let soundEnabled = true;

  const playStartSound = () => {
    if (!soundEnabled) return;
    try {
      console.log('🔊 Playing start sound');
    } catch (error) {
      console.warn('Failed to play start sound:', error);
    }
  };

  const playCompleteSound = () => {
    if (!soundEnabled) return;
    try {
      console.log('🔊 Playing complete sound');
    } catch (error) {
      console.warn('Failed to play complete sound:', error);
    }
  };

  const playPauseSound = () => {
    if (!soundEnabled) return;
    try {
      console.log('🔊 Playing pause sound');
    } catch (error) {
      console.warn('Failed to play pause sound:', error);
    }
  };

  const playResumeSound = () => {
    if (!soundEnabled) return;
    try {
      console.log('🔊 Playing resume sound');
    } catch (error) {
      console.warn('Failed to play resume sound:', error);
    }
  };

  const setSoundEnabled = enabled => {
    soundEnabled = enabled;
  };

  const isSoundEnabled = () => {
    return soundEnabled;
  };

  return {
    playStartSound,
    playCompleteSound,
    playPauseSound,
    playResumeSound,
    setSoundEnabled,
    isSoundEnabled,
  };
};

// Export singleton instance for backward compatibility
const soundService = createSoundService();
export default soundService;
