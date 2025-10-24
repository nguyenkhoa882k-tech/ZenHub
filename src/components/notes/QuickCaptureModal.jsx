import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import notesService from '../../services/notes/notesService';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';

const QuickCaptureModal = ({
  visible,
  onClose,
  onComplete,
  initialData = {},
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [selectedTags, setSelectedTags] = useState(initialData.tags || []);
  const [availableTags, setAvailableTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [captureMode, setCaptureMode] = useState('text'); // 'text' | 'voice' | 'checklist'
  const [saving, setSaving] = useState(false);

  console.log('QuickCaptureModal initialData:', initialData);
  console.log('Initial selectedTags:', selectedTags);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      animateIn();
      console.log('123');

      loadTags();

      // Auto focus title input
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 300);
    } else {
      animateOut();
      resetForm();
    }
  }, [visible]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: NOTES_CONFIG.ANIMATIONS.MODAL_SLIDE_UP,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: NOTES_CONFIG.ANIMATIONS.MODAL_SLIDE_UP,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadTags = async () => {
    try {
      console.log('Loading tags...');
      console.log('notesService initialized?', notesService.initialized);

      // Ensure service is initialized
      if (!notesService.initialized) {
        console.log('Initializing notesService...');
        await notesService.initialize();
      }

      const tags = await notesService.getAllTags();
      console.log('Loaded tags:', tags);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setNewTag('');
    setCaptureMode('text');
    setSaving(false);
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề hoặc nội dung cho ghi chú.');
      return;
    }

    try {
      setSaving(true);

      const noteData = {
        title: title.trim() || 'Ghi Chú Nhanh',
        content: content.trim(),
        tags: selectedTags,
      };

      // Add template-specific data based on capture mode
      if (captureMode === 'checklist') {
        noteData.content = convertToChecklist(noteData.content);
      }

      await notesService.createNote(noteData);

      // Play save sound if enabled
      // TODO: Implement sound service

      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Lỗi', 'Không thể lưu ghi chú. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const convertToChecklist = text => {
    if (!text) return '';

    const lines = text.split('\n');
    return lines
      .filter(line => line.trim())
      .map(line =>
        line.startsWith('- [ ]') || line.startsWith('- [x]')
          ? line
          : `- [ ] ${line.trim()}`,
      )
      .join('\n');
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    const tagName = newTag.trim().toLowerCase();
    if (selectedTags.includes(tagName)) {
      setNewTag('');
      return;
    }

    setSelectedTags(prev => [...prev, tagName]);
    setNewTag('');
  };

  const handleRemoveTag = tagToRemove => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagPress = tag => {
    if (selectedTags.includes(tag.name)) {
      handleRemoveTag(tag.name);
    } else {
      setSelectedTags(prev => [...prev, tag.name]);
    }
  };

  const renderCaptureMode = () => {
    const modes = [
      { key: 'text', label: 'Văn Bản', icon: 'document-text-outline' },
      { key: 'checklist', label: 'Danh Sách', icon: 'checkbox-outline' },
      { key: 'voice', label: 'Ghi Âm', icon: 'mic-outline' },
    ];

    return (
      <View style={styles.captureModeContainer}>
        {modes.map(mode => (
          <TouchableOpacity
            key={mode.key}
            style={[
              styles.captureModeButton,
              captureMode === mode.key && styles.captureModeButtonActive,
            ]}
            onPress={() => setCaptureMode(mode.key)}
          >
            <Icon
              name={mode.icon}
              size={20}
              color={
                captureMode === mode.key
                  ? '#FFFFFF'
                  : NOTES_CONFIG.COLORS.PRIMARY
              }
            />
            <Text
              style={[
                styles.captureModeText,
                captureMode === mode.key && styles.captureModeTextActive,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTagInput = () => (
    <View style={styles.tagSection}>
      <Text style={styles.sectionTitle}>Tags</Text>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <View style={styles.selectedTagsContainer}>
          {selectedTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              style={styles.selectedTag}
              onPress={() => handleRemoveTag(tag)}
            >
              <Text style={styles.selectedTagText}>{tag}</Text>
              <Icon name="close" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tag input */}
      <View style={styles.tagInputContainer}>
        <TextInput
          style={styles.tagInput}
          placeholder="Thêm tag..."
          value={newTag}
          onChangeText={setNewTag}
          onSubmitEditing={handleAddTag}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={handleAddTag}
          disabled={!newTag.trim()}
        >
          <Icon
            name="add"
            size={20}
            color={
              newTag.trim()
                ? NOTES_CONFIG.COLORS.PRIMARY
                : NOTES_CONFIG.COLORS.TEXT_SECONDARY
            }
          />
        </TouchableOpacity>
      </View>

      {/* Available tags */}
      {availableTags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.availableTagsScroll}
        >
          <View style={styles.availableTagsContainer}>
            {availableTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.availableTag,
                  { backgroundColor: tag.color + '20' },
                  selectedTags.includes(tag.name) &&
                    styles.availableTagSelected,
                ]}
                onPress={() => handleTagPress(tag)}
              >
                <Text
                  style={[
                    styles.availableTagText,
                    { color: tag.color },
                    selectedTags.includes(tag.name) &&
                      styles.availableTagTextSelected,
                  ]}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );

  const renderVoiceCapture = () => (
    <View style={styles.voiceCaptureContainer}>
      <TouchableOpacity style={styles.voiceButton}>
        <Icon name="mic" size={32} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.voiceInstructions}>Nhấn và giữ để ghi âm</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose}>
                <Icon
                  name="close"
                  size={24}
                  color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
                />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Ghi Chú Nhanh</Text>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Capture mode selector */}
            {renderCaptureMode()}

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {captureMode === 'voice' ? (
                renderVoiceCapture()
              ) : (
                <>
                  {/* Title input */}
                  <View style={styles.inputSection}>
                    <TextInput
                      ref={titleInputRef}
                      style={styles.titleInput}
                      placeholder="Tiêu đề ghi chú..."
                      placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
                      value={title}
                      onChangeText={setTitle}
                      maxLength={100}
                      returnKeyType="next"
                      onSubmitEditing={() => contentInputRef.current?.focus()}
                    />
                  </View>

                  {/* Content input */}
                  <View style={styles.inputSection}>
                    <TextInput
                      ref={contentInputRef}
                      style={[
                        styles.contentInput,
                        captureMode === 'checklist' && styles.checklistInput,
                      ]}
                      placeholder={
                        captureMode === 'checklist'
                          ? 'Nhập danh sách việc cần làm...\nMỗi dòng sẽ thành một mục'
                          : 'Nội dung ghi chú...'
                      }
                      placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
                      value={content}
                      onChangeText={setContent}
                      multiline
                      textAlignVertical="top"
                      maxLength={1000}
                    />
                  </View>

                  {/* Tag section */}
                  {renderTagInput()}
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  modal: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderTopLeftRadius: NOTES_CONFIG.UI.MODAL_BORDER_RADIUS,
    borderTopRightRadius: NOTES_CONFIG.UI.MODAL_BORDER_RADIUS,
    maxHeight: '95%',
    minHeight: '70%',
    flex: 0,
  },
  keyboardAvoid: {
    flex: 1,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER,
  },
  headerTitle: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.LG,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
  },
  saveButton: {
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    fontWeight: '600',
  },
  captureModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER,
  },
  captureModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
  },
  captureModeButtonActive: {
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
  },
  captureModeText: {
    marginLeft: 6,
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.PRIMARY,
    fontWeight: '500',
  },
  captureModeTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  inputSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER + '30',
  },
  titleInput: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.LG,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  contentInput: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 120,
    maxHeight: 200,
    lineHeight: 22,
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
  },
  checklistInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tagSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: NOTES_CONFIG.COLORS.BORDER,
  },
  sectionTitle: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    marginBottom: 12,
  },
  debugText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 8,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    fontWeight: '500',
    marginRight: 6,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    paddingVertical: 12,
  },
  addTagButton: {
    padding: 4,
  },
  availableTagsScroll: {
    marginTop: 8,
  },
  availableTagsContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  availableTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  availableTagSelected: {
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
  },
  availableTagText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    fontWeight: '500',
  },
  availableTagTextSelected: {
    fontWeight: '600',
  },
  voiceCaptureContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: NOTES_CONFIG.COLORS.ERROR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  voiceInstructions: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default QuickCaptureModal;
