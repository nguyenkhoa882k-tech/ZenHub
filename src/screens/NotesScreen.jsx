import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  EmptyState,
} from '../components/UI';
import NotesService from '../services/notesService';
import adsService from '../services/adsService';
import { formatDate, truncateText } from '../utils/helpers';

const NotesScreen = () => {
  const navigation = useNavigation();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const notesData = await NotesService.getAllNotes();
      const tagsData = await NotesService.getAllTags();

      setNotes(notesData);
      setFilteredNotes(notesData);
      setAllTags(tagsData);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, []),
  );

  const filterNotes = useCallback(async () => {
    let filtered = notes;

    if (searchQuery.trim()) {
      filtered = await NotesService.searchNotes(searchQuery);
    }

    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    setFilteredNotes(filtered);
  }, [searchQuery, selectedTag, notes]);

  useEffect(() => {
    filterNotes();
  }, [filterNotes]);

  const handleCreateNote = () => {
    navigation.navigate('NoteDetail', { mode: 'create' });
  };

  const handleEditNote = noteId => {
    navigation.navigate('NoteDetail', { mode: 'edit', noteId });
  };

  const handleDeleteNote = async noteId => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await NotesService.deleteNote(noteId);
          if (success) {
            loadNotes();
          }
        },
      },
    ]);
  };

  const handleToggleComplete = async noteId => {
    await NotesService.toggleNoteComplete(noteId);
    loadNotes();
  };

  const handleExportNotes = async () => {
    try {
      await NotesService.exportNotes();
      // Here you would typically use react-native-share to share the file
      Alert.alert('Export', 'Notes exported successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to export notes');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedTag('');
  };

  const renderNoteCard = ({ item: note }) => (
    <Card
      className="mx-4 mb-4"
      pressable
      onPress={() => handleEditNote(note.id)}
    >
      <CardHeader
        title={note.title}
        subtitle={formatDate(new Date(note.updatedAt))}
        action={
          <View className="flex-row">
            <TouchableOpacity
              className="p-2"
              onPress={() => handleToggleComplete(note.id)}
            >
              <Icon
                name={note.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={note.completed ? '#22c55e' : '#78716c'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2 ml-2"
              onPress={() => handleDeleteNote(note.id)}
            >
              <Icon name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        }
      />

      <CardContent>
        {note.body && (
          <Text className="text-warm-700 text-base mb-3 leading-6">
            {truncateText(note.body, 100)}
          </Text>
        )}

        {note.dueDate && (
          <View className="flex-row items-center mb-3">
            <Icon name="calendar-outline" size={16} color="#78716c" />
            <Text className="text-warm-600 text-sm ml-2">
              Due: {formatDate(new Date(note.dueDate))}
            </Text>
          </View>
        )}

        {note.checklist.length > 0 && (
          <View className="flex-row items-center mb-3">
            <Icon name="list-outline" size={16} color="#78716c" />
            <Text className="text-warm-600 text-sm ml-2">
              {note.checklist.filter(item => item.completed).length}/
              {note.checklist.length} completed
            </Text>
          </View>
        )}

        {note.tags.length > 0 && (
          <View className="flex-row flex-wrap">
            {note.tags.map((tag, index) => (
              <Badge
                key={index}
                text={tag}
                variant="primary"
                className="mr-2 mb-1"
                onPress={() => setSelectedTag(tag)}
              />
            ))}
          </View>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="document-text-outline"
      title="No notes yet"
      description="Create your first note to get started organizing your thoughts and tasks."
      action={
        <Button title="Create Note" onPress={handleCreateNote} icon="add" />
      }
    />
  );

  const renderHeader = () => (
    <View className="px-4 py-4">
      {/* Search Bar */}
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row items-center">
          <Icon name="search-outline" size={20} color="#78716c" />
          <TextInput
            className="flex-1 ml-3 text-warm-900"
            placeholder="Search notes..."
            placeholderTextColor="#78716c"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {(searchQuery || selectedTag) && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              <Icon name="close-circle" size={20} color="#78716c" />
            </TouchableOpacity>
          )}
        </View>

        {selectedTag && (
          <View className="mt-3">
            <Text className="text-warm-600 text-sm mb-2">Filtered by tag:</Text>
            <Badge
              text={selectedTag}
              variant="primary"
              removable
              onRemove={() => setSelectedTag('')}
            />
          </View>
        )}
      </View>

      {/* Tags */}
      {allTags.length > 0 && !selectedTag && (
        <View className="mb-4">
          <Text className="text-warm-800 font-semibold mb-3">
            Filter by tags:
          </Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={allTags}
            keyExtractor={item => item}
            renderItem={({ item: tag }) => (
              <Badge
                text={tag}
                variant="secondary"
                className="mr-2"
                onPress={() => setSelectedTag(tag)}
              />
            )}
          />
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row mb-4">
        <Button
          title="New Note"
          onPress={handleCreateNote}
          icon="add"
          className="flex-1 mr-2"
        />
        <Button
          title="Export"
          onPress={handleExportNotes}
          variant="outline"
          icon="download-outline"
          className="flex-1 ml-2"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-warm-50">
      <FlatList
        data={filteredNotes}
        renderItem={renderNoteCard}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerClassName={
          filteredNotes.length === 0 ? 'flex-1' : 'pb-20'
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Banner Ad */}
      <View className="absolute bottom-0 left-0 right-0 bg-white">
        {adsService.createBannerAd('self-center')}
      </View>
    </SafeAreaView>
  );
};

export default NotesScreen;
