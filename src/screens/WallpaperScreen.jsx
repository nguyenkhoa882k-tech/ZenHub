import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState } from '../components/UI';

const WallpaperScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <View className="flex-1 justify-center">
        <EmptyState
          icon="image-outline"
          title="Wallpapers Coming Soon"
          description="Beautiful wallpapers will be available here. Browse, search, and download high-quality images for your device."
          action={<Button title="Coming Soon" disabled variant="outline" />}
        />
      </View>
    </SafeAreaView>
  );
};

export default WallpaperScreen;
