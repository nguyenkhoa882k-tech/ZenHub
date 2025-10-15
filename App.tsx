/**
 * ZenHub - Notes, Focus & Fun
 * Main App Component
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fafaf9" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
