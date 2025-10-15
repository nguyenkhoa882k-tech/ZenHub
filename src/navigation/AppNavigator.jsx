import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MODULES } from '../config/constants';

// Import screens (will be created next)
import HomeScreen from '../screens/HomeScreen';
import NotesScreen from '../screens/NotesScreen';
import NoteDetailScreen from '../screens/NoteDetailScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import QuotesScreen from '../screens/QuotesScreen';
import WeatherScreen from '../screens/WeatherScreen';
import WallpaperScreen from '../screens/WallpaperScreen';
import NewsScreen from '../screens/NewsScreen';
import DictionaryScreen from '../screens/DictionaryScreen';
import MathGameScreen from '../screens/MathGameScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={MODULES.HOME}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#d18843',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerTitleAlign: 'center',
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen
          name={MODULES.HOME}
          component={HomeScreen}
          options={{
            title: 'ZenHub',
            headerShown: true,
          }}
        />

        <Stack.Screen
          name={MODULES.NOTES}
          component={NotesScreen}
          options={{ title: 'Notes & To-Do' }}
        />

        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
          options={{ title: 'Note' }}
        />

        <Stack.Screen
          name={MODULES.POMODORO}
          component={PomodoroScreen}
          options={{ title: 'Pomodoro Timer' }}
        />

        <Stack.Screen
          name={MODULES.QUOTES}
          component={QuotesScreen}
          options={{ title: 'Daily Quotes' }}
        />

        <Stack.Screen
          name={MODULES.WEATHER}
          component={WeatherScreen}
          options={{ title: 'Weather' }}
        />

        <Stack.Screen
          name={MODULES.WALLPAPER}
          component={WallpaperScreen}
          options={{ title: 'Wallpapers' }}
        />

        <Stack.Screen
          name={MODULES.NEWS}
          component={NewsScreen}
          options={{ title: 'News' }}
        />

        <Stack.Screen
          name={MODULES.DICTIONARY}
          component={DictionaryScreen}
          options={{ title: 'Dictionary' }}
        />

        <Stack.Screen
          name={MODULES.MATH_GAME}
          component={MathGameScreen}
          options={{ title: 'Math Game' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
