import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const StatsCard = ({ stats, onPress }) => {
  const getAccuracy = () => {
    if (stats.totalQuestions === 0) return 0;
    return Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
  };

  const getExperienceToNextLevel = () => {
    const currentLevelExp = (stats.level - 1) * 500;
    const nextLevelExp = stats.level * 500;
    const progress = stats.experience - currentLevelExp;
    const needed = nextLevelExp - currentLevelExp;
    return { progress, needed, percentage: (progress / needed) * 100 };
  };

  const exp = getExperienceToNextLevel();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Icon name="trophy" size={20} color="#FFD700" />
          <Text style={styles.levelText}>Level {stats.level}</Text>
        </View>
        <Text style={styles.scoreText}>{stats.totalScore} pts</Text>
      </View>

      {/* Experience Bar */}
      <View style={styles.expContainer}>
        <Text style={styles.expLabel}>
          {exp.progress}/{exp.needed} XP to next level
        </Text>
        <View style={styles.expBar}>
          <View style={[styles.expFill, { width: `${exp.percentage}%` }]} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Icon name="help-circle" size={16} color="#2196F3" />
          <Text style={styles.statValue}>{stats.totalQuestions}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>

        <View style={styles.statItem}>
          <Icon name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.statValue}>{getAccuracy()}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>

        <View style={styles.statItem}>
          <Icon name="flame" size={16} color="#FF5722" />
          <Text style={styles.statValue}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>

        <View style={styles.statItem}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.statValue}>{stats.bestStreak}</Text>
          <Text style={styles.statLabel}>Best</Text>
        </View>
      </View>

      {/* Daily Progress */}
      <View style={styles.dailyContainer}>
        <View style={styles.dailyHeader}>
          <Icon name="calendar" size={16} color="#9C27B0" />
          <Text style={styles.dailyTitle}>Daily Goal</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (stats.dailyProgress / stats.dailyGoal) * 100,
                    100,
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {stats.dailyProgress}/{stats.dailyGoal}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
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
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  expContainer: {
    marginBottom: 16,
  },
  expLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  expBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  expFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dailyContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9C27B0',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C27B0',
    minWidth: 40,
  },
});

export default StatsCard;
