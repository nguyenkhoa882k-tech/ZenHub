import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  Share,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import notesService from '../../services/notes/notesService';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';
import { safeVibrate } from '../../utils/vibration';
import ChecklistItem from '../../components/notes/ChecklistItem';

const { height } = Dimensions.get('window');

const NoteDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId, mode = 'view' } = route.params || {};

  // State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [noteType, setNoteType] = useState('text'); // 'text' | 'checklist'
  const [checklistItems, setChecklistItems] = useState([]);

  // Refs
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const tagInputRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const originalDataRef = useRef({ title: '', content: '', tags: [] });
  const scrollViewRef = useRef(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const editorAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  const toolbarAnim = useRef(new Animated.Value(0)).current;
  const tagInputAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  // Initialize
  const loadData = useCallback(async () => {
    try {
      if (noteId && mode !== 'create') {
        await loadNote();
      } else {
        animateIn();
        setTimeout(() => titleInputRef.current?.focus(), 300);
      }
      await loadAvailableTags();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId, mode]);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    loadData();
    return () => StatusBar.setBarStyle('default');
  }, [loadData]);

  const loadNote = async () => {
    try {
      if (__DEV__) {
        console.log('🔍 Loading note with ID:', noteId);
      }

      const noteData = await notesService.getNoteById(noteId);
      if (noteData) {
        setTitle(noteData.title || '');
        setContent(noteData.content || '');

        // Detect note type from metadata or content pattern
        let detectedNoteType = 'text';
        if (noteData.metadata && noteData.metadata.noteType) {
          detectedNoteType = noteData.metadata.noteType;
        } else if (noteData.content) {
          // Detect checklist pattern: lines starting with - [ ] or - [x]
          const hasChecklistPattern = /^\s*- \[[ x]\]/m.test(noteData.content);
          if (hasChecklistPattern) {
            detectedNoteType = 'checklist';
          }
        }
        setNoteType(detectedNoteType);

        // Parse checklist items if it's a checklist
        if (detectedNoteType === 'checklist') {
          parseChecklistItems(noteData.content || '');
        }

        // Convert tags from object array to string array
        const parsedTags = Array.isArray(noteData.tags)
          ? noteData.tags.map(tag =>
              typeof tag === 'string' ? tag : tag?.name || tag,
            )
          : [];
        setTags(parsedTags);

        originalDataRef.current = {
          title: noteData.title || '',
          content: noteData.content || '',
          tags: parsedTags,
        };

        animateIn();
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy ghi chú');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Lỗi', 'Không thể tải ghi chú');
      navigation.goBack();
    }
  };

  const loadAvailableTags = async () => {
    try {
      await notesService.getAllTags();
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  // Checklist management functions
  const parseChecklistItems = contentText => {
    if (!contentText) {
      setChecklistItems([]);
      return;
    }

    const lines = contentText.split('\n');
    const items = [];
    let itemId = 0;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isCompleted = trimmed.startsWith('- [x]');
      const isChecklist = trimmed.startsWith('- [ ]') || isCompleted;

      if (isChecklist) {
        const text = trimmed.replace(/^- \[[ x]\]\s*/, '');
        items.push({
          id: itemId++,
          text: text || 'Mục trống',
          completed: isCompleted,
        });
      } else {
        // Convert regular line to checklist item
        items.push({
          id: itemId++,
          text: trimmed,
          completed: false,
        });
      }
    });

    setChecklistItems(items);
  };

  const updateChecklistContent = () => {
    const checklistContent = checklistItems
      .map(item => `- [${item.completed ? 'x' : ' '}] ${item.text}`)
      .join('\n');
    setContent(checklistContent);
  };

  const handleToggleChecklistItem = itemId => {
    const updatedItems = checklistItems.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );
    setChecklistItems(updatedItems);
    updateChecklistContent();
  };

  const handleEditChecklistItem = (itemId, newText) => {
    const updatedItems = checklistItems.map(item =>
      item.id === itemId ? { ...item, text: newText } : item,
    );
    setChecklistItems(updatedItems);
    updateChecklistContent();
  };

  const handleDeleteChecklistItem = itemId => {
    const updatedItems = checklistItems.filter(item => item.id !== itemId);
    setChecklistItems(updatedItems);
    updateChecklistContent();
  };

  const handleAddChecklistItem = () => {
    const newItem = {
      id: Math.max(...checklistItems.map(item => item.id), -1) + 1,
      text: 'Mục mới',
      completed: false,
    };
    const updatedItems = [...checklistItems, newItem];
    setChecklistItems(updatedItems);
    updateChecklistContent();
  };

  // Animations
  const animateIn = () => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(editorAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateToolbar = show => {
    Animated.spring(toolbarAnim, {
      toValue: show ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const animateTagInput = show => {
    Animated.spring(tagInputAnim, {
      toValue: show ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const animateStats = show => {
    Animated.spring(statsAnim, {
      toValue: show ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // Handle back button
  const handleBackWithChanges = () => {
    Alert.alert(
      'Thay đổi chưa lưu',
      'Bạn có thay đổi chưa được lưu. Bạn muốn làm gì?',
      [
        {
          text: 'Hủy bỏ',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
        { text: 'Lưu & Thoát', onPress: handleSave },
        { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
      ],
    );
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (hasChanges) {
          handleBackWithChanges();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasChanges]),
  );

  // Text handling
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharacterCount(content.length);
  }, [content]);

  useEffect(() => {
    const current = { title, content, tags };
    const original = originalDataRef.current;

    const hasChange =
      current.title !== original.title ||
      current.content !== original.content ||
      JSON.stringify(current.tags) !== JSON.stringify(original.tags);

    setHasChanges(hasChange);
  }, [title, content, tags]);

  // Autosave
  useEffect(() => {
    if (hasChanges && !saving && noteId && isEditing) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = setTimeout(() => {
        handleSave(true);
      }, 3000);
    }

    return () => clearTimeout(autosaveTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, hasChanges, saving, noteId, isEditing]);

  // Save note
  const handleSave = async (silent = false) => {
    if (!title.trim() && !content.trim()) {
      if (!silent) Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề hoặc nội dung');
      return;
    }

    setSaving(true);

    // Safe vibration - handle permission errors
    if (!silent) {
      safeVibrate(50);
    }

    try {
      const noteData = {
        title: title.trim() || 'Không có tiêu đề',
        content: content.trim(),
        tags: tags.filter(tag => typeof tag === 'string' && tag.trim()), // Ensure only valid strings
        updatedAt: new Date().toISOString(),
        // Preserve note type in metadata
        metadata: { noteType },
      };

      console.log('Saving note with data:', noteData);

      let savedNote = noteData;
      if (noteId) {
        savedNote = await notesService.updateNote(noteId, noteData);
      } else {
        noteData.createdAt = new Date().toISOString();
        savedNote = await notesService.createNote(noteData);
        navigation.setParams({ noteId: savedNote.id, mode: 'edit' });
      }

      originalDataRef.current = { title, content, tags };
      setHasChanges(false);

      if (!silent) {
        Alert.alert('Thành công', 'Ghi chú đã được lưu');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      console.error('Error details:', error.message, error.stack);
      if (!silent)
        Alert.alert('Lỗi', `Không thể lưu ghi chú: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete note
  const handleDelete = () => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa ghi chú này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesService.deleteNote(noteId);
            safeVibrate(100);
            navigation.goBack();
          } catch (error) {
            console.error('Error deleting note:', error);
            Alert.alert('Lỗi', 'Không thể xóa ghi chú');
          }
        },
      },
    ]);
  };

  // Share note
  const handleShare = async () => {
    try {
      const shareContent = `${title}\n\n${content}${
        tags.length > 0 ? `\n\nTags: ${tags.join(', ')}` : ''
      }`;
      await Share.share({
        message: shareContent,
        title: title || 'Ghi chú',
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
      animateTagInput(false);
    }
  };

  const removeTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleTagInput = () => {
    const show = !showTagInput;
    setShowTagInput(show);
    animateTagInput(show);
    if (show) {
      setTimeout(() => tagInputRef.current?.focus(), 300);
    }
  };

  // Toolbar actions
  const insertText = (before, after = '') => {
    if (contentInputRef.current) {
      const cursorPos =
        contentInputRef.current._lastNativeSelection?.start || content.length;
      const newContent =
        content.slice(0, cursorPos) +
        before +
        selectedText +
        after +
        content.slice(cursorPos + selectedText.length);
      setContent(newContent);
    }
  };

  const toggleBold = () => insertText('**', '**');
  const toggleItalic = () => insertText('*', '*');
  const insertBullet = () => insertText('\n• ');
  const insertNumbered = () => insertText('\n1. ');

  // Focus handlers
  const handleContentFocus = () => {
    animateToolbar(true);
  };

  const handleContentBlur = () => {
    setTimeout(() => {
      animateToolbar(false);
    }, 200);
  };

  const handleSelectionChange = event => {
    const { selection } = event.nativeEvent;
    if (selection.start !== selection.end) {
      const selected = content.slice(selection.start, selection.end);
      setSelectedText(selected);
    } else {
      setSelectedText('');
    }
  };

  const toggleStats = () => {
    const show = !showStats;
    setShowStats(show);
    animateStats(show);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        backgroundColor={NOTES_CONFIG.COLORS.SURFACE}
        barStyle="dark-content"
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {
              console.log('Back button pressed!');
              hasChanges ? handleBackWithChanges() : navigation.goBack();
            }}
          >
            <Icon
              name="arrow-back"
              size={24}
              color={NOTES_CONFIG.COLORS.TEXT_PRIMARY}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isEditing
                ? mode === 'create'
                  ? 'Ghi chú mới'
                  : 'Chỉnh sửa'
                : 'Xem ghi chú'}
            </Text>
            {hasChanges && <View style={styles.unsavedIndicator} />}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => {
                console.log('Stats button pressed!');
                toggleStats();
              }}
            >
              <Icon
                name="stats-chart"
                size={20}
                color={NOTES_CONFIG.COLORS.PRIMARY}
              />
            </TouchableOpacity>

            {noteId && (
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={handleShare}
              >
                <Icon
                  name="share-outline"
                  size={20}
                  color={NOTES_CONFIG.COLORS.PRIMARY}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={() => {
                console.log('Edit button pressed!');
                setIsEditing(!isEditing);
              }}
            >
              <Icon
                name={isEditing ? 'eye-outline' : 'create-outline'}
                size={20}
                color={NOTES_CONFIG.COLORS.PRIMARY}
              />
            </TouchableOpacity>

            {noteId && (
              <TouchableOpacity
                style={styles.headerActionButton}
                onPress={handleDelete}
              >
                <Icon
                  name="trash-outline"
                  size={20}
                  color={NOTES_CONFIG.COLORS.ERROR}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Stats Panel */}
      <Animated.View
        style={[
          styles.statsPanel,
          {
            transform: [
              {
                translateY: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-60, 0],
                }),
              },
            ],
            opacity: statsAnim,
          },
        ]}
      >
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{wordCount}</Text>
          <Text style={styles.statLabel}>Từ</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{characterCount}</Text>
          <Text style={styles.statLabel}>Ký tự</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{tags.length}</Text>
          <Text style={styles.statLabel}>Tags</Text>
        </View>
      </Animated.View>

      {/* Editor */}
      <Animated.View
        style={[
          styles.editor,
          {
            transform: [
              {
                translateY: editorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: editorAnim,
          },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <TextInput
            ref={titleInputRef}
            style={[styles.titleInput, !isEditing && styles.titleReadonly]}
            placeholder="Tiêu đề ghi chú..."
            placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            value={title}
            onChangeText={setTitle}
            editable={isEditing}
            multiline
            textAlignVertical="top"
          />

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => isEditing && removeTag(tag)}
                  disabled={!isEditing}
                >
                  <Text style={styles.tagText}>
                    #{typeof tag === 'string' ? tag : tag?.name || 'Unknown'}
                  </Text>
                  {isEditing && <Icon name="close" size={14} color="#fff" />}
                </TouchableOpacity>
              ))}

              {isEditing && (
                <TouchableOpacity
                  style={styles.addTagButton}
                  onPress={toggleTagInput}
                >
                  <Icon
                    name="add"
                    size={20}
                    color={NOTES_CONFIG.COLORS.PRIMARY}
                  />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Tag Input */}
          <Animated.View
            style={[
              styles.tagInputContainer,
              {
                transform: [
                  {
                    scaleY: tagInputAnim,
                  },
                ],
                opacity: tagInputAnim,
              },
            ]}
          >
            <TextInput
              ref={tagInputRef}
              style={styles.tagInput}
              placeholder="Nhập tag mới..."
              placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.tagInputAction} onPress={addTag}>
              <Icon
                name="checkmark"
                size={16}
                color={NOTES_CONFIG.COLORS.PRIMARY}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Content */}
          {noteType === 'checklist' ? (
            <View style={styles.checklistContainer}>
              {checklistItems.length === 0 ? (
                <View style={styles.emptyChecklist}>
                  <Icon
                    name="checkbox-outline"
                    size={48}
                    color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
                  />
                  <Text style={styles.emptyChecklistText}>
                    Chưa có mục nào trong danh sách
                  </Text>
                  <Text style={styles.emptyChecklistSubtext}>
                    Nhấn nút + để thêm mục mới
                  </Text>
                </View>
              ) : (
                checklistItems.map((item, index) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    index={index}
                    isEditing={isEditing}
                    isLast={index === checklistItems.length - 1}
                    onToggle={handleToggleChecklistItem}
                    onEdit={handleEditChecklistItem}
                    onDelete={handleDeleteChecklistItem}
                    onAddNew={handleAddChecklistItem}
                    style={styles.checklistItem}
                  />
                ))
              )}
            </View>
          ) : (
            <TextInput
              ref={contentInputRef}
              style={[
                styles.contentInput,
                !isEditing && styles.contentReadonly,
              ]}
              placeholder="Viết ghi chú của bạn ở đây..."
              placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
              value={content}
              onChangeText={setContent}
              editable={isEditing}
              multiline
              textAlignVertical="top"
              onFocus={handleContentFocus}
              onBlur={handleContentBlur}
              onSelectionChange={handleSelectionChange}
            />
          )}
        </ScrollView>
      </Animated.View>

      {/* Toolbar */}
      <Animated.View
        style={[
          styles.toolbar,
          {
            transform: [
              {
                translateY: toolbarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [80, 0],
                }),
              },
            ],
            opacity: toolbarAnim,
          },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.toolbarButton} onPress={toggleBold}>
            <Text style={styles.toolbarButtonText}>B</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton} onPress={toggleItalic}>
            <Text style={styles.toolbarButtonTextItalic}>I</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton} onPress={insertBullet}>
            <Icon name="list" size={18} color={NOTES_CONFIG.COLORS.PRIMARY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={insertNumbered}
          >
            <Icon
              name="list-outline"
              size={18}
              color={NOTES_CONFIG.COLORS.PRIMARY}
            />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Save FAB */}
      {isEditing && hasChanges && (
        <Animated.View
          style={[
            styles.fab,
            {
              transform: [
                {
                  scale: fabAnim,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => handleSave(false)}
            disabled={saving}
          >
            <Icon
              name={saving ? 'hourglass-outline' : 'save-outline'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  headerActionButton: {
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  unsavedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NOTES_CONFIG.COLORS.WARNING,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsPanel: {
    flexDirection: 'row',
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: NOTES_CONFIG.COLORS.BORDER,
    marginHorizontal: 20,
  },
  editor: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    marginBottom: 20,
    minHeight: 40,
    textAlignVertical: 'center',
  },
  titleReadonly: {
    backgroundColor: 'transparent',
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  addTagButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  tagInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
  },
  tagInputAction: {
    padding: 8,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    minHeight: height * 0.4,
    textAlignVertical: 'top',
  },
  contentReadonly: {
    backgroundColor: 'transparent',
  },
  toolbar: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: NOTES_CONFIG.COLORS.BORDER,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  toolbarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: NOTES_CONFIG.COLORS.PRIMARY,
  },
  toolbarButtonTextItalic: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: NOTES_CONFIG.COLORS.PRIMARY,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  checklistContainer: {
    marginBottom: 20,
  },
  checklistItem: {
    marginBottom: 12,
  },
  emptyChecklist: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.BORDER,
    borderStyle: 'dashed',
  },
  emptyChecklistText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.LG,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyChecklistSubtext: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default NoteDetail;
