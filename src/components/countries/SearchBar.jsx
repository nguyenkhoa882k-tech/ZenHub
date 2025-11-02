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
    outputRange: ['#E5E7EB', '#6366F1'],
  });

  const iconColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#9CA3AF', '#6366F1'],
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
            color={isFocused ? '#6366F1' : '#9CA3AF'}
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
    marginBottom: 0, // Remove bottom margin since it's in a wrapper now
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    marginRight: 14,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 14,
    paddingHorizontal: 0,
    fontWeight: '400',
  },
  clearButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
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
