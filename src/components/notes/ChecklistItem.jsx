import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';

const { width } = Dimensions.get('window');

const ChecklistItem = ({
  item,
  index,
  isEditing = false,
  onToggle,
  onEdit,
  onDelete,
  onAddNew,
  isLast = false,
  style,
}) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(item.text || '');
  const [isPressed, setIsPressed] = useState(false);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(item.completed ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const textInputRef = useRef(null);

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Update check animation when completed state changes
    Animated.spring(checkAnim, {
      toValue: item.completed ? 1 : 0,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [item.completed, index]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleToggle = () => {
    if (onToggle) {
      onToggle(item.id);
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      setIsEditingText(true);
      setEditText(item.text || '');
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  };

  const handleSaveEdit = () => {
    if (onEdit && editText.trim()) {
      onEdit(item.id, editText.trim());
    }
    setIsEditingText(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    }
  };

  const renderCheckbox = () => (
    <TouchableOpacity
      style={[
        styles.checkbox,
        item.completed && styles.checkboxCompleted,
        isPressed && styles.checkboxPressed,
      ]}
      onPress={handleToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.checkmark,
          {
            transform: [
              {
                scale: checkAnim,
              },
            ],
            opacity: checkAnim,
          },
        ]}
      >
        <Icon name="checkmark" size={16} color="#FFFFFF" />
      </Animated.View>
    </TouchableOpacity>
  );

  const renderText = () => {
    if (isEditingText) {
      return (
        <TextInput
          ref={textInputRef}
          style={[styles.textInput, item.completed && styles.textCompleted]}
          value={editText}
          onChangeText={setEditText}
          onSubmitEditing={handleSaveEdit}
          onBlur={handleSaveEdit}
          placeholder="Nhập nội dung..."
          placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
          multiline
          autoFocus
        />
      );
    }

    return (
      <TouchableOpacity
        style={styles.textContainer}
        onPress={handleEdit}
        disabled={!isEditing}
      >
        <Text
          style={[
            styles.text,
            item.completed && styles.textCompleted,
            !isEditing && styles.textReadonly,
          ]}
          numberOfLines={3}
        >
          {item.text || 'Mục trống'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderActions = () => {
    if (!isEditing) return null;

    return (
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Icon
            name="create-outline"
            size={16}
            color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
          <Icon
            name="trash-outline"
            size={16}
            color={NOTES_CONFIG.COLORS.ERROR}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAddButton = () => {
    if (!isLast || !isEditing) return null;

    return (
      <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
        <Icon
          name="add-circle-outline"
          size={20}
          color={NOTES_CONFIG.COLORS.PRIMARY}
        />
        <Text style={styles.addButtonText}>Thêm mục mới</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          transform: [
            { scale: scaleAnim },
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-width, 0],
              }),
            },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {renderCheckbox()}
        <View style={styles.textWrapper}>
          {renderText()}
          {renderActions()}
        </View>
      </View>
      {renderAddButton()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.BORDER,
    shadowColor: NOTES_CONFIG.COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: NOTES_CONFIG.COLORS.SUCCESS,
    borderColor: NOTES_CONFIG.COLORS.SUCCESS,
  },
  checkboxPressed: {
    transform: [{ scale: 0.95 }],
  },
  checkmark: {
    position: 'absolute',
  },
  textWrapper: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    lineHeight: 22,
    marginBottom: 8,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
  },
  textReadonly: {
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
  },
  textInput: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    lineHeight: 22,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.BORDER,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.PRIMARY,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ChecklistItem;
