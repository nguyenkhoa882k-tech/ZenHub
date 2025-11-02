/**
 * ZenHub - Notes, Focus & Fun
 * Main App Component
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import polyfills first to handle deprecation warnings
import './src/utils/polyfills';

import AppNavigator from './src/navigation/AppNavigator';
import notesService from './src/services/notes/notesService';
import { initializeAds } from './src/services/adsService';

function App() {
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await notesService.initialize();
        await initializeAds();
        console.log('✅ App services initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize app services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
