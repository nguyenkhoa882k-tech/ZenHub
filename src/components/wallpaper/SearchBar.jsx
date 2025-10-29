import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const SearchBar = ({
  value,
  onChangeText,
  onSearch,
  placeholder = 'Tìm kiếm hình nền...',
}) => {
  const handleSubmit = () => {
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#666666"
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          returnKeyType="search"
        />

        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChangeText('')}
          >
            <Icon name="close-circle" size={20} color="#999999" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
});

export default SearchBar;
