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
  PermissionsAndroid,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import AudioRecord from 'react-native-audio-record';
import notesService from '../../services/notes/notesService';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';
import ChecklistPreview from './ChecklistPreview';

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
  const [showPreview, setShowPreview] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const recordingTimer = useRef(null);
  const recordingDotAnim = useRef(new Animated.Value(1)).current;
  const recordingStartTime = useRef(null);

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
      loadTags();
      setupAudioRecord();
      requestAudioPermission();

      // Auto focus title input
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 300);
    } else {
      animateOut();
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (isRecording) {
        AudioRecord.stop().catch(console.error);
      }
    };
  }, [isRecording]);

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

    // Reset recording state
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }

    // Stop any ongoing recording
    if (isRecording) {
      AudioRecord.stop().catch(console.error);
    }
  };

  // Audio recording functions
  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Quyền Ghi Âm',
            message: 'Ứng dụng cần quyền ghi âm để tạo ghi chú bằng giọng nói.',
            buttonNeutral: 'Hỏi Lại Sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'Đồng Ý',
          },
        );
        const permissionGranted =
          granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(permissionGranted);
        return permissionGranted;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const setupAudioRecord = () => {
    try {
      const options = {
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6, // VOICE_RECOGNITION
        wavFile: 'voice_note.wav',
      };
      console.log('Initializing AudioRecord with options:', options);
      AudioRecord.init(options);
      console.log('AudioRecord initialized successfully');
    } catch (error) {
      console.error('Error setting up audio record:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    console.log('startRecording called');
    const permission = await requestAudioPermission();
    if (!permission) {
      Alert.alert('Lỗi', 'Cần cấp quyền ghi âm để sử dụng tính năng này.');
      return;
    }

    try {
      console.log('Setting up audio record...');
      setupAudioRecord();

      console.log('Starting audio record...');
      AudioRecord.start();

      console.log('Setting recording state...');
      setIsRecording(true);
      setRecordingDuration(0);
      recordingStartTime.current = Date.now();

      // Start timer with timestamp-based approach
      console.log('Starting timer...');
      recordingTimer.current = setInterval(() => {
        if (recordingStartTime.current) {
          const elapsed = Math.floor(
            (Date.now() - recordingStartTime.current) / 1000,
          );
          console.log('Timer tick - elapsed seconds:', elapsed);
          setRecordingDuration(elapsed);
        }
      }, 1000);

      // Start blinking animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingDotAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingDotAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm. Hãy thử lại.');

      // Fallback - show input for manual entry
      Alert.alert(
        'Ghi âm thủ công',
        'Bạn có muốn nhập nội dung thủ công thay vì ghi âm không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Nhập thủ công', onPress: () => setCaptureMode('text') },
        ],
      );
    }
  };

  const stopRecording = async () => {
    console.log('stopRecording called');
    try {
      console.log('Stopping AudioRecord...');
      const audioFile = await AudioRecord.stop();

      console.log('Clearing recording state...');
      setIsRecording(false);

      // Calculate final duration
      const finalDuration = recordingStartTime.current
        ? Math.floor((Date.now() - recordingStartTime.current) / 1000)
        : recordingDuration;

      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      recordingStartTime.current = null;

      // Stop blinking animation
      recordingDotAnim.stopAnimation();
      recordingDotAnim.setValue(1);

      console.log('Audio file saved at:', audioFile);
      console.log('Recording duration:', finalDuration, 'seconds');

      // Only add audio content if we're in voice mode
      if (captureMode === 'voice') {
        // Create richer content with audio metadata
        const audioData = {
          type: 'audio',
          filePath: audioFile,
          duration: finalDuration,
          timestamp: new Date().toISOString(),
        };

        const transcription = `[🎤 Ghi âm ${formatDuration(
          finalDuration,
        )}]\nFile: ${audioFile}\nThời gian: ${new Date().toLocaleString(
          'vi-VN',
        )}`;

        setContent(prev => prev + (prev ? '\n\n' : '') + transcription);

        // Store audio metadata for the note
        console.log('Audio metadata:', audioData);

        Alert.alert(
          'Thành Công',
          `Đã ghi âm xong (${formatDuration(
            finalDuration,
          )}). \n\nFile: ${audioFile}\n\nBạn có thể chỉnh sửa nội dung trước khi lưu ghi chú.`,
        );
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      Alert.alert('Lỗi', 'Có lỗi khi dừng ghi âm.');
    }
  };

  const formatDuration = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        // Store note type in metadata for future reference
        noteData.metadata = { noteType: 'checklist' };
      } else if (captureMode === 'text') {
        noteData.metadata = { noteType: 'text' };
      } else if (captureMode === 'voice') {
        // Extract audio file path from content if exists
        const audioFileMatch = content.match(/File: (.+)/);
        const audioFile = audioFileMatch ? audioFileMatch[1] : null;

        noteData.metadata = {
          noteType: 'voice',
          audioFile: audioFile,
          hasAudio: !!audioFile,
        };

        console.log('Saving voice note with metadata:', noteData.metadata);
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
      .filter(line => line.trim() || line === '') // Keep empty lines for formatting
      .map(line => {
        if (!line.trim()) return ''; // Preserve empty lines

        // Check if already in checklist format
        if (line.match(/^\s*- \[[ x]\]/)) {
          return line;
        }

        // Check if line starts with bullet or checkbox patterns
        if (line.match(/^\s*[-*•]/)) {
          // Remove existing bullet and add checklist format
          const lineContent = line.replace(/^\s*[-*•]\s*/, '').trim();
          return `- [ ] ${lineContent}`;
        }

        // Regular line - convert to checklist format
        return `- [ ] ${line.trim()}`;
      })
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

  const handleCaptureModeChange = async newMode => {
    // If currently recording, stop it first
    if (isRecording && captureMode === 'voice') {
      Alert.alert(
        'Đang ghi âm',
        'Bạn có muốn dừng ghi âm hiện tại và chuyển sang chế độ khác?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Dừng và chuyển',
            onPress: async () => {
              await stopRecording();
              setCaptureMode(newMode);
            },
          },
        ],
      );
    } else {
      setCaptureMode(newMode);
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
            onPress={() => handleCaptureModeChange(mode.key)}
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
      <TouchableOpacity
        style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={saving}
      >
        <Icon name={isRecording ? 'stop' : 'mic'} size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingDuration}>
            {formatDuration(recordingDuration)}
          </Text>
          <View style={styles.recordingIndicator}>
            <Animated.View
              style={[styles.recordingDot, { opacity: recordingDotAnim }]}
            />
            <Text style={styles.recordingStatus}>Đang ghi âm...</Text>
          </View>
        </View>
      )}

      <Text style={styles.voiceInstructions}>
        {isRecording ? 'Nhấn để dừng ghi âm' : 'Nhấn để bắt đầu ghi âm'}
      </Text>

      {!hasPermission && (
        <Text style={styles.permissionWarning}>
          ⚠️ Cần cấp quyền microphone để ghi âm
        </Text>
      )}
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
                    <View style={styles.contentHeader}>
                      <Text style={styles.contentLabel}>
                        {captureMode === 'checklist'
                          ? 'Danh sách việc cần làm'
                          : 'Nội dung ghi chú'}
                      </Text>
                      {captureMode === 'checklist' && content.trim() && (
                        <TouchableOpacity
                          style={styles.previewToggle}
                          onPress={() => setShowPreview(!showPreview)}
                        >
                          <Icon
                            name={
                              showPreview ? 'eye-off-outline' : 'eye-outline'
                            }
                            size={16}
                            color={NOTES_CONFIG.COLORS.PRIMARY}
                          />
                          <Text style={styles.previewToggleText}>
                            {showPreview ? 'Ẩn' : 'Xem'} preview
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {captureMode === 'checklist' && showPreview ? (
                      <ChecklistPreview content={content} />
                    ) : (
                      <TextInput
                        ref={contentInputRef}
                        style={[
                          styles.contentInput,
                          captureMode === 'checklist' && styles.checklistInput,
                        ]}
                        placeholder={
                          captureMode === 'checklist'
                            ? 'Nhập danh sách việc cần làm...\nMỗi dòng sẽ thành một mục\n\nVí dụ:\n- [ ] Việc cần làm 1\n- [ ] Việc cần làm 2\n- [x] Việc đã hoàn thành'
                            : 'Nội dung ghi chú...'
                        }
                        placeholderTextColor={
                          NOTES_CONFIG.COLORS.TEXT_SECONDARY
                        }
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                        maxLength={1000}
                      />
                    )}
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
    minHeight: '85%',
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
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentLabel: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
  },
  previewToggleText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    color: NOTES_CONFIG.COLORS.PRIMARY,
    fontWeight: '500',
    marginLeft: 4,
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
  voiceButtonRecording: {
    backgroundColor: '#FF3030',
    transform: [{ scale: 1.1 }],
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingDuration: {
    fontSize: 20,
    fontWeight: 'bold',
    color: NOTES_CONFIG.COLORS.ERROR,
    marginBottom: 4,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NOTES_CONFIG.COLORS.ERROR,
    marginRight: 6,
  },
  recordingStatus: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.ERROR,
    fontWeight: '500',
  },
  voiceInstructions: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionWarning: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: '#FF6B35',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default QuickCaptureModal;
