import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const SearchBar = ({
  value = '',
  onChangeText,
  onFocus,
  onBlur,
  onClear,
  placeholder = 'Search countries...',
  style,
  showFilterButton = false,
  onFilterPress,
  filterActive = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur && onBlur();
  };

  const handleClear = () => {
    onClear && onClear();
    onChangeText('');
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#4F46E5'],
  });

  const iconColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9CA3AF', '#4F46E5'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            borderColor: borderColor,
          },
        ]}
      >
        <Animated.View style={[styles.iconContainer, { color: iconColor }]}>
          <Icon
            name="search-outline"
            size={20}
            color={isFocused ? '#4F46E5' : '#9CA3AF'}
          />
        </Animated.View>

        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {value && value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {showFilterButton && (
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterActive && styles.filterButtonActive,
            ]}
            onPress={onFilterPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="options-outline"
              size={20}
              color={filterActive ? '#FFFFFF' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  filterButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
});

export default SearchBar;
