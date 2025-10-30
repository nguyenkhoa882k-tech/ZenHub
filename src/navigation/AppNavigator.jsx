import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MODULES } from '../config/constants';

// Import screens (will be created next)
import HomeScreen from '../screens/HomeScreen';
import NotesScreen from '../screens/NotesScreen';
import NoteDetailScreen from '../screens/notes/NoteDetail';
import QuotesScreen from '../screens/QuotesScreen';
import NewsScreen from '../screens/NewsScreen';
import DictionaryScreen from '../screens/DictionaryScreen';
import MathGameScreen from '../screens/MathGameScreen';
import CountriesScreen from '../screens/CountriesScreen';
import CountryDetailScreen from '../screens/CountryDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={MODULES.HOME}
        screenOptions={{
          headerShown: false,
          cardStyle: {
            backgroundColor: '#EDE9FE',
          },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                backgroundColor: '#EDE9FE',
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
        <Stack.Screen name={MODULES.HOME} component={HomeScreen} />

        <Stack.Screen name={MODULES.NOTES} component={NotesScreen} />

        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />

        <Stack.Screen name={MODULES.QUOTES} component={QuotesScreen} />

        <Stack.Screen name={MODULES.NEWS} component={NewsScreen} />

        <Stack.Screen name={MODULES.DICTIONARY} component={DictionaryScreen} />

        <Stack.Screen name={MODULES.MATH_GAME} component={MathGameScreen} />

        <Stack.Screen name={MODULES.COUNTRIES} component={CountriesScreen} />

        <Stack.Screen name="CountryDetail" component={CountryDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
