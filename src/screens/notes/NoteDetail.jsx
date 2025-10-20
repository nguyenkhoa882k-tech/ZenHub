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
} from 'react-native';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import { notesService } from '../../services/notes/notesService';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';

const NoteDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId, mode = 'view' } = route.params || {};

  // State
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  // Refs
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const originalDataRef = useRef({ title: '', content: '', tags: [] });

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const editorAnim = useRef(new Animated.Value(0)).current;

  // Load note data
  useEffect(() => {
    if (noteId && mode !== 'create') {
      loadNote();
    } else {
      // New note mode
      animateIn();
      setTimeout(() => titleInputRef.current?.focus(), 300);
    }
  }, [noteId, mode]);

  // Handle back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (hasChanges) {
          handleBackWithChanges();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [hasChanges]),
  );

  // Autosave effect
  useEffect(() => {
    if (hasChanges && !saving && noteId) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = setTimeout(() => {
        handleSave(true); // Silent autosave
      }, NOTES_CONFIG.AUTOSAVE_DELAY);
    }

    return () => {
      clearTimeout(autosaveTimeoutRef.current);
    };
  }, [title, content, tags, hasChanges, saving, noteId]);

  // Word/character count effect
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const characters = content.length;
    setWordCount(words);
    setCharacterCount(characters);
  }, [content]);

  const loadNote = async () => {
    try {
      const noteData = await notesService.getNoteById(noteId);
      if (noteData) {
        setNote(noteData);
        setTitle(noteData.title || '');
        setContent(noteData.content || '');
        setTags(noteData.tags ? noteData.tags.map(tag => tag.name) : []);

        // Store original data for comparison
        originalDataRef.current = {
          title: noteData.title || '',
          content: noteData.content || '',
          tags: noteData.tags ? noteData.tags.map(tag => tag.name) : [],
        };

        animateIn();
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy ghi chú.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Lỗi', 'Không thể tải ghi chú.');
      navigation.goBack();
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(editorAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkForChanges = useCallback(() => {
    const current = { title, content, tags };
    const original = originalDataRef.current;

    const titleChanged = current.title !== original.title;
    const contentChanged = current.content !== original.content;
    const tagsChanged =
      JSON.stringify(current.tags.sort()) !==
      JSON.stringify(original.tags.sort());

    setHasChanges(titleChanged || contentChanged || tagsChanged);
  }, [title, content, tags]);

  useEffect(() => {
    checkForChanges();
  }, [checkForChanges]);

  const handleSave = async (isAutosave = false) => {
    if (!title.trim() && !content.trim()) {
      if (!isAutosave) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề hoặc nội dung.');
      }
      return false;
    }

    try {
      setSaving(true);

      const noteData = {
        title: title.trim() || 'Ghi Chú Không Tiêu Đề',
        content: content.trim(),
        tags,
      };

      let savedNote;
      if (noteId && mode !== 'create') {
        // Update existing note
        savedNote = await notesService.updateNote(noteId, noteData);
      } else {
        // Create new note
        savedNote = await notesService.createNote(noteData);
        // Update navigation params with new note ID
        navigation.setParams({ noteId: savedNote.id, mode: 'edit' });
      }

      if (savedNote) {
        setNote(savedNote);
        originalDataRef.current = { title, content, tags: [...tags] };
        setHasChanges(false);

        if (!isAutosave) {
          // Show success feedback
          // TODO: Add success animation/sound
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      if (!isAutosave) {
        Alert.alert('Lỗi', 'Không thể lưu ghi chú. Vui lòng thử lại.');
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBackWithChanges = () => {
    Alert.alert(
      'Có Thay Đổi Chưa Lưu',
      'Bạn có muốn lưu thay đổi trước khi thoát?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Không Lưu',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'Lưu',
          onPress: async () => {
            const saved = await handleSave();
            if (saved) {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    if (!noteId) return;

    Alert.alert('Xóa Ghi Chú', 'Bạn có chắc muốn xóa ghi chú này?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await notesService.deleteNote(noteId);
            navigation.goBack();
          } catch (error) {
            console.error('Error deleting note:', error);
            Alert.alert('Lỗi', 'Không thể xóa ghi chú.');
          }
        },
      },
    ]);
  };

  const toggleEditing = () => {
    if (isEditing) {
      // Stop editing - save if there are changes
      if (hasChanges) {
        handleSave();
      }
    } else {
      // Start editing
      setTimeout(() => {
        if (title) {
          contentInputRef.current?.focus();
        } else {
          titleInputRef.current?.focus();
        }
      }, 100);
    }
    setIsEditing(!isEditing);
  };

  const formatMarkdown = text => {
    // Simple markdown preview (basic implementation)
    return text
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br/>');
  };

  const insertMarkdown = syntax => {
    // TODO: Implement markdown insertion at cursor position
    const cursorPos = contentInputRef.current?.selectionStart || content.length;
    const beforeCursor = content.substring(0, cursorPos);
    const afterCursor = content.substring(cursorPos);

    let newContent = '';
    switch (syntax) {
      case 'bold':
        newContent = beforeCursor + '**text**' + afterCursor;
        break;
      case 'italic':
        newContent = beforeCursor + '*text*' + afterCursor;
        break;
      case 'heading':
        newContent = beforeCursor + '\n# Heading\n' + afterCursor;
        break;
      case 'list':
        newContent = beforeCursor + '\n- Item 1\n- Item 2\n' + afterCursor;
        break;
      case 'checklist':
        newContent =
          beforeCursor + '\n- [ ] Task 1\n- [ ] Task 2\n' + afterCursor;
        break;
      default:
        return;
    }

    setContent(newContent);
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [
            {
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => {
          if (hasChanges) {
            handleBackWithChanges();
          } else {
            navigation.goBack();
          }
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
          {mode === 'create'
            ? 'Ghi Chú Mới'
            : isEditing
            ? 'Chỉnh Sửa'
            : 'Xem Ghi Chú'}
        </Text>
        {saving && <Text style={styles.savingText}>Đang lưu...</Text>}
      </View>

      <View style={styles.headerActions}>
        {noteId && (
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Icon
              name="trash-outline"
              size={22}
              color={NOTES_CONFIG.COLORS.ERROR}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.headerButton, styles.primaryButton]}
          onPress={isEditing ? () => handleSave() : toggleEditing}
        >
          <Icon
            name={isEditing ? 'checkmark' : 'create-outline'}
            size={22}
            color={isEditing ? '#FFFFFF' : NOTES_CONFIG.COLORS.PRIMARY}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderToolbar = () =>
    isEditing && (
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => insertMarkdown('bold')}
          >
            <Icon
              name="text"
              size={20}
              color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            />
            <Text style={styles.toolbarButtonText}>B</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => insertMarkdown('italic')}
          >
            <Text style={[styles.toolbarButtonText, { fontStyle: 'italic' }]}>
              I
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => insertMarkdown('heading')}
          >
            <Icon
              name="text-outline"
              size={20}
              color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => insertMarkdown('list')}
          >
            <Icon
              name="list"
              size={20}
              color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => insertMarkdown('checklist')}
          >
            <Icon
              name="checkbox-outline"
              size={20}
              color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowMarkdown(!showMarkdown)}
          >
            <Icon
              name={showMarkdown ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={
                showMarkdown
                  ? NOTES_CONFIG.COLORS.PRIMARY
                  : NOTES_CONFIG.COLORS.TEXT_SECONDARY
              }
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );

  const renderEditor = () => (
    <Animated.View
      style={[
        styles.editorContainer,
        {
          opacity: editorAnim,
          transform: [
            {
              translateY: editorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <TextInput
            ref={titleInputRef}
            style={[styles.titleInput, !isEditing && styles.titleReadonly]}
            placeholder="Tiêu đề ghi chú..."
            placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            value={title}
            onChangeText={setTitle}
            editable={isEditing}
            multiline
            returnKeyType="next"
            onSubmitEditing={() => contentInputRef.current?.focus()}
          />

          {/* Content Input */}
          <TextInput
            ref={contentInputRef}
            style={[styles.contentInput, !isEditing && styles.contentReadonly]}
            placeholder="Bắt đầu viết..."
            placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            value={content}
            onChangeText={setContent}
            editable={isEditing}
            multiline
            textAlignVertical="top"
          />

          {/* Metadata */}
          {note && (
            <View style={styles.metadata}>
              <Text style={styles.metadataText}>
                Tạo: {new Date(note.created_at).toLocaleString('vi-VN')}
              </Text>
              <Text style={styles.metadataText}>
                Cập nhật: {new Date(note.updated_at).toLocaleString('vi-VN')}
              </Text>
              <Text style={styles.metadataText}>
                {wordCount} từ • {characterCount} ký tự
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderToolbar()}
      {renderEditor()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.LG,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
  },
  savingText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  toolbar: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButtonText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  editorContainer: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  titleInput: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XXL,
    fontWeight: '700',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    lineHeight: 36,
    minHeight: 40,
  },
  titleReadonly: {
    backgroundColor: 'transparent',
  },
  contentInput: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  contentReadonly: {
    backgroundColor: 'transparent',
  },
  metadata: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: NOTES_CONFIG.COLORS.BORDER,
  },
  metadataText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
});

export default NoteDetail;
