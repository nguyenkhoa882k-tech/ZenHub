import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';

const ChecklistPreview = ({ content, onToggleItem }) => {
  const [items, setItems] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    parseChecklistItems();
  }, [content]);

  const parseChecklistItems = () => {
    if (!content) {
      setItems([]);
      setCompletedCount(0);
      return;
    }

    const lines = content.split('\n');
    const parsedItems = [];
    let completed = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isCompleted = trimmed.startsWith('- [x]');
      const isChecklist = trimmed.startsWith('- [ ]') || isCompleted;

      if (isChecklist) {
        const text = trimmed.replace(/^- \[[ x]\]\s*/, '');
        parsedItems.push({
          id: index,
          text: text || 'Mục trống',
          completed: isCompleted,
        });
        if (isCompleted) completed++;
      } else {
        // Convert regular line to checklist item
        parsedItems.push({
          id: index,
          text: trimmed,
          completed: false,
        });
      }
    });

    setItems(parsedItems);
    setCompletedCount(completed);
  };

  const handleToggleItem = itemId => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );
    setItems(updatedItems);
    setCompletedCount(updatedItems.filter(item => item.completed).length);

    // Call parent callback if provided
    if (onToggleItem) {
      onToggleItem(itemId);
    }
  };

  const renderItem = (item, index) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.item, item.completed && styles.itemCompleted]}
      onPress={() => handleToggleItem(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <View
          style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
        >
          {item.completed && (
            <Icon name="checkmark" size={12} color="#FFFFFF" />
          )}
        </View>
        <Text
          style={[styles.itemText, item.completed && styles.itemTextCompleted]}
          numberOfLines={2}
        >
          {item.text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="checkbox-outline"
          size={32}
          color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
        />
        <Text style={styles.emptyText}>Nhập danh sách việc cần làm...</Text>
        <Text style={styles.emptySubtext}>
          Mỗi dòng sẽ thành một mục trong danh sách
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    items.length > 0 ? (completedCount / items.length) * 100 : 0
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{items.length} hoàn thành
          </Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {items.slice(0, 5).map((item, index) => renderItem(item, index))}
        {items.length > 5 && (
          <View style={styles.moreItems}>
            <Text style={styles.moreItemsText}>
              +{items.length - 5} mục khác...
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.BORDER,
  },
  header: {
    marginBottom: 12,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: NOTES_CONFIG.COLORS.BORDER,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NOTES_CONFIG.COLORS.SUCCESS,
    borderRadius: 3,
  },
  progressText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  itemsContainer: {
    gap: 8,
  },
  item: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.BORDER,
  },
  itemCompleted: {
    backgroundColor: NOTES_CONFIG.COLORS.SUCCESS + '10',
    borderColor: NOTES_CONFIG.COLORS.SUCCESS + '30',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: NOTES_CONFIG.COLORS.SUCCESS,
    borderColor: NOTES_CONFIG.COLORS.SUCCESS,
  },
  itemText: {
    flex: 1,
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    lineHeight: 18,
  },
  itemTextCompleted: {
    textDecorationLine: 'line-through',
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
  },
  moreItems: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  moreItemsText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default ChecklistPreview;
