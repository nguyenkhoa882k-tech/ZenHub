import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import Svg, { Circle } from 'react-native-svg';

// Services
import pomodoroService, {
  TIMER_STATES,
  SESSION_TYPES,
} from '../services/pomodoroService';
import soundService from '../services/soundService';
import notificationService from '../services/notificationService';
import quotesService from '../services/quotesService';
import { safeVibrate } from '../utils/vibration';

const { width, height } = Dimensions.get('window');
const TIMER_SIZE = width * 0.7;
const CIRCLE_RADIUS = (TIMER_SIZE - 40) / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const PomodoroScreen = () => {
  const navigation = useNavigation();

  // State
  const [state, setState] = useState(pomodoroService.getState());
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(state.settings);
  const [quote, setQuote] = useState(quotesService.getMotivationalQuote());
  const [tip, setTip] = useState('');

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Update progress animation
  const updateProgressAnimation = useCallback(progress => {
    // No animation ref needed, just direct value update for SVG
  }, []);

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      await pomodoroService.initialize();
      await notificationService.initialize();
      setState(pomodoroService.getState());

      // Set initial content
      const currentState = pomodoroService.getState();
      const content = quotesService.getContentForSession(
        currentState.session.currentSession,
      );
      if (content.type === 'quote') {
        setQuote(content.content);
      } else {
        setTip(content.content);
      }
    };

    initialize();

    // Add state listener
    const unsubscribe = pomodoroService.addListener(newState => {
      setState(newState);

      // Update content based on session
      const content = quotesService.getContentForSession(
        newState.session.currentSession,
      );
      if (content.type === 'quote') {
        setQuote(content.content);
        setTip('');
      } else {
        setTip(content.content);
      }
    });

    // Entrance animation
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      unsubscribe();
      pomodoroService.cleanup();
    };
  }, [fadeAnim, slideAnim, updateProgressAnimation]);

  // Button press animation
  const animateButtonPress = useCallback(
    callback => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      safeVibrate(30);
      callback();
    },
    [scaleAnim],
  );

  // Pulse animation for running timer
  useEffect(() => {
    if (state.session.timerState === TIMER_STATES.RUNNING) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [state.session.timerState, pulseAnim]);

  // Timer controls
  const handleStart = useCallback(() => {
    pomodoroService.startTimer();
    soundService.playStartSound();
    safeVibrate(50);
  }, []);

  const handlePause = useCallback(() => {
    pomodoroService.pauseTimer();
    soundService.playPauseSound();
    safeVibrate(30);
  }, []);

  const handleResume = useCallback(() => {
    pomodoroService.resumeTimer();
    soundService.playResumeSound();
    safeVibrate(50);
  }, []);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Đặt lại Timer',
      'Bạn có chắc chắn muốn đặt lại phiên hiện tại không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đặt lại',
          style: 'destructive',
          onPress: () => {
            pomodoroService.resetTimer();
            safeVibrate(100);
          },
        },
      ],
    );
  }, []);

  const handleSkip = useCallback(() => {
    pomodoroService.skipSession();
    safeVibrate(50);
  }, []);

  // Settings
  const handleSaveSettings = useCallback(() => {
    pomodoroService.updateSettings(tempSettings);
    setShowSettings(false);
    safeVibrate(30);
  }, [tempSettings]);

  const adjustTime = useCallback((field, increment) => {
    setTempSettings(prev => ({
      ...prev,
      [field]: Math.max(1, Math.min(120, prev[field] + increment)),
    }));
  }, []);

  // Get colors based on session type
  const getSessionColors = useCallback(() => {
    switch (state.session.currentSession) {
      case SESSION_TYPES.FOCUS:
        return {
          primary: '#FF6B6B',
          secondary: '#FF8E8E',
          light: '#FFF5F5',
          gradient: ['#FF6B6B', '#FF8E8E'],
          accent: '#FF4757',
        };
      case SESSION_TYPES.SHORT_BREAK:
        return {
          primary: '#4ECDC4',
          secondary: '#7BDAD5',
          light: '#F0FDFC',
          gradient: ['#4ECDC4', '#7BDAD5'],
          accent: '#00D2D3',
        };
      case SESSION_TYPES.LONG_BREAK:
        return {
          primary: '#FFE66D',
          secondary: '#FFED8A',
          light: '#FFFEF5',
          gradient: ['#FFE66D', '#FFED8A'],
          accent: '#FFC048',
        };
      default:
        return {
          primary: '#FF6B6B',
          secondary: '#FF8E8E',
          light: '#FFF5F5',
          gradient: ['#FF6B6B', '#FF8E8E'],
          accent: '#FF4757',
        };
    }
  }, [state.session.currentSession]);

  const colors = getSessionColors();
  const strokeDasharray = CIRCLE_CIRCUMFERENCE;
  const strokeDashoffset =
    CIRCLE_CIRCUMFERENCE - (state.progress / 100) * CIRCLE_CIRCUMFERENCE;

  const slideTransform = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 0],
        }),
      },
    ],
  };

  const scaleTransform = {
    transform: [{ scale: scaleAnim }],
  };

  const pulseTransform = {
    transform: [{ scale: pulseAnim }],
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.light }}>
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="dark-content" backgroundColor={colors.light} />

        {/* Header */}
        <Animated.View
          className="flex-row items-center justify-between px-5 py-4"
          style={[{ opacity: fadeAnim }, slideTransform]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-11 h-11 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View className="items-center">
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.primary }}
            >
              🍅 Pomodoro
            </Text>
            <Text className="text-xs text-gray-600 mt-1">
              Quản lý thời gian hiệu quả
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            className="w-11 h-11 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Icon name="settings-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Session Label với Icon đẹp */}
          <Animated.View
            className="items-center mt-5"
            style={{ opacity: fadeAnim }}
          >
            <View className="flex-row items-center mb-3">
              <Text className="text-4xl mr-3">
                {state.session.currentSession === SESSION_TYPES.FOCUS
                  ? '🍅'
                  : state.session.currentSession === SESSION_TYPES.SHORT_BREAK
                  ? '☕'
                  : '🛋️'}
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: colors.primary }}
              >
                {pomodoroService.getSessionLabel()}
              </Text>
            </View>

            <View
              className="px-6 py-2 rounded-full flex-row items-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Icon
                name="time-outline"
                size={16}
                color="white"
                style={{ marginRight: 6 }}
              />
              <Text className="text-white text-sm font-semibold">
                Phiên {state.session.completedSessions + 1}
              </Text>
            </View>
          </Animated.View>

          {/* Timer Circle */}
          <Animated.View className="items-center mt-10" style={pulseTransform}>
            <View
              className="bg-white items-center justify-center"
              style={{
                width: TIMER_SIZE,
                height: TIMER_SIZE,
                borderRadius: TIMER_SIZE / 2,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              {/* Progress Circle */}
              <Svg
                width={TIMER_SIZE}
                height={TIMER_SIZE}
                style={{ position: 'absolute' }}
              >
                {/* Background Circle */}
                <Circle
                  cx={TIMER_SIZE / 2}
                  cy={TIMER_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  stroke="#f0f0f0"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <Circle
                  cx={TIMER_SIZE / 2}
                  cy={TIMER_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  stroke={colors.primary}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${TIMER_SIZE / 2} ${TIMER_SIZE / 2})`}
                />
              </Svg>

              {/* Timer Display */}
              <Text
                className="text-5xl font-bold"
                style={{
                  color: colors.primary,
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                }}
              >
                {pomodoroService.formatTime(state.session.timeRemaining)}
              </Text>
            </View>
          </Animated.View>

          {/* Control Buttons */}
          <Animated.View
            className="flex-row justify-center items-center mt-10 px-10"
            style={scaleTransform}
          >
            {state.session.timerState === TIMER_STATES.IDLE && (
              <TouchableOpacity
                onPress={() => animateButtonPress(handleStart)}
                className="px-10 py-4 rounded-3xl"
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text className="text-white text-lg font-bold">Bắt đầu</Text>
              </TouchableOpacity>
            )}

            {state.session.timerState === TIMER_STATES.RUNNING && (
              <View className="flex-row" style={{ gap: 16 }}>
                <TouchableOpacity
                  onPress={() => animateButtonPress(handlePause)}
                  className="px-6 py-4 rounded-3xl"
                  style={{
                    backgroundColor: '#ff7675',
                    shadowColor: '#ff7675',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-base font-bold">
                    Tạm dừng
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => animateButtonPress(handleReset)}
                  className="px-6 py-4 rounded-3xl"
                  style={{
                    backgroundColor: '#636e72',
                    shadowColor: '#636e72',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-base font-bold">
                    Đặt lại
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {state.session.timerState === TIMER_STATES.PAUSED && (
              <View className="flex-row" style={{ gap: 16 }}>
                <TouchableOpacity
                  onPress={() => animateButtonPress(handleResume)}
                  className="px-6 py-4 rounded-3xl"
                  style={{
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-base font-bold">
                    Tiếp tục
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => animateButtonPress(handleReset)}
                  className="px-6 py-4 rounded-3xl"
                  style={{
                    backgroundColor: '#636e72',
                    shadowColor: '#636e72',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-base font-bold">
                    Đặt lại
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {state.session.timerState === TIMER_STATES.COMPLETED && (
              <View className="flex-row" style={{ gap: 16 }}>
                <TouchableOpacity
                  onPress={() => animateButtonPress(handleStart)}
                  className="px-6 py-4 rounded-3xl"
                  style={{
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-base font-bold">
                    Bắt đầu tiếp
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => animateButtonPress(handleSkip)}
                  className="px-6 py-4 rounded-3xl"
                  style={{
                    backgroundColor: '#fdcb6e',
                    shadowColor: '#fdcb6e',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-base font-bold">Bỏ qua</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* Progress Tracker */}
          <Animated.View className="mt-10 px-10" style={{ opacity: fadeAnim }}>
            <Text
              className="text-base font-bold text-center mb-4"
              style={{ color: colors.primary }}
            >
              Tiến độ hôm nay
            </Text>

            <View
              className="bg-white rounded-2xl p-5"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {state.dailyStats.completedPomodoros}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Pomodoro</Text>
                </View>

                <View className="items-center">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {state.dailyStats.totalFocusTime}p
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Tập trung</Text>
                </View>

                <View className="items-center">
                  <Text
                    className="text-2xl font-bold"
                    style={{ color: colors.primary }}
                  >
                    {state.dailyStats.totalBreakTime}p
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">Nghỉ ngơi</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Motivational Content */}
          <Animated.View
            className="mt-7 mb-10 px-10"
            style={{ opacity: fadeAnim }}
          >
            {quote && quote.text && (
              <View
                className="bg-white rounded-2xl p-5"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Icon
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color={colors.primary}
                  style={{ marginBottom: 12 }}
                />
                <Text className="text-base italic text-gray-800 leading-6 mb-3">
                  "{quote.text}"
                </Text>
                <Text
                  className="text-sm font-bold text-right"
                  style={{ color: colors.primary }}
                >
                  — {quote.author}
                </Text>
              </View>
            )}

            {tip && (
              <View
                className="bg-white rounded-2xl p-5 mt-4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-base text-gray-800 leading-6 text-center">
                  {tip}
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSettings(false)}
        >
          <View className="flex-1 justify-end bg-black bg-opacity-50">
            <View
              className="bg-white rounded-t-3xl p-6"
              style={{ maxHeight: height * 0.8 }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-800">Cài đặt</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <Icon name="close" size={24} color="#636e72" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Focus Time */}
                <View className="mb-6">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    Thời gian tập trung
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      onPress={() => adjustTime('focusTime', -5)}
                      className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center"
                    >
                      <Icon name="remove" size={20} color="#636e72" />
                    </TouchableOpacity>

                    <Text
                      className="text-lg font-bold"
                      style={{ color: colors.primary }}
                    >
                      {tempSettings.focusTime} phút
                    </Text>

                    <TouchableOpacity
                      onPress={() => adjustTime('focusTime', 5)}
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Icon name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Short Break */}
                <View className="mb-6">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    Nghỉ ngắn
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      onPress={() => adjustTime('shortBreak', -1)}
                      className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center"
                    >
                      <Icon name="remove" size={20} color="#636e72" />
                    </TouchableOpacity>

                    <Text
                      className="text-lg font-bold"
                      style={{ color: colors.primary }}
                    >
                      {tempSettings.shortBreak} phút
                    </Text>

                    <TouchableOpacity
                      onPress={() => adjustTime('shortBreak', 1)}
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Icon name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Long Break */}
                <View className="mb-8">
                  <Text className="text-base font-bold text-gray-800 mb-3">
                    Nghỉ dài
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      onPress={() => adjustTime('longBreak', -5)}
                      className="w-10 h-10 rounded-full bg-gray-300 items-center justify-center"
                    >
                      <Icon name="remove" size={20} color="#636e72" />
                    </TouchableOpacity>

                    <Text
                      className="text-lg font-bold"
                      style={{ color: colors.primary }}
                    >
                      {tempSettings.longBreak} phút
                    </Text>

                    <TouchableOpacity
                      onPress={() => adjustTime('longBreak', 5)}
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Icon name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSaveSettings}
                  className="py-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white text-base font-bold">
                    Lưu cài đặt
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default PomodoroScreen;
