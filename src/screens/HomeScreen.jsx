import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import { MODULES } from '../config/constants';
import { showInterstitial, createBannerAd } from '../services/adsService';

const HomeScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.8)).current;
  const scaleAnims = useRef(
    [...Array(8)].map(() => new Animated.Value(0)),
  ).current;
  const rotateAnims = useRef(
    [...Array(8)].map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    // Enhanced header animation with scale and rotation
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(headerOpacity, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(headerScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Content fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
    }).start();

    // Smooth staggered card animations with rotation
    const cardAnimations = scaleAnims.map((anim, index) => {
      const rotateAnim = rotateAnims[index];

      return Animated.parallel([
        Animated.spring(anim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          delay: index * 150 + 600,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          delay: index * 150 + 600,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(cardAnimations).start();
  }, [
    fadeAnim,
    slideAnim,
    scaleAnims,
    rotateAnims,
    headerOpacity,
    headerScale,
  ]);

  const modules = [
    {
      id: MODULES.NOTES,
      title: 'Ghi Chú & Công Việc',
      icon: 'document-text-outline',
      description: 'Sắp xếp ý tưởng của bạn',
      bgColor: '#667eea',
      iconGradient: ['#667eea', '#764ba2'],
    },
    {
      id: MODULES.QUOTES,
      title: 'Câu Nói Hay Hàng Ngày',
      icon: 'chatbubble-outline',
      description: 'Cảm hứng & trí tuệ',
      bgColor: '#4facfe',
      iconGradient: ['#4facfe', '#00f2fe'],
    },
    {
      id: MODULES.WALLPAPER,
      title: 'Hình Nền',
      icon: 'image-outline',
      description: 'Nền đẹp mắt',
      bgColor: '#fa709a',
      iconGradient: ['#fa709a', '#fee140'],
    },
    {
      id: MODULES.NEWS,
      title: 'Tin Tức',
      icon: 'newspaper-outline',
      description: 'Cập nhật thông tin',
      bgColor: '#a8edea',
      iconGradient: ['#a8edea', '#fed6e3'],
    },
    {
      id: MODULES.DICTIONARY,
      title: 'Từ Điển',
      icon: 'book-outline',
      description: 'Tra cứu từ vựng',
      bgColor: '#ff9a9e',
      iconGradient: ['#ff9a9e', '#fecfef'],
    },
    {
      id: MODULES.MATH_GAME,
      title: 'Trò Chơi Toán',
      icon: 'calculator-outline',
      description: 'Rèn luyện trí não',
      bgColor: '#a18cd1',
      iconGradient: ['#a18cd1', '#fbc2eb'],
    },
  ];

  const handleModulePress = async (moduleId, index) => {
    // Enhanced button press animation with spring effect
    const pressAnim = scaleAnims[index];
    const rotateAnim = rotateAnims[index];

    Animated.parallel([
      Animated.spring(pressAnim, {
        toValue: 0.9,
        tension: 300,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.parallel([
        Animated.spring(pressAnim, {
          toValue: 1,
          tension: 300,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Show interstitial ad with cooldown
    if (moduleId !== MODULES.HOME) {
      await showInterstitial();
    }
    navigation.navigate(moduleId);
  };

  const renderModuleCard = (module, index) => {
    const rotateInterpolate = rotateAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: ['10deg', '0deg'],
    });

    return (
      <Animated.View
        key={module.id}
        style={[
          styles.cardContainer,
          {
            opacity: scaleAnims[index],
            transform: [
              { scale: scaleAnims[index] },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleModulePress(module.id, index)}
          activeOpacity={0.7}
          style={styles.touchableCard}
        >
          <View style={styles.modernCard}>
            {/* Icon Container */}
            <Animated.View
              style={[
                styles.iconContainer,
                { backgroundColor: module.bgColor },
                {
                  transform: [
                    {
                      scale: scaleAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Icon name={module.icon} size={28} color="#ffffff" />
            </Animated.View>

            {/* Card Content */}
            <Animated.View
              className="flex-1 mx-4"
              style={{
                opacity: scaleAnims[index],
                transform: [
                  {
                    translateX: scaleAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              }}
            >
              <Text
                className="text-gray-900 font-bold text-lg mb-1"
                numberOfLines={1}
              >
                {module.title}
              </Text>
              <Text className="text-gray-500 text-sm" numberOfLines={1}>
                {module.description}
              </Text>
            </Animated.View>

            {/* Arrow Icon */}
            <Animated.View
              style={[
                styles.arrowContainer,
                {
                  opacity: scaleAnims[index],
                  transform: [
                    {
                      translateX: scaleAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                    {
                      rotate: scaleAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['45deg', '0deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.gradientContainer}>
      <SafeAreaView className="flex-1" style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />

        <ScrollView
          className="flex-1 "
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Magical Header */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                opacity: headerOpacity,
                transform: [
                  { scale: headerScale },
                  {
                    translateY: headerOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.headerGlow}>
              <Text style={styles.headerTitle}>
                ✨ Không Gian Thông Minh ✨
              </Text>
              <Text style={styles.headerSubtitle}>
                Nơi phép màu gặp gỡ năng suất
              </Text>

              {/* Floating particles effect */}
              <View style={styles.particlesContainer}>
                <Animated.View
                  style={[
                    styles.particle,
                    styles.particle1,
                    {
                      opacity: headerOpacity,
                      transform: [
                        {
                          translateY: headerOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -10],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.particle,
                    styles.particle2,
                    {
                      opacity: headerOpacity,
                      transform: [
                        {
                          translateY: headerOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -15],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.particle,
                    styles.particle3,
                    {
                      opacity: headerOpacity,
                      transform: [
                        {
                          translateY: headerOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -8],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View className="px-4 mb-6" style={{ opacity: fadeAnim }}>
            <View style={styles.modulesContainer}>
              {modules.map((module, index) => renderModuleCard(module, index))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Banner Ad Container - Simple and Clear */}
        <View style={styles.adContainer}>{createBannerAd('self-center')}</View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    backgroundColor: '#EDE9FE',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  headerGlow: {
    position: 'relative',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#DDD6FE',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(102, 126, 234, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fbbf24',
  },
  particle1: {
    top: 10,
    left: 20,
    backgroundColor: '#f59e0b',
  },
  particle2: {
    top: 15,
    right: 30,
    backgroundColor: '#8b5cf6',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  particle3: {
    bottom: 20,
    left: '50%',
    backgroundColor: '#ec4899',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  modulesContainer: {
    marginLeft: 12,
    marginRight: 12,
    flexDirection: 'column',
    gap: 16,
  },
  cardContainer: {
    width: '100%',
    marginBottom: 0,
  },
  touchableCard: {
    borderRadius: 20,
  },
  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 80,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  adContainer: {
    backgroundColor: '#FF4444',
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 4,
    borderTopColor: '#CC0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
});

export default HomeScreen;
