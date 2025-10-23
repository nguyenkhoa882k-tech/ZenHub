import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import { Card, CardContent, Button, Badge } from '../components/UI';
import * as notesService from '../services/notes/notesService';
import { formatDate } from '../utils/helpers';

const NoteDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, noteId } = route.params;

  const [note, setNote] = useState({
    title: '',
    body: '',
    tags: [],
    dueDate: null,
    checklist: [],
    completed: false,
  });
  const [newTag, setNewTag] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadNote = useCallback(async () => {
    try {
      setIsLoading(true);
      const noteData = await notesService.getNoteById(noteId);
      if (noteData) {
        setNote(noteData);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      Alert.alert('Error', 'Failed to load note');
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    if (mode === 'edit' && noteId) {
      loadNote();
    }
  }, [mode, noteId, loadNote]);

  const handleSave = async () => {
    if (!note.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      setIsLoading(true);

      if (mode === 'create') {
        await notesService.createNote(note);
      } else {
        await notesService.updateNote(noteId, note);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !note.tags.includes(newTag.trim())) {
      setNote(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = tagToRemove => {
    setNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleAddChecklistItem = async () => {
    if (newChecklistItem.trim()) {
      if (mode === 'edit' && noteId) {
        await notesService.addChecklistItem(noteId, newChecklistItem.trim());
        loadNote();
      } else {
        // For new notes, add to local state
        setNote(prev => ({
          ...prev,
          checklist: [
            ...prev.checklist,
            {
              id: Date.now().toString(),
              text: newChecklistItem.trim(),
              completed: false,
            },
          ],
        }));
      }
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = async itemId => {
    if (mode === 'edit' && noteId) {
      await notesService.toggleChecklistItem(noteId, itemId);
      loadNote();
    } else {
      // For new notes, toggle in local state
      setNote(prev => ({
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item,
        ),
      }));
    }
  };

  const handleRemoveChecklistItem = itemId => {
    setNote(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== itemId),
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <Card className="mx-4 mt-4 mb-4">
            <CardContent>
              <Text className="text-warm-800 font-semibold mb-3">Title</Text>
              <TextInput
                className="bg-warm-50 rounded-xl p-4 text-warm-900 text-lg"
                placeholder="Enter note title..."
                placeholderTextColor="#78716c"
                value={note.title}
                onChangeText={text =>
                  setNote(prev => ({ ...prev, title: text }))
                }
                multiline={false}
                returnKeyType="next"
              />
            </CardContent>
          </Card>

          {/* Body Input */}
          <Card className="mx-4 mb-4">
            <CardContent>
              <Text className="text-warm-800 font-semibold mb-3">Content</Text>
              <TextInput
                className="bg-warm-50 rounded-xl p-4 text-warm-900 min-h-[120px]"
                placeholder="Write your thoughts here..."
                placeholderTextColor="#78716c"
                value={note.body}
                onChangeText={text =>
                  setNote(prev => ({ ...prev, body: text }))
                }
                multiline
                textAlignVertical="top"
              />
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card className="mx-4 mb-4">
            <CardContent>
              <Text className="text-warm-800 font-semibold mb-3">Tags</Text>

              {/* Existing Tags */}
              {note.tags.length > 0 && (
                <View className="flex-row flex-wrap mb-4">
                  {note.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      text={tag}
                      variant="primary"
                      className="mr-2 mb-2"
                      removable
                      onRemove={() => handleRemoveTag(tag)}
                    />
                  ))}
                </View>
              )}

              {/* Add New Tag */}
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-warm-50 rounded-xl p-3 text-warm-900 mr-3"
                  placeholder="Add a tag..."
                  placeholderTextColor="#78716c"
                  value={newTag}
                  onChangeText={setNewTag}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  className="bg-primary-500 rounded-xl px-4 py-3 justify-center"
                  onPress={handleAddTag}
                >
                  <Icon name="add" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Checklist Section */}
          <Card className="mx-4 mb-4">
            <CardContent>
              <Text className="text-warm-800 font-semibold mb-3">
                Checklist
              </Text>

              {/* Existing Checklist Items */}
              {note.checklist.map(item => (
                <View key={item.id} className="flex-row items-center mb-3">
                  <TouchableOpacity
                    className="mr-3"
                    onPress={() => handleToggleChecklistItem(item.id)}
                  >
                    <Icon
                      name={
                        item.completed ? 'checkmark-circle' : 'ellipse-outline'
                      }
                      size={24}
                      color={item.completed ? '#22c55e' : '#78716c'}
                    />
                  </TouchableOpacity>
                  <Text
                    className={`flex-1 text-warm-900 ${
                      item.completed ? 'line-through text-warm-500' : ''
                    }`}
                  >
                    {item.text}
                  </Text>
                  <TouchableOpacity
                    className="ml-3"
                    onPress={() => handleRemoveChecklistItem(item.id)}
                  >
                    <Icon name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add New Checklist Item */}
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-warm-50 rounded-xl p-3 text-warm-900 mr-3"
                  placeholder="Add checklist item..."
                  placeholderTextColor="#78716c"
                  value={newChecklistItem}
                  onChangeText={setNewChecklistItem}
                  onSubmitEditing={handleAddChecklistItem}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  className="bg-primary-500 rounded-xl px-4 py-3 justify-center"
                  onPress={handleAddChecklistItem}
                >
                  <Icon name="add" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </CardContent>
          </Card>

          {/* Note Info (for editing mode) */}
          {mode === 'edit' && note.createdAt && (
            <Card className="mx-4 mb-4">
              <CardContent>
                <Text className="text-warm-600 text-sm">
                  Created: {formatDate(new Date(note.createdAt))}
                </Text>
                {note.updatedAt !== note.createdAt && (
                  <Text className="text-warm-600 text-sm mt-1">
                    Last updated: {formatDate(new Date(note.updatedAt))}
                  </Text>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bottom Spacing */}
          <View className="h-24" />
        </ScrollView>

        {/* Action Buttons */}
        <View className="bg-white p-4 border-t border-warm-200">
          <View className="flex-row">
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => navigation.goBack()}
              className="flex-1 mr-2"
            />
            <Button
              title={mode === 'create' ? 'Create Note' : 'Save Changes'}
              onPress={handleSave}
              disabled={isLoading}
              className="flex-1 ml-2"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NoteDetailScreen;
