import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { Button, EmptyState } from '../components/UI';

const QuotesScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <View className="flex-1 justify-center">
        <EmptyState
          icon="chatbubble-outline"
          title="Quotes Coming Soon"
          description="Daily inspirational quotes will be available here. This module will fetch quotes from the Quotable API with offline caching support."
          action={<Button title="Coming Soon" disabled variant="outline" />}
        />
      </View>
    </SafeAreaView>
  );
};

export default QuotesScreen;
