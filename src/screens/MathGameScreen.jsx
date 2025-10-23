import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState } from '../components/UI';

const MathGameScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <View className="flex-1 justify-center">
        <EmptyState
          icon="calculator-outline"
          title="Math Game Coming Soon"
          description="Challenge your brain with fun math problems! Progressive difficulty levels and scoring system will be available here."
          action={<Button title="Coming Soon" disabled variant="outline" />}
        />
      </View>
    </SafeAreaView>
  );
};

export default MathGameScreen;
