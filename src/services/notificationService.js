import { Alert } from 'react-native';
import { safeVibrate } from '../utils/vibration';

/**
 * Notification Service for Pomodoro Timer
 * Simple implementation using Alert for notifications
 * No external dependencies required
 */

class NotificationService {
  constructor() {
    this.initialized = false;
    this.notificationsEnabled = true;
  }

  /**
   * Initialize notification service
   */
  initialize() {
    if (this.initialized) return;

    try {
      this.initialized = true;
      console.log('✅ Notification service initialized (Alert-based)');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      this.notificationsEnabled = false;
    }
  }

  /**
   * Show session complete notification using Alert
   */
  showSessionComplete(sessionType, nextSessionType) {
    if (!this.notificationsEnabled) {
      console.log(`📱 ${sessionType} completed! Next: ${nextSessionType}`);
      return;
    }

    const title = this.getCompletionTitle(sessionType);
    const message = this.getCompletionMessage(sessionType, nextSessionType);

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
  }

  /**
   * Get completion title based on session type
   */
  getCompletionTitle(sessionType) {
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
  }

  /**
   * Get completion message
   */
  getCompletionMessage(sessionType, nextSessionType) {
    const nextLabel = this.getSessionLabel(nextSessionType);

    if (sessionType === 'focus') {
      return `Làm tốt lắm! Đã đến giờ nghỉ ngơi.\n\nTiếp theo: ${nextLabel}`;
    } else {
      return `Hết giờ nghỉ rồi. Sẵn sàng tập trung chưa?\n\nTiếp theo: ${nextLabel}`;
    }
  }

  /**
   * Get session label
   */
  getSessionLabel(sessionType) {
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
  }

  /**
   * Schedule a notification for session end (Alert-based)
   */
  scheduleSessionEndNotification(minutes, sessionType) {
    if (!this.notificationsEnabled) return;

    try {
      // For Alert-based notifications, we don't schedule in advance
      // The timer will call showSessionComplete when ready
      console.log(
        `📱 Notification scheduled for ${minutes}min ${sessionType} session`,
      );
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  cancelAllNotifications() {
    try {
      // For Alert-based notifications, no cancellation needed
      console.log('📱 Notifications cleared');
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  }

  /**
   * Enable/disable notifications
   */
  setNotificationsEnabled(enabled) {
    this.notificationsEnabled = enabled;
    console.log(`📱 Notifications ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get notification status
   */
  isNotificationsEnabled() {
    return this.notificationsEnabled;
  }
}

// Export singleton instance
const notificationService = new NotificationService();

export default notificationService;
