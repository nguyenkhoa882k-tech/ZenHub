/**
 * ZenHub - Notes, Focus & Fun
 * Main App Component
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import notesService from './src/services/notes/notesService';

function App() {
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await notesService.initialize();
        console.log('✅ App services initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize app services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fafaf9" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
