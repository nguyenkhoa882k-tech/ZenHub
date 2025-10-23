import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState } from '../components/UI';

const NewsScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <View className="flex-1 justify-center">
        <EmptyState
          icon="newspaper-outline"
          title="News Coming Soon"
          description="Latest news articles will be available here. Stay updated with news from various categories and sources."
          action={<Button title="Coming Soon" disabled variant="outline" />}
        />
      </View>
    </SafeAreaView>
  );
};

export default NewsScreen;
