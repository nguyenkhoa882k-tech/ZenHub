import { Alert } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { safeVibrate } from '../utils/vibration';

/**
 * Notification Service for ZenHub App
 * Simple implementation using Alert for notifications
 * No external dependencies required
 * Converted to function-based with React hooks
 */

// Global state for notification service
let globalNotificationState = {
  initialized: false,
  notificationsEnabled: true,
};

// Custom hook for Notification functionality
export const useNotificationService = () => {
  const [initialized, setInitialized] = useState(
    globalNotificationState.initialized,
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    globalNotificationState.notificationsEnabled,
  );

  // Initialize notification service
  const initialize = useCallback(() => {
    if (initialized) return;

    try {
      setInitialized(true);
      globalNotificationState.initialized = true;
      console.log('✅ Notification service initialized (Alert-based)');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      setNotificationsEnabled(false);
      globalNotificationState.notificationsEnabled = false;
    }
  }, [initialized]);

  // Show session complete notification using Alert
  const showSessionComplete = useCallback(
    (sessionType, nextSessionType) => {
      if (!notificationsEnabled) {
        console.log(`📱 ${sessionType} completed! Next: ${nextSessionType}`);
        return;
      }

      const title = getCompletionTitle(sessionType);
      const message = getCompletionMessage(sessionType, nextSessionType);

      try {
        // Use vibration for notification feedback
        safeVibrate(300);

        // Show Alert as notification
        Alert.alert(
          title,
          message,
          [
            {
              text: 'Continue',
              style: 'default',
              onPress: () => console.log('Session notification acknowledged'),
            },
          ],
          {
            cancelable: true,
            userInterfaceStyle: 'light',
          },
        );
      } catch (error) {
        console.error('Failed to show notification:', error);
        // Fallback to console
        console.log(`📱 ${title}: ${message}`);
      }
    },
    [notificationsEnabled],
  );

  // Get completion title based on session type
  const getCompletionTitle = useCallback(sessionType => {
    switch (sessionType) {
      case 'focus':
        return '🍅 Hoàn thành Pomodoro!';
      case 'short_break':
        return '☕ Hoàn thành nghỉ ngắn!';
      case 'long_break':
        return '🛋️ Hoàn thành nghỉ dài!';
      default:
        return '⏰ Hoàn thành phiên!';
    }
  }, []);

  // Get completion message
  const getCompletionMessage = useCallback((sessionType, nextSessionType) => {
    const nextLabel = getSessionLabel(nextSessionType);

    if (sessionType === 'focus') {
      return `Làm tốt lắm! Đã đến giờ nghỉ ngơi.\n\nTiếp theo: ${nextLabel}`;
    } else {
      return `Hết giờ nghỉ rồi. Sẵn sàng tập trung chưa?\n\nTiếp theo: ${nextLabel}`;
    }
  }, []);

  // Get session label
  const getSessionLabel = useCallback(sessionType => {
    switch (sessionType) {
      case 'focus':
        return 'Thời gian tập trung';
      case 'short_break':
        return 'Nghỉ ngắn';
      case 'long_break':
        return 'Nghỉ dài';
      default:
        return 'Thời gian tập trung';
    }
  }, []);

  // Schedule a notification for session end (Alert-based)
  const scheduleSessionEndNotification = useCallback(
    (minutes, sessionType) => {
      if (!notificationsEnabled) return;

      try {
        // For Alert-based notifications, we don't schedule in advance
        // The timer will call showSessionComplete when ready
        console.log(
          `📱 Notification scheduled for ${minutes}min ${sessionType} session`,
        );
      } catch (error) {
        console.error('Failed to schedule notification:', error);
      }
    },
    [notificationsEnabled],
  );

  // Cancel all scheduled notifications
  const cancelAllNotifications = useCallback(() => {
    try {
      // For Alert-based notifications, no cancellation needed
      console.log('📱 Notifications cleared');
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  }, []);

  // Enable/disable notifications
  const setNotificationsEnabledState = useCallback(enabled => {
    setNotificationsEnabled(enabled);
    globalNotificationState.notificationsEnabled = enabled;
    console.log(`📱 Notifications ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  // Get notification status
  const isNotificationsEnabled = useCallback(() => {
    return notificationsEnabled;
  }, [notificationsEnabled]);

  return {
    initialized,
    notificationsEnabled,
    initialize,
    showSessionComplete,
    getCompletionTitle,
    getCompletionMessage,
    getSessionLabel,
    scheduleSessionEndNotification,
    cancelAllNotifications,
    setNotificationsEnabled: setNotificationsEnabledState,
    isNotificationsEnabled,
  };
};

// Legacy singleton for backward compatibility
const createNotificationService = () => {
  let initialized = false;
  let notificationsEnabled = true;

  const initialize = () => {
    if (initialized) return;

    try {
      initialized = true;
      console.log('✅ Notification service initialized (Alert-based)');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      notificationsEnabled = false;
    }
  };

  const showSessionComplete = (sessionType, nextSessionType) => {
    if (!notificationsEnabled) {
      console.log(`📱 ${sessionType} completed! Next: ${nextSessionType}`);
      return;
    }

    const title = getCompletionTitle(sessionType);
    const message = getCompletionMessage(sessionType, nextSessionType);

    try {
      safeVibrate(300);
      Alert.alert(
        title,
        message,
        [
          {
            text: 'Continue',
            style: 'default',
            onPress: () => console.log('Session notification acknowledged'),
          },
        ],
        {
          cancelable: true,
          userInterfaceStyle: 'light',
        },
      );
    } catch (error) {
      console.error('Failed to show notification:', error);
      console.log(`📱 ${title}: ${message}`);
    }
  };

  const getCompletionTitle = sessionType => {
    switch (sessionType) {
      case 'focus':
        return '🍅 Hoàn thành Pomodoro!';
      case 'short_break':
        return '☕ Hoàn thành nghỉ ngắn!';
      case 'long_break':
        return '🛋️ Hoàn thành nghỉ dài!';
      default:
        return '⏰ Hoàn thành phiên!';
    }
  };

  const getCompletionMessage = (sessionType, nextSessionType) => {
    const nextLabel = getSessionLabel(nextSessionType);

    if (sessionType === 'focus') {
      return `Làm tốt lắm! Đã đến giờ nghỉ ngơi.\n\nTiếp theo: ${nextLabel}`;
    } else {
      return `Hết giờ nghỉ rồi. Sẵn sàng tập trung chưa?\n\nTiếp theo: ${nextLabel}`;
    }
  };

  const getSessionLabel = sessionType => {
    switch (sessionType) {
      case 'focus':
        return 'Thời gian tập trung';
      case 'short_break':
        return 'Nghỉ ngắn';
      case 'long_break':
        return 'Nghỉ dài';
      default:
        return 'Thời gian tập trung';
    }
  };

  const scheduleSessionEndNotification = (minutes, sessionType) => {
    if (!notificationsEnabled) return;

    try {
      console.log(
        `📱 Notification scheduled for ${minutes}min ${sessionType} session`,
      );
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  };

  const cancelAllNotifications = () => {
    try {
      console.log('📱 Notifications cleared');
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  };

  const setNotificationsEnabled = enabled => {
    notificationsEnabled = enabled;
    console.log(`📱 Notifications ${enabled ? 'enabled' : 'disabled'}`);
  };

  const isNotificationsEnabled = () => {
    return notificationsEnabled;
  };

  return {
    initialize,
    showSessionComplete,
    getCompletionTitle,
    getCompletionMessage,
    getSessionLabel,
    scheduleSessionEndNotification,
    cancelAllNotifications,
    setNotificationsEnabled,
    isNotificationsEnabled,
  };
};

// Export singleton instance for backward compatibility
const notificationService = createNotificationService();
export default notificationService;
