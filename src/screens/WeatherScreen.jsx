import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState } from '../components/UI';

const WeatherScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <View className="flex-1 justify-center">
        <EmptyState
          icon="partly-sunny-outline"
          title="Weather Coming Soon"
          description="Weather information will be available here. This module will show current conditions, forecasts, and location-based weather data."
          action={<Button title="Coming Soon" disabled variant="outline" />}
        />
      </View>
    </SafeAreaView>
  );
};

export default WeatherScreen;
