import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Pomodoro Service - Manages timer logic, sessions, and persistence
 */

const STORAGE_KEYS = {
  SETTINGS: '@pomodoro_settings',
  SESSION_DATA: '@pomodoro_session',
  DAILY_STATS: '@pomodoro_daily_stats',
};

// Default settings
const DEFAULT_SETTINGS = {
  focusTime: 25, // minutes
  shortBreak: 5, // minutes
  longBreak: 15, // minutes
  longBreakInterval: 4, // after every 4 sessions
  autoStart: false,
  soundEnabled: true,
  notificationsEnabled: true,
};

// Session types
export const SESSION_TYPES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'short_break',
  LONG_BREAK: 'long_break',
};

// Timer states
export const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

class PomodoroService {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.sessionData = {
      currentSession: SESSION_TYPES.FOCUS,
      completedSessions: 0,
      timeRemaining: this.settings.focusTime * 60, // seconds
      timerState: TIMER_STATES.IDLE,
      startTime: null,
      pausedTime: 0,
    };
    this.dailyStats = {
      date: new Date().toDateString(),
      totalFocusTime: 0, // minutes
      completedPomodoros: 0,
      totalBreakTime: 0,
    };
    this.timer = null;
    this.listeners = [];
  }

  /**
   * Initialize service - load saved data
   */
  async initialize() {
    try {
      await this.loadSettings();
      await this.loadSessionData();
      await this.loadDailyStats();
      this.resetTimeRemaining();
    } catch (error) {
      console.error('Failed to initialize PomodoroService:', error);
    }
  }

  /**
   * Add listener for state changes
   */
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  /**
   * Get current state
   */
  getState() {
    return {
      settings: { ...this.settings },
      session: { ...this.sessionData },
      dailyStats: { ...this.dailyStats },
      progress: this.getProgress(),
    };
  }

  /**
   * Calculate progress percentage
   */
  getProgress() {
    const totalTime =
      this.getSessionDuration(this.sessionData.currentSession) * 60;
    const elapsed = totalTime - this.sessionData.timeRemaining;
    return Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
  }

  /**
   * Get session duration in minutes
   */
  getSessionDuration(sessionType) {
    switch (sessionType) {
      case SESSION_TYPES.FOCUS:
        return this.settings.focusTime;
      case SESSION_TYPES.SHORT_BREAK:
        return this.settings.shortBreak;
      case SESSION_TYPES.LONG_BREAK:
        return this.settings.longBreak;
      default:
        return this.settings.focusTime;
    }
  }

  /**
   * Start timer
   */
  startTimer() {
    if (this.sessionData.timerState === TIMER_STATES.RUNNING) return;

    this.sessionData.timerState = TIMER_STATES.RUNNING;
    this.sessionData.startTime = Date.now() - this.sessionData.pausedTime;

    this.timer = setInterval(() => {
      this.tick();
    }, 1000);

    this.notifyListeners();
    this.saveSessionData();
  }

  /**
   * Pause timer
   */
  pauseTimer() {
    if (this.sessionData.timerState !== TIMER_STATES.RUNNING) return;

    this.sessionData.timerState = TIMER_STATES.PAUSED;
    this.sessionData.pausedTime = Date.now() - this.sessionData.startTime;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.notifyListeners();
    this.saveSessionData();
  }

  /**
   * Resume timer
   */
  resumeTimer() {
    if (this.sessionData.timerState !== TIMER_STATES.PAUSED) return;
    this.startTimer();
  }

  /**
   * Reset timer
   */
  resetTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.sessionData.timerState = TIMER_STATES.IDLE;
    this.sessionData.startTime = null;
    this.sessionData.pausedTime = 0;
    this.resetTimeRemaining();

    this.notifyListeners();
    this.saveSessionData();
  }

  /**
   * Reset time remaining to current session duration
   */
  resetTimeRemaining() {
    const duration = this.getSessionDuration(this.sessionData.currentSession);
    this.sessionData.timeRemaining = duration * 60;
  }

  /**
   * Timer tick - called every second
   */
  tick() {
    if (this.sessionData.timeRemaining > 0) {
      this.sessionData.timeRemaining--;
      this.notifyListeners();
    } else {
      this.completeSession();
    }
  }

  /**
   * Complete current session
   */
  completeSession() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.sessionData.timerState = TIMER_STATES.COMPLETED;

    // Update stats
    if (this.sessionData.currentSession === SESSION_TYPES.FOCUS) {
      this.sessionData.completedSessions++;
      this.dailyStats.completedPomodoros++;
      this.dailyStats.totalFocusTime += this.settings.focusTime;
    } else {
      this.dailyStats.totalBreakTime += this.getSessionDuration(
        this.sessionData.currentSession,
      );
    }

    // Determine next session
    this.moveToNextSession();

    // Save data
    this.saveDailyStats();
    this.saveSessionData();
    this.notifyListeners();
  }

  /**
   * Move to next session
   */
  moveToNextSession() {
    if (this.sessionData.currentSession === SESSION_TYPES.FOCUS) {
      // Focus completed - determine break type
      const isLongBreak =
        this.sessionData.completedSessions % this.settings.longBreakInterval ===
        0;
      this.sessionData.currentSession = isLongBreak
        ? SESSION_TYPES.LONG_BREAK
        : SESSION_TYPES.SHORT_BREAK;
    } else {
      // Break completed - back to focus
      this.sessionData.currentSession = SESSION_TYPES.FOCUS;
    }

    this.resetTimeRemaining();
    this.sessionData.timerState = TIMER_STATES.IDLE;
    this.sessionData.startTime = null;
    this.sessionData.pausedTime = 0;
  }

  /**
   * Skip current session
   */
  skipSession() {
    this.completeSession();
  }

  /**
   * Format time for display
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  /**
   * Update settings
   */
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();

    // Reset current session if timer is idle
    if (this.sessionData.timerState === TIMER_STATES.IDLE) {
      this.resetTimeRemaining();
    }

    this.notifyListeners();
  }

  /**
   * Get session label
   */
  getSessionLabel(sessionType = this.sessionData.currentSession) {
    switch (sessionType) {
      case SESSION_TYPES.FOCUS:
        return 'Thời gian tập trung';
      case SESSION_TYPES.SHORT_BREAK:
        return 'Nghỉ ngắn';
      case SESSION_TYPES.LONG_BREAK:
        return 'Nghỉ dài';
      default:
        return 'Thời gian tập trung';
    }
  }

  /**
   * Storage methods
   */
  async saveSettings() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(this.settings),
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async loadSettings() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async saveSessionData() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSION_DATA,
        JSON.stringify(this.sessionData),
      );
    } catch (error) {
      console.error('Failed to save session data:', error);
    }
  }

  async loadSessionData() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_DATA);
      if (saved) {
        const data = JSON.parse(saved);
        this.sessionData = { ...this.sessionData, ...data };
        // Reset timer state on app restart
        this.sessionData.timerState = TIMER_STATES.IDLE;
        this.sessionData.startTime = null;
        this.sessionData.pausedTime = 0;
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    }
  }

  async saveDailyStats() {
    try {
      // Reset stats if new day
      const today = new Date().toDateString();
      if (this.dailyStats.date !== today) {
        this.dailyStats = {
          date: today,
          totalFocusTime: 0,
          completedPomodoros: 0,
          totalBreakTime: 0,
        };
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.DAILY_STATS,
        JSON.stringify(this.dailyStats),
      );
    } catch (error) {
      console.error('Failed to save daily stats:', error);
    }
  }

  async loadDailyStats() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STATS);
      if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();

        if (data.date === today) {
          this.dailyStats = data;
        } else {
          // New day - reset stats
          this.dailyStats.date = today;
        }
      }
    } catch (error) {
      console.error('Failed to load daily stats:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.listeners = [];
  }
}

// Export singleton instance
const pomodoroService = new PomodoroService();
export default pomodoroService;
