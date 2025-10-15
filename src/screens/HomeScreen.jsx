import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import { MODULES } from '../config/constants';
import adsService from '../services/adsService';

const HomeScreen = () => {
  const navigation = useNavigation();

  const modules = [
    {
      id: MODULES.NOTES,
      title: 'Notes & To-Do',
      icon: 'document-text-outline',
      description: 'Organize your thoughts',
      color: 'bg-primary-500',
    },
    {
      id: MODULES.POMODORO,
      title: 'Pomodoro Timer',
      icon: 'timer-outline',
      description: 'Focus & productivity',
      color: 'bg-secondary-500',
    },
    {
      id: MODULES.QUOTES,
      title: 'Daily Quotes',
      icon: 'chatbubble-outline',
      description: 'Inspiration & wisdom',
      color: 'bg-primary-400',
    },
    {
      id: MODULES.WEATHER,
      title: 'Weather',
      icon: 'partly-sunny-outline',
      description: 'Current conditions',
      color: 'bg-secondary-400',
    },
    {
      id: MODULES.WALLPAPER,
      title: 'Wallpapers',
      icon: 'image-outline',
      description: 'Beautiful backgrounds',
      color: 'bg-primary-600',
    },
    {
      id: MODULES.NEWS,
      title: 'News',
      icon: 'newspaper-outline',
      description: 'Stay updated',
      color: 'bg-secondary-600',
    },
    {
      id: MODULES.DICTIONARY,
      title: 'Dictionary',
      icon: 'book-outline',
      description: 'Word definitions',
      color: 'bg-primary-300',
    },
    {
      id: MODULES.MATH_GAME,
      title: 'Math Game',
      icon: 'calculator-outline',
      description: 'Brain training',
      color: 'bg-secondary-300',
    },
  ];

  const handleModulePress = async moduleId => {
    // Show interstitial ad with cooldown
    if (moduleId !== MODULES.HOME) {
      await adsService.showInterstitial();
    }
    navigation.navigate(moduleId);
  };

  const renderModuleCard = module => (
    <TouchableOpacity
      key={module.id}
      className="w-[48%] mb-4"
      onPress={() => handleModulePress(module.id)}
      activeOpacity={0.8}
    >
      <View className={`${module.color} rounded-card p-6 shadow-lg`}>
        <View className="items-center">
          <View className="bg-white/20 rounded-full p-3 mb-3">
            <Icon name={module.icon} size={32} color="#ffffff" />
          </View>
          <Text className="text-white font-semibold text-lg text-center mb-1">
            {module.title}
          </Text>
          <Text className="text-white/80 text-sm text-center">
            {module.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fafaf9" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-20"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-warm-900 mb-2">
            Welcome to ZenHub
          </Text>
          <Text className="text-warm-600 text-lg">
            Your all-in-one productivity & fun companion
          </Text>
        </View>

        {/* Modules Grid */}
        <View className="px-6">
          <View className="flex-row flex-wrap justify-between">
            {modules.map(renderModuleCard)}
          </View>
        </View>

        {/* App Info */}
        <View className="px-6 mt-8">
          <View className="bg-white rounded-card p-6 shadow-sm">
            <Text className="text-warm-800 font-semibold text-lg mb-3">
              🧭 About ZenHub
            </Text>
            <Text className="text-warm-600 text-base leading-6">
              ZenHub combines essential productivity tools with fun activities.
              Take notes, stay focused with the Pomodoro timer, get inspired by
              quotes, check the weather, and challenge yourself with our math
              game!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Banner Ad */}
      <View className="absolute bottom-0 left-0 right-0 bg-white">
        {adsService.createBannerAd('self-center')}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
