import { useState, useCallback, useRef } from 'react';

/**
 * Quotes Service for ZenHub App
 * Provides motivational quotes and productivity tips
 * Converted to function-based with React hooks
 */

const MOTIVATIONAL_QUOTES = [
  {
    text: 'Cách để bắt đầu là ngừng nói và bắt đầu làm.',
    author: 'Walt Disney',
  },
  {
    text: 'Đừng nhìn đồng hồ; hãy làm như đồng hồ vậy. Cứ tiếp tục.',
    author: 'Sam Levenson',
  },
  {
    text: 'Tập trung vào việc năng suất thay vì bận rộn.',
    author: 'Tim Ferriss',
  },
  {
    text: 'Thời gian là thứ chúng ta muốn nhất, nhưng sử dụng tệ nhất.',
    author: 'William Penn',
  },
  {
    text: 'Chìa khóa không phải là ưu tiên những gì trong lịch trình, mà là lên lịch cho ưu tiên của bạn.',
    author: 'Stephen Covey',
  },
  {
    text: 'Năng suất không bao giờ là tai nạn. Nó luôn là kết quả của cam kết với sự xuất sắc.',
    author: 'Paul J. Meyer',
  },
  {
    text: 'Bạn không cần phải giỏi để bắt đầu, nhưng bạn phải bắt đầu để trở nên giỏi.',
    author: 'Les Brown',
  },
  {
    text: 'Tương lai phụ thuộc vào những gì bạn làm hôm nay.',
    author: 'Mahatma Gandhi',
  },
  {
    text: 'Thành công là tổng của những nỗ lực nhỏ được lặp lại ngày này qua ngày khác.',
    author: 'Robert Collier',
  },
  {
    text: 'Điều nằm sau chúng ta và điều nằm trước chúng ta chỉ là những vấn đề nhỏ so với điều nằm trong chúng ta.',
    author: 'Ralph Waldo Emerson',
  },
];

const PRODUCTIVITY_TIPS = [
  '💡 Hít thở sâu trong giờ nghỉ để làm mới tâm trí',
  '🚶‍♂️ Đứng lên và vươn vai giữa các phiên',
  '💧 Giữ nước - luôn để nước gần bên',
  '🎯 Viết ra 3 mục tiêu chính trước khi bắt đầu',
  '📱 Tắt thông báo trong thời gian tập trung',
  '🌱 Để một chậu cây gần bên để có không khí tốt hơn',
  '👀 Tuân theo quy tắc 20-20-20: Cứ 20 phút, nhìn vào thứ gì đó cách 20 feet trong 20 giây',
  '🎵 Thử nhạc nhẹ nhàng hoặc âm thanh thiên nhiên',
  '📝 Để sẵn giấy và bút cho những ý tưởng bất chợt',
  '🧘‍♀️ Thực hành chánh niệm trong giờ nghỉ',
  '☕ Tránh ăn no trước phiên tập trung',
  '🌅 Làm việc trong khung giờ năng suất nhất',
  '🎨 Sắp xếp không gian làm việc trước khi bắt đầu',
  '📚 Làm một việc thay vì đa nhiệm',
  '⏰ Lên kế hoạch cho các phiên ngày mai từ hôm nay',
];

const FOCUS_MANTRAS = [
  '🎯 One task, full attention',
  '🌊 Flow with focus',
  '⚡ Energy follows intention',
  '🔥 Discipline creates freedom',
  '🚀 Progress over perfection',
  '💎 Quality over quantity',
  '🎪 Present moment awareness',
  '🌟 You are capable of amazing things',
  '💪 Strong mind, strong focus',
  '🏆 Champions are made in the process',
];

// Global state for quotes service
let globalQuotesState = {
  lastQuoteIndex: -1,
  lastTipIndex: -1,
  lastMantraIndex: -1,
};

// Custom hook for Quotes functionality
export const useQuotesService = () => {
  const [lastQuoteIndex, setLastQuoteIndex] = useState(
    globalQuotesState.lastQuoteIndex,
  );
  const [lastTipIndex, setLastTipIndex] = useState(
    globalQuotesState.lastTipIndex,
  );
  const [lastMantraIndex, setLastMantraIndex] = useState(
    globalQuotesState.lastMantraIndex,
  );

  // Get a random motivational quote
  const getMotivationalQuote = useCallback(() => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    } while (randomIndex === lastQuoteIndex && MOTIVATIONAL_QUOTES.length > 1);

    setLastQuoteIndex(randomIndex);
    globalQuotesState.lastQuoteIndex = randomIndex;
    return MOTIVATIONAL_QUOTES[randomIndex];
  }, [lastQuoteIndex]);

  // Get a random productivity tip
  const getProductivityTip = useCallback(() => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * PRODUCTIVITY_TIPS.length);
    } while (randomIndex === lastTipIndex && PRODUCTIVITY_TIPS.length > 1);

    setLastTipIndex(randomIndex);
    globalQuotesState.lastTipIndex = randomIndex;
    return PRODUCTIVITY_TIPS[randomIndex];
  }, [lastTipIndex]);

  // Get a random focus mantra
  const getFocusMantra = useCallback(() => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * FOCUS_MANTRAS.length);
    } while (randomIndex === lastMantraIndex && FOCUS_MANTRAS.length > 1);

    setLastMantraIndex(randomIndex);
    globalQuotesState.lastMantraIndex = randomIndex;
    return FOCUS_MANTRAS[randomIndex];
  }, [lastMantraIndex]);

  // Get context-appropriate content based on session type
  const getContentForSession = useCallback(
    sessionType => {
      switch (sessionType) {
        case 'focus':
          return {
            type: 'mantra',
            content: getFocusMantra(),
          };
        case 'short_break':
        case 'long_break':
          return {
            type: 'tip',
            content: getProductivityTip(),
          };
        default:
          return {
            type: 'quote',
            content: getMotivationalQuote(),
          };
      }
    },
    [getFocusMantra, getProductivityTip, getMotivationalQuote],
  );

  // Get random encouraging message for session completion
  const getCompletionMessage = useCallback(sessionType => {
    const focusMessages = [
      "🎉 Great focus session! You're building momentum!",
      '💪 Well done! Your concentration is improving!',
      '🌟 Excellent work! Time for a well-deserved break!',
      '🔥 You crushed that session! Keep it up!',
      "✨ Amazing focus! You're in the zone!",
    ];

    const breakMessages = [
      '😌 Perfect break! Ready to refocus?',
      '🔋 Recharged and ready to go!',
      '☀️ Great break! Your mind is refreshed!',
      '🌸 Well rested! Time to dive back in!',
      "💫 Refreshed and renewed! Let's focus!",
    ];

    const messages = sessionType === 'focus' ? focusMessages : breakMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  }, []);

  // Get daily motivation based on current stats
  const getDailyMotivation = useCallback(
    (completedPomodoros, totalFocusTime) => {
      if (completedPomodoros === 0) {
        return '🌅 Start your productive day! The first Pomodoro is always the hardest.';
      } else if (completedPomodoros < 4) {
        return `🚀 ${completedPomodoros} Pomodoros down! You're building great habits!`;
      } else if (completedPomodoros < 8) {
        return `🏆 ${completedPomodoros} Pomodoros completed! You're on fire today!`;
      } else {
        return `🌟 ${completedPomodoros} Pomodoros! You're a productivity champion!`;
      }
    },
    [],
  );

  return {
    getMotivationalQuote,
    getProductivityTip,
    getFocusMantra,
    getContentForSession,
    getCompletionMessage,
    getDailyMotivation,
  };
};

// Legacy singleton for backward compatibility
const createQuotesService = () => {
  let lastQuoteIndex = -1;
  let lastTipIndex = -1;
  let lastMantraIndex = -1;

  const getMotivationalQuote = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    } while (randomIndex === lastQuoteIndex && MOTIVATIONAL_QUOTES.length > 1);

    lastQuoteIndex = randomIndex;
    return MOTIVATIONAL_QUOTES[randomIndex];
  };

  const getProductivityTip = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * PRODUCTIVITY_TIPS.length);
    } while (randomIndex === lastTipIndex && PRODUCTIVITY_TIPS.length > 1);

    lastTipIndex = randomIndex;
    return PRODUCTIVITY_TIPS[randomIndex];
  };

  const getFocusMantra = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * FOCUS_MANTRAS.length);
    } while (randomIndex === lastMantraIndex && FOCUS_MANTRAS.length > 1);

    lastMantraIndex = randomIndex;
    return FOCUS_MANTRAS[randomIndex];
  };

  const getContentForSession = sessionType => {
    switch (sessionType) {
      case 'focus':
        return {
          type: 'mantra',
          content: getFocusMantra(),
        };
      case 'short_break':
      case 'long_break':
        return {
          type: 'tip',
          content: getProductivityTip(),
        };
      default:
        return {
          type: 'quote',
          content: getMotivationalQuote(),
        };
    }
  };

  const getCompletionMessage = sessionType => {
    const focusMessages = [
      "🎉 Great focus session! You're building momentum!",
      '💪 Well done! Your concentration is improving!',
      '🌟 Excellent work! Time for a well-deserved break!',
      '🔥 You crushed that session! Keep it up!',
      "✨ Amazing focus! You're in the zone!",
    ];

    const breakMessages = [
      '😌 Perfect break! Ready to refocus?',
      '🔋 Recharged and ready to go!',
      '☀️ Great break! Your mind is refreshed!',
      '🌸 Well rested! Time to dive back in!',
      "💫 Refreshed and renewed! Let's focus!",
    ];

    const messages = sessionType === 'focus' ? focusMessages : breakMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getDailyMotivation = (completedPomodoros, totalFocusTime) => {
    if (completedPomodoros === 0) {
      return '🌅 Start your productive day! The first Pomodoro is always the hardest.';
    } else if (completedPomodoros < 4) {
      return `🚀 ${completedPomodoros} Pomodoros down! You're building great habits!`;
    } else if (completedPomodoros < 8) {
      return `🏆 ${completedPomodoros} Pomodoros completed! You're on fire today!`;
    } else {
      return `🌟 ${completedPomodoros} Pomodoros! You're a productivity champion!`;
    }
  };

  return {
    getMotivationalQuote,
    getProductivityTip,
    getFocusMantra,
    getContentForSession,
    getCompletionMessage,
    getDailyMotivation,
  };
};

// Export singleton instance for backward compatibility
const quotesService = createQuotesService();
export default quotesService;
