import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const QuestionCard = ({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
  showResult,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const getDifficultyColor = difficulty => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getDifficultyIcon = difficulty => {
    switch (difficulty) {
      case 'easy':
        return 'star-outline';
      case 'medium':
        return 'star-half-outline';
      case 'hard':
        return 'star';
      default:
        return 'help-outline';
    }
  };

  const getAnswerStyle = answer => {
    if (!showResult) {
      return selectedAnswer === answer ? styles.selectedAnswer : styles.answer;
    }

    if (answer === question.correctAnswer) {
      return styles.correctAnswer;
    }

    if (selectedAnswer === answer && answer !== question.correctAnswer) {
      return styles.wrongAnswer;
    }

    return styles.answer;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{question.category}</Text>
        </View>

        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(question.difficulty) },
          ]}
        >
          <Icon
            name={getDifficultyIcon(question.difficulty)}
            size={12}
            color="#FFFFFF"
          />
          <Text style={styles.difficultyText}>
            {question.difficulty.toUpperCase()}
          </Text>
          <Text style={styles.pointsText}>+{question.points}</Text>
        </View>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
      </View>

      {/* Answers */}
      <View style={styles.answersContainer}>
        {question.allAnswers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            style={getAnswerStyle(answer)}
            onPress={() => !isAnswered && onAnswer(answer)}
            disabled={isAnswered}
            activeOpacity={0.7}
          >
            <View style={styles.answerContent}>
              <View style={styles.answerLetter}>
                <Text style={styles.answerLetterText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={styles.answerText}>{answer}</Text>

              {showResult && answer === question.correctAnswer && (
                <Icon name="checkmark-circle" size={20} color="#4CAF50" />
              )}

              {showResult &&
                selectedAnswer === answer &&
                answer !== question.correctAnswer && (
                  <Icon name="close-circle" size={20} color="#F44336" />
                )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result */}
      {showResult && (
        <View style={styles.resultContainer}>
          <Text
            style={[
              styles.resultText,
              selectedAnswer === question.correctAnswer
                ? styles.correctResultText
                : styles.wrongResultText,
            ]}
          >
            {selectedAnswer === question.correctAnswer
              ? '🎉 Correct!'
              : '❌ Wrong Answer'}
          </Text>
          {selectedAnswer !== question.correctAnswer && (
            <Text style={styles.correctAnswerText}>
              Correct answer: {question.correctAnswer}
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryContainer: {
    flex: 1,
  },
  category: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
  },
  answersContainer: {
    gap: 12,
  },
  answer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAnswer: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  correctAnswer: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  wrongAnswer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  answerLetterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  answerText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  resultContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  correctResultText: {
    color: '#4CAF50',
  },
  wrongResultText: {
    color: '#F44336',
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default QuestionCard;
