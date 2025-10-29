import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {
  fetchQuestions,
  getUserStats,
  updateUserStats,
  clearDailyProgress,
  addAskedQuestion,
  QUESTION_CATEGORIES,
} from '../services/questionService';
import QuestionCard from '../components/quiz/QuestionCard';
import StatsCard from '../components/quiz/StatsCard';
import CategorySelector from '../components/quiz/CategorySelector';
import QuizResult from '../components/quiz/QuizResult';

const QUIZ_STATES = {
  MENU: 'menu',
  CATEGORY_SELECT: 'category_select',
  PLAYING: 'playing',
  RESULT: 'result',
  LOADING: 'loading',
};

const QuotesScreen = () => {
  const [currentState, setCurrentState] = useState(QUIZ_STATES.MENU);
  const [userStats, setUserStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    wrong: 0,
    totalPoints: 0,
  });

  useEffect(() => {
    initializeQuiz();
  }, []);

  const refreshUserStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const initializeQuiz = async () => {
    try {
      const stats = await getUserStats();
      const cats = QUESTION_CATEGORIES;

      setUserStats(stats);
      setCategories(cats);
    } catch (error) {
      console.error('Error initializing quiz:', error);
      Alert.alert('Lỗi', 'Không thể khởi tạo quiz. Vui lòng thử lại.');
    }
  };

  const startQuiz = async () => {
    try {
      setCurrentState(QUIZ_STATES.LOADING);

      const categoryKey = selectedCategory?.key;
      const quizQuestions = await fetchQuestions(categoryKey, null, 10);

      if (quizQuestions.length === 0) {
        Alert.alert(
          'Không có câu hỏi',
          'Chọn danh mục khác hoặc làm mới tiến trình hôm nay?',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Làm mới tiến trình', onPress: resetDailyProgress },
            {
              text: 'Chọn danh mục khác',
              onPress: () => setCurrentState(QUIZ_STATES.CATEGORY_SELECT),
            },
          ],
        );
        setCurrentState(QUIZ_STATES.CATEGORY_SELECT);
        return;
      }

      setQuestions(quizQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setSessionStats({ correct: 0, wrong: 0, totalPoints: 0 });
      setCurrentState(QUIZ_STATES.PLAYING);
    } catch (error) {
      console.error('Error starting quiz:', error);
      Alert.alert('Lỗi', 'Không thể tải câu hỏi. Vui lòng thử lại.');
      setCurrentState(QUIZ_STATES.CATEGORY_SELECT);
    }
  };

  const resetDailyProgress = async () => {
    try {
      Alert.alert(
        'Xác nhận làm mới',
        'Bạn có chắc muốn làm mới tiến trình hôm nay? Điều này sẽ xóa tất cả câu hỏi đã làm.',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xác nhận',
            style: 'destructive',
            onPress: async () => {
              try {
                await clearDailyProgress();
                Alert.alert('Thành công', 'Đã làm mới tiến trình hôm nay!');
                // Refresh user stats
                await refreshUserStats();
                // Back to category selection
                setCurrentState(QUIZ_STATES.CATEGORY_SELECT);
              } catch (error) {
                console.error('Error clearing progress:', error);
                Alert.alert(
                  'Lỗi',
                  'Không thể làm mới tiến trình. Vui lòng thử lại.',
                );
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Error resetting progress:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi không mong muốn.');
    }
  };

  const handleAnswer = async answer => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    const points = isCorrect ? currentQuestion.points : 0;

    // Update session stats
    setSessionStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      totalPoints: prev.totalPoints + points,
    }));

    // Update user stats
    const stats = await getUserStats();
    const updatedStats = {
      ...stats,
      totalQuestions: stats.totalQuestions + 1,
      correctAnswers: stats.correctAnswers + (isCorrect ? 1 : 0),
      totalPoints: stats.totalPoints + points,
      experience: stats.experience + points,
    };

    await updateUserStats(updatedStats);
    setUserStats(updatedStats);

    // Mark question as answered
    await addAskedQuestion(currentQuestion.id);

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // Quiz completed
        setCurrentState(QUIZ_STATES.RESULT);
      }
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCurrentState(QUIZ_STATES.RESULT);
    }
  };

  const playAgain = () => {
    setCurrentState(QUIZ_STATES.CATEGORY_SELECT);
  };

  const backToMenu = () => {
    setCurrentState(QUIZ_STATES.MENU);
  };

  const renderMenu = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quiz Hàng Ngày 🧠</Text>
        <Text style={styles.subtitle}>
          Thử thách kiến thức của bạn mỗi ngày!
        </Text>
      </View>

      {userStats && (
        <StatsCard
          stats={userStats}
          onPress={() => {
            /* TODO: Show detailed stats */
          }}
        />
      )}

      <View style={styles.menuActions}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => setCurrentState(QUIZ_STATES.CATEGORY_SELECT)}
        >
          <Icon name="play" size={24} color="#FFFFFF" />
          <Text style={styles.playButtonText}>Bắt Đầu Quiz</Text>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={resetDailyProgress}
          >
            <Icon name="refresh" size={20} color="#666" />
            <Text style={styles.actionButtonText}>Làm Mới Tiến Trình</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={refreshUserStats}
          >
            <Icon name="sync" size={20} color="#666" />
            <Text style={styles.actionButtonText}>Cập Nhật Thống Kê</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderCategorySelect = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={backToMenu}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Chọn Danh Mục</Text>
      </View>

      <CategorySelector
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <View style={styles.startContainer}>
        <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
          <Text style={styles.startButtonText}>Bắt Đầu Quiz</Text>
          <Icon name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderQuiz = () => (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.quizHeader}>
        <TouchableOpacity onPress={backToMenu}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                },
              ]}
            />
          </View>
        </View>

        <Text style={styles.scoreText}>{sessionStats.totalPoints}</Text>
      </View>

      {/* Current Question */}
      {questions[currentQuestionIndex] && (
        <QuestionCard
          question={questions[currentQuestionIndex]}
          onAnswer={handleAnswer}
          isAnswered={!!selectedAnswer}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
        />
      )}

      {/* Next Button (if answered) */}
      {showResult && currentQuestionIndex < questions.length - 1 && (
        <View style={styles.nextContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
            <Text style={styles.nextButtonText}>Câu Tiếp Theo</Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderResult = () => (
    <QuizResult
      score={sessionStats.correct}
      totalQuestions={questions.length}
      correctAnswers={sessionStats.correct}
      totalPoints={sessionStats.totalPoints}
      onPlayAgain={playAgain}
      onBackToMenu={backToMenu}
    />
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Đang tải câu hỏi...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />

      {currentState === QUIZ_STATES.MENU && renderMenu()}
      {currentState === QUIZ_STATES.CATEGORY_SELECT && renderCategorySelect()}
      {currentState === QUIZ_STATES.PLAYING && renderQuiz()}
      {currentState === QUIZ_STATES.RESULT && renderResult()}
      {currentState === QUIZ_STATES.LOADING && renderLoading()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    marginTop: 12,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  menuActions: {
    padding: 20,
  },
  playButton: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  startContainer: {
    padding: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  nextContainer: {
    padding: 20,
  },
  nextButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default QuotesScreen;
