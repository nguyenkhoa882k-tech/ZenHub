import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

const CategorySelector = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn Danh Mục</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryCard,
            !selectedCategory && styles.selectedCard,
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Text style={styles.categoryEmoji}>🎯</Text>
          <Text
            style={[
              styles.categoryName,
              !selectedCategory && styles.selectedText,
            ]}
          >
            Trộn Lẫn
          </Text>
        </TouchableOpacity>

        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryCard,
              selectedCategory?.key === category.key && styles.selectedCard,
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <Text
              style={[
                styles.categoryName,
                selectedCategory?.key === category.key && styles.selectedText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedText: {
    color: '#2196F3',
  },
});

export default CategorySelector;
