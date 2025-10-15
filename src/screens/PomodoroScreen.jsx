import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { Card, CardContent, Button } from '../components/UI';
import { formatTime } from '../utils/helpers';
import { DEFAULT_POMODORO_SETTINGS } from '../config/constants';
import adsService from '../services/adsService';

const PomodoroScreen = () => {
  const [timeLeft, setTimeLeft] = useState(
    DEFAULT_POMODORO_SETTINGS.workDuration,
  );
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [sessionCount, setSessionCount] = useState(0);

  const handleTimerComplete = useCallback(async () => {
    setIsActive(false);

    // Show notification/alert
    Alert.alert('Timer Complete!', `${mode} session finished.`);

    // Switch modes and reset timer
    if (mode === 'work') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);

      // Show interstitial ad every few sessions
      if (newSessionCount % 4 === 0) {
        await adsService.showInterstitial();
      }

      // Determine break type
      if (newSessionCount % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(DEFAULT_POMODORO_SETTINGS.longBreakDuration);
      } else {
        setMode('shortBreak');
        setTimeLeft(DEFAULT_POMODORO_SETTINGS.shortBreakDuration);
      }
    } else {
      setMode('work');
      setTimeLeft(DEFAULT_POMODORO_SETTINGS.workDuration);
    }
  }, [mode, sessionCount]);

  useEffect(() => {
    let interval = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft, handleTimerComplete]);

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const stopTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setMode('work');
    setTimeLeft(DEFAULT_POMODORO_SETTINGS.workDuration);
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work':
        return 'text-primary-500';
      case 'shortBreak':
        return 'text-secondary-500';
      case 'longBreak':
        return 'text-green-500';
      default:
        return 'text-primary-500';
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'work':
        return 'Work Time';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Work Time';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <View className="flex-1 justify-center px-6">
        {/* Timer Display */}
        <Card className="mb-8">
          <CardContent className="items-center py-12">
            <Text className={`text-lg font-semibold mb-4 ${getModeColor()}`}>
              {getModeTitle()}
            </Text>

            <Text className="text-6xl font-bold text-warm-900 mb-6">
              {formatTime(timeLeft)}
            </Text>

            <Text className="text-warm-600 text-base">
              Session {sessionCount + 1}
            </Text>
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <View className="flex-row justify-center mb-8">
          {!isActive || isPaused ? (
            <Button
              title={isPaused ? 'Resume' : 'Start'}
              onPress={startTimer}
              icon={isPaused ? 'play' : 'play'}
              size="large"
              className="mx-2"
            />
          ) : (
            <Button
              title="Pause"
              onPress={pauseTimer}
              icon="pause"
              variant="secondary"
              size="large"
              className="mx-2"
            />
          )}

          <Button
            title="Stop"
            onPress={stopTimer}
            icon="stop"
            variant="outline"
            size="large"
            className="mx-2"
          />
        </View>

        {/* Settings Info */}
        <Card>
          <CardContent>
            <Text className="text-warm-800 font-semibold mb-4 text-center">
              Timer Settings
            </Text>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-warm-600">Work Duration:</Text>
              <Text className="text-warm-900 font-semibold">
                {formatTime(DEFAULT_POMODORO_SETTINGS.workDuration)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-warm-600">Short Break:</Text>
              <Text className="text-warm-900 font-semibold">
                {formatTime(DEFAULT_POMODORO_SETTINGS.shortBreakDuration)}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-warm-600">Long Break:</Text>
              <Text className="text-warm-900 font-semibold">
                {formatTime(DEFAULT_POMODORO_SETTINGS.longBreakDuration)}
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* Banner Ad */}
      <View className="bg-white">
        {adsService.createBannerAd('self-center')}
      </View>
    </SafeAreaView>
  );
};

export default PomodoroScreen;
