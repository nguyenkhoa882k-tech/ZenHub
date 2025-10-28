import AsyncStorage from '@react-native-async-storage/async-storage';

// Mapping cho Open Trivia Database API
const API_CATEGORY_MAP = {
  'general-knowledge': 9,
  books: 10,
  film: 11,
  music: 12,
  television: 14,
  science: 17,
  computers: 18,
  mathematics: 19,
  mythology: 20,
  sports: 21,
  geography: 22,
  history: 23,
  politics: 24,
  celebrities: 26,
  animals: 27,
  vehicles: 28,
};

// Các danh mục câu hỏi
export const QUESTION_CATEGORIES = [
  {
    key: 'vietnam-history',
    name: 'Lịch Sử Việt Nam',
    emoji: '🏛️',
    source: 'local',
  },
  {
    key: 'vietnam-geography',
    name: 'Địa Lý Việt Nam',
    emoji: '🗺️',
    source: 'local',
  },
  {
    key: 'vietnamese-culture',
    name: 'Văn Hóa Việt Nam',
    emoji: '🎭',
    source: 'local',
  },
  {
    key: 'vietnamese-literature',
    name: 'Văn Học Việt Nam',
    emoji: '📚',
    source: 'local',
  },
  {
    key: 'vietnam-food',
    name: 'Ẩm Thực Việt Nam',
    emoji: '🍜',
    source: 'local',
  },
  {
    key: 'general-knowledge',
    name: 'General Knowledge',
    emoji: '🧠',
    source: 'api',
  },
  { key: 'science', name: 'Science & Nature', emoji: '🔬', source: 'api' },
  { key: 'geography', name: 'Geography', emoji: '🌍', source: 'api' },
  { key: 'history', name: 'History', emoji: '📜', source: 'api' },
  { key: 'sports', name: 'Sports', emoji: '⚽', source: 'api' },
];

// Bộ câu hỏi tiếng Việt
const VIETNAMESE_QUESTIONS = {
  'vietnam-history': [
    {
      question: 'Ai là người sáng lập ra nhà nước Đại Việt?',
      correctAnswer: 'Đinh Bộ Lĩnh',
      incorrectAnswers: ['Lý Thái Tổ', 'Trần Thái Tông', 'Lê Lợi'],
      difficulty: 'medium',
      language: 'vi',
    },
    {
      question: 'Cuộc khởi nghĩa Hai Bà Trưng diễn ra vào năm nào?',
      correctAnswer: '40 - 43',
      incorrectAnswers: ['39 - 42', '41 - 44', '38 - 41'],
      difficulty: 'hard',
      language: 'vi',
    },
    {
      question: 'Thủ đô đầu tiên của nước Việt Nam độc lập là?',
      correctAnswer: 'Hoa Lư',
      incorrectAnswers: ['Thăng Long', 'Phú Xuân', 'Tây Đô'],
      difficulty: 'medium',
      language: 'vi',
    },
    {
      question: 'Ai là vị vua đầu tiên của triều đại Lý?',
      correctAnswer: 'Lý Thái Tổ',
      incorrectAnswers: ['Lý Thánh Tông', 'Lý Nhân Tông', 'Lý Cao Tông'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: 'Trận Bạch Đằng nổi tiếng nhất do ai chỉ huy?',
      correctAnswer: 'Ngô Quyền',
      incorrectAnswers: ['Trần Hưng Đạo', 'Lê Lợi', 'Quang Trung'],
      difficulty: 'medium',
      language: 'vi',
    },
  ],
  'vietnam-geography': [
    {
      question: 'Dãy núi cao nhất Việt Nam là gì?',
      correctAnswer: 'Hoàng Liên Sơn',
      incorrectAnswers: ['Trường Sơn', 'Tây Nguyên', 'Ba Vì'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: 'Sông nào dài nhất Việt Nam?',
      correctAnswer: 'Sông Mê Kông',
      incorrectAnswers: ['Sông Hồng', 'Sông Đồng Nai', 'Sông Mã'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: 'Việt Nam có bao nhiều tỉnh thành?',
      correctAnswer: '63',
      incorrectAnswers: ['64', '62', '65'],
      difficulty: 'medium',
      language: 'vi',
    },
    {
      question: 'Đỉnh núi cao nhất Việt Nam là?',
      correctAnswer: 'Phan Xi Păng',
      incorrectAnswers: ['Pu Ta Leng', 'Pu Si Lung', 'Ngọc Linh'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: "Thành phố nào được gọi là 'Thủ đô cà phê Việt Nam'?",
      correctAnswer: 'Buôn Ma Thuột',
      incorrectAnswers: ['Đà Lạt', 'Pleiku', 'Kon Tum'],
      difficulty: 'medium',
      language: 'vi',
    },
  ],
  'vietnamese-culture': [
    {
      question: 'Tết Nguyên Đán được tính theo lịch gì?',
      correctAnswer: 'Âm lịch',
      incorrectAnswers: ['Dương lịch', 'Lịch Maya', 'Lịch Julian'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: 'Bánh chưng có ý nghĩa gì trong văn hóa Việt Nam?',
      correctAnswer: 'Biểu tượng đất trời',
      incorrectAnswers: [
        'Biểu tượng may mắn',
        'Biểu tượng thịnh vượng',
        'Biểu tượng đoàn viên',
      ],
      difficulty: 'medium',
      language: 'vi',
    },
    {
      question: 'Áo dài truyền thống Việt Nam có mấy tà?',
      correctAnswer: '2 tà',
      incorrectAnswers: ['1 tà', '3 tà', '4 tà'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: 'Lễ hội Đền Hùng được tổ chức vào ngày nào?',
      correctAnswer: '10/3 âm lịch',
      incorrectAnswers: ['15/8 âm lịch', '10/10 âm lịch', '1/1 âm lịch'],
      difficulty: 'medium',
      language: 'vi',
    },
    {
      question: 'Ca trù là loại hình nghệ thuật gì?',
      correctAnswer: 'Hát văn',
      incorrectAnswers: [
        'Múa dân gian',
        'Kịch truyền thống',
        'Âm nhạc cung đình',
      ],
      difficulty: 'hard',
      language: 'vi',
    },
  ],
  'vietnamese-literature': [
    {
      question: "Ai là tác giả của 'Truyện Kiều'?",
      correctAnswer: 'Nguyễn Du',
      incorrectAnswers: ['Nguyễn Bỉnh Khiêm', 'Nguyễn Trãi', 'Hồ Xuân Hương'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: "'Số Đỏ' là tác phẩm của ai?",
      correctAnswer: 'Vũ Trọng Phụng',
      incorrectAnswers: ['Nam Cao', 'Ngô Tất Tố', 'Tô Hoài'],
      difficulty: 'medium',
      language: 'vi',
    },
    {
      question: "Tác phẩm 'Lão Hạc' của Nam Cao thuộc thể loại gì?",
      correctAnswer: 'Truyện ngắn',
      incorrectAnswers: ['Tiểu thuyết', 'Kịch', 'Thơ'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: "Ai được mệnh danh là 'Bà chúa thơ Nôm'?",
      correctAnswer: 'Hồ Xuân Hương',
      incorrectAnswers: ['Xuân Diệu', 'Nguyễn Bỉnh Khiêm', 'Đoàn Thị Điểm'],
      difficulty: 'medium',
      language: 'vi',
    },
    {
      question:
        "'Chữ người tư tế phải rằng: Trọng tình, trọng nghĩa, trọng tài, trọng sắc' là câu thơ của ai?",
      correctAnswer: 'Nguyễn Du',
      incorrectAnswers: ['Nguyễn Trãi', 'Hồ Xuân Hương', 'Nguyễn Bỉnh Khiêm'],
      difficulty: 'hard',
      language: 'vi',
    },
  ],
  'vietnam-food': [
    {
      question: 'Món ăn nào được coi là quốc hồn của Việt Nam?',
      correctAnswer: 'Phở',
      incorrectAnswers: ['Bún chả', 'Bánh mì', 'Nem rán'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: 'Nước mắm ngon nhất Việt Nam được sản xuất ở đâu?',
      correctAnswer: 'Phú Quốc',
      incorrectAnswers: ['Phan Thiết', 'Cà Mau', 'Vũng Tàu'],
      difficulty: 'medium',
      language: 'vi',
    },
    {
      question: 'Bánh cuốn là đặc sản của vùng nào?',
      correctAnswer: 'Miền Bắc',
      incorrectAnswers: ['Miền Trung', 'Miền Nam', 'Tây Nguyên'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: 'Cơm tấm là món ăn đặc trưng của thành phố nào?',
      correctAnswer: 'Sài Gòn',
      incorrectAnswers: ['Hà Nội', 'Đà Nẵng', 'Huế'],
      difficulty: 'easy',
      language: 'vi',
    },
    {
      question: 'Món bánh ít là đặc sản của tỉnh nào?',
      correctAnswer: 'Huế',
      incorrectAnswers: ['Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi'],
      difficulty: 'medium',
      language: 'vi',
    },
  ],
};

// Fetch questions từ Open Trivia Database API
const fetchQuestionsFromAPI = async (
  category = null,
  difficulty = null,
  amount = 10,
) => {
  try {
    let url = `https://opentdb.com/api.php?amount=${amount}`;

    if (category && API_CATEGORY_MAP[category]) {
      url += `&category=${API_CATEGORY_MAP[category]}`;
    }

    if (difficulty) {
      url += `&difficulty=${difficulty}`;
    }

    url += '&type=multiple';

    console.log('Fetching questions from API:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (data.response_code === 0 && data.results) {
      return data.results.map((question, index) => ({
        id: `api_${Date.now()}_${index}`,
        question: decodeHTMLEntities(question.question),
        category: question.category,
        difficulty: question.difficulty,
        correctAnswer: decodeHTMLEntities(question.correct_answer),
        incorrectAnswers: question.incorrect_answers.map(answer =>
          decodeHTMLEntities(answer),
        ),
        allAnswers: shuffleArray([
          decodeHTMLEntities(question.correct_answer),
          ...question.incorrect_answers.map(answer =>
            decodeHTMLEntities(answer),
          ),
        ]),
        points: getDifficultyPoints(question.difficulty),
        timestamp: Date.now(),
        language: 'en',
        source: 'api',
      }));
    } else {
      throw new Error('No questions available from API');
    }
  } catch (error) {
    console.error('Error fetching questions from API:', error);
    throw error;
  }
};

// Helper function to decode HTML entities
const decodeHTMLEntities = text => {
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
  };
  return text.replace(/&[#\w]+;/g, entity => map[entity] || entity);
};

// Fetch questions từ local Vietnamese database
const fetchQuestionsFromLocal = (category = null, amount = 10) => {
  try {
    let questions = [];

    if (category && VIETNAMESE_QUESTIONS[category]) {
      // Lấy câu hỏi tiếng Việt theo category
      questions = [...VIETNAMESE_QUESTIONS[category]];
    } else if (!category) {
      // Lấy tất cả câu hỏi tiếng Việt
      Object.values(VIETNAMESE_QUESTIONS).forEach(categoryQuestions => {
        questions.push(...categoryQuestions);
      });
    }

    // Trộn câu hỏi ngẫu nhiên
    const shuffled = questions.sort(() => 0.5 - Math.random());

    // Lấy số lượng câu hỏi yêu cầu
    const selectedQuestions = shuffled.slice(
      0,
      Math.min(amount, shuffled.length),
    );

    return selectedQuestions.map((question, index) => ({
      id: `local_${Date.now()}_${index}`,
      question: question.question,
      correct_answer: question.correctAnswer,
      incorrect_answers: question.incorrectAnswers,
      difficulty: question.difficulty,
      category: category || 'vietnamese',
      language: question.language || 'vi',
      correctAnswer: question.correctAnswer,
      incorrectAnswers: question.incorrectAnswers,
      allAnswers: shuffleArray([
        question.correctAnswer,
        ...question.incorrectAnswers,
      ]),
      points: getDifficultyPoints(question.difficulty),
      timestamp: Date.now(),
      source: 'local',
    }));
  } catch (error) {
    console.error('Error fetching local questions:', error);
    return [];
  }
};

// Main function - sử dụng cả API và local database
export const fetchQuestions = async (
  category = null,
  difficulty = null,
  amount = 10,
) => {
  try {
    const selectedCategory = QUESTION_CATEGORIES.find(
      cat => cat.key === category,
    );

    if (selectedCategory && selectedCategory.source === 'local') {
      // Sử dụng database local cho câu hỏi tiếng Việt
      return fetchQuestionsFromLocal(category, amount);
    } else if (selectedCategory && selectedCategory.source === 'api') {
      // Sử dụng API cho câu hỏi tiếng Anh
      return await fetchQuestionsFromAPI(category, difficulty, amount);
    } else {
      // Trộn lẫn: 70% local, 30% API
      const localAmount = Math.ceil(amount * 0.7);
      const apiAmount = amount - localAmount;

      const localQuestions = fetchQuestionsFromLocal(null, localAmount);
      let apiQuestions = [];

      try {
        apiQuestions = await fetchQuestionsFromAPI(
          'general-knowledge',
          null,
          apiAmount,
        );
      } catch (error) {
        console.log('API failed, using only local questions');
      }

      return shuffleArray([...localQuestions, ...apiQuestions]);
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    // Fallback to local questions if API fails
    return fetchQuestionsFromLocal(category, amount);
  }
};

// Helper functions
const shuffleArray = array => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getDifficultyPoints = difficulty => {
  switch (difficulty) {
    case 'easy':
      return 10;
    case 'medium':
      return 20;
    case 'hard':
      return 30;
    default:
      return 10;
  }
};

// Storage keys
const STORAGE_KEYS = {
  USER_STATS: 'quiz_user_stats',
  DAILY_PROGRESS: 'quiz_daily_progress',
  ASKED_QUESTIONS: 'quiz_asked_questions',
};

// Get user statistics
export const getUserStats = async () => {
  try {
    const stats = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
    return stats
      ? JSON.parse(stats)
      : {
          totalQuestions: 0,
          correctAnswers: 0,
          totalPoints: 0,
          level: 1,
          experience: 0,
          streak: 0,
          bestStreak: 0,
          categoriesUnlocked: ['general-knowledge'],
          achievements: [],
        };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};

// Update user statistics
export const updateUserStats = async newStats => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_STATS,
      JSON.stringify(newStats),
    );
    return true;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return false;
  }
};

// Get daily progress
export const getDailyProgress = async () => {
  try {
    const today = new Date().toDateString();
    const progress = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);

    if (progress) {
      const data = JSON.parse(progress);
      if (data.date === today) {
        return data;
      }
    }

    // Return new day progress
    return {
      date: today,
      questionsAnswered: 0,
      correctAnswers: 0,
      pointsEarned: 0,
      categoriesPlayed: [],
    };
  } catch (error) {
    console.error('Error getting daily progress:', error);
    return null;
  }
};

// Update daily progress
export const updateDailyProgress = async progress => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.DAILY_PROGRESS,
      JSON.stringify(progress),
    );
    return true;
  } catch (error) {
    console.error('Error updating daily progress:', error);
    return false;
  }
};

// Track asked questions to prevent duplicates
export const getAskedQuestions = async () => {
  try {
    const questions = await AsyncStorage.getItem(STORAGE_KEYS.ASKED_QUESTIONS);
    return questions ? JSON.parse(questions) : [];
  } catch (error) {
    console.error('Error getting asked questions:', error);
    return [];
  }
};

export const addAskedQuestion = async questionId => {
  try {
    const askedQuestions = await getAskedQuestions();
    const updatedQuestions = [...askedQuestions, questionId];

    // Keep only last 100 questions to prevent storage overflow
    if (updatedQuestions.length > 100) {
      updatedQuestions.splice(0, updatedQuestions.length - 100);
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.ASKED_QUESTIONS,
      JSON.stringify(updatedQuestions),
    );
    return true;
  } catch (error) {
    console.error('Error adding asked question:', error);
    return false;
  }
};

// Clear daily progress (useful for testing or admin functions)
export const clearDailyProgress = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_PROGRESS);
    return true;
  } catch (error) {
    console.error('Error clearing daily progress:', error);
    return false;
  }
};

// Calculate level from experience
export const calculateLevel = experience => {
  return Math.floor(experience / 100) + 1;
};

// Calculate experience needed for next level
export const getExperienceForNextLevel = currentExp => {
  const currentLevel = calculateLevel(currentExp);
  const nextLevelExp = currentLevel * 100;
  return nextLevelExp - currentExp;
};

// Check if user unlocked new category
export const checkCategoryUnlock = stats => {
  const { level, categoriesUnlocked } = stats;
  const allCategories = QUESTION_CATEGORIES.map(cat => cat.key);

  // Unlock new categories based on level
  const categoriesToUnlock = allCategories.filter(category => {
    if (categoriesUnlocked.includes(category)) return false;

    // Define unlock requirements
    const unlockRequirements = {
      'vietnam-history': 2,
      'vietnam-geography': 3,
      'vietnamese-culture': 4,
      'vietnamese-literature': 5,
      'vietnam-food': 6,
      science: 7,
      geography: 8,
      history: 9,
      sports: 10,
    };

    return level >= (unlockRequirements[category] || 1);
  });

  return categoriesToUnlock;
};

// Get random motivational message
export const getMotivationalMessage = (score, total) => {
  const percentage = (score / total) * 100;

  if (percentage === 100) {
    return 'Xuất sắc! Bạn đã trả lời đúng tất cả! 🎉';
  } else if (percentage >= 80) {
    return 'Tuyệt vời! Bạn rất giỏi! 👏';
  } else if (percentage >= 60) {
    return 'Khá tốt! Hãy tiếp tục cố gắng! 💪';
  } else if (percentage >= 40) {
    return 'Không tệ! Bạn đang tiến bộ! 📈';
  } else {
    return 'Đừng nản lòng! Hãy thử lại lần nữa! 🌟';
  }
};

export default {
  fetchQuestions,
  getUserStats,
  updateUserStats,
  getDailyProgress,
  updateDailyProgress,
  getAskedQuestions,
  addAskedQuestion,
  clearDailyProgress,
  calculateLevel,
  getExperienceForNextLevel,
  checkCategoryUnlock,
  getMotivationalMessage,
  QUESTION_CATEGORIES,
};
