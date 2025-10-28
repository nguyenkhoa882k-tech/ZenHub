import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');

const QuizResult = ({
  score,
  totalQuestions,
  correctAnswers,
  totalPoints,
  onPlayAgain,
  onBackToMenu,
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scaleAnim, slideAnim, fadeAnim]);

  const getPerformanceMessage = () => {
    const percentage = (correctAnswers / totalQuestions) * 100;

    if (percentage === 100) {
      return { message: 'Perfect! 🎉', color: '#4CAF50', icon: 'trophy' };
    } else if (percentage >= 80) {
      return { message: 'Excellent! 🌟', color: '#4CAF50', icon: 'star' };
    } else if (percentage >= 60) {
      return { message: 'Good Job! 👍', color: '#FF9800', icon: 'thumbs-up' };
    } else if (percentage >= 40) {
      return { message: 'Keep Trying! 💪', color: '#FF5722', icon: 'fitness' };
    } else {
      return { message: 'Practice More! 📚', color: '#F44336', icon: 'book' };
    }
  };

  const performance = getPerformanceMessage();
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <View style={styles.container}>
      {/* Main Result Card */}
      <Animated.View
        style={[
          styles.resultCard,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: performance.color }]}
        >
          <Icon name={performance.icon} size={48} color="#FFFFFF" />
        </View>

        <Text style={[styles.messageText, { color: performance.color }]}>
          {performance.message}
        </Text>

        <Text style={styles.scoreText}>
          {correctAnswers}/{totalQuestions}
        </Text>

        <Text style={styles.percentageText}>{percentage}% Correct</Text>

        <Text style={styles.pointsText}>+{totalPoints} Points</Text>
      </Animated.View>

      {/* Stats Details */}
      <Animated.View
        style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Icon name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="close-circle" size={24} color="#F44336" />
            <Text style={styles.statValue}>
              {totalQuestions - correctAnswers}
            </Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>

          <View style={styles.statItem}>
            <Icon name="star" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onPlayAgain}
        >
          <Icon name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onBackToMenu}
        >
          <Icon name="home" size={20} color="#2196F3" />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Back to Menu
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: width - 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  messageText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: width - 40,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  buttonsContainer: {
    width: width - 40,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
});

export default QuizResult;
