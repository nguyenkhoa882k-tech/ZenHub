import { STORAGE_KEYS } from '../config/constants';
import { getItem, setItem } from './storageService';
import { generateId } from '../utils/helpers';

/**
 * Get all notes
 * @returns {Promise<Array>} Array of notes
 */
export const getAllNotes = async () => {
  try {
    const notes = await getItem(STORAGE_KEYS.NOTES, []);
    return notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (error) {
    console.error('NotesService - getAllNotes error:', error);
    return [];
  }
};

/**
 * Get note by ID
 * @param {string} id - Note ID
 * @returns {Promise<Object|null>} Note object or null
 */
export const getNoteById = async id => {
  try {
    const notes = await getAllNotes();
    return notes.find(note => note.id === id) || null;
  } catch (error) {
    console.error('NotesService - getNoteById error:', error);
    return null;
  }
};

/**
 * Create new note
 * @param {Object} noteData - Note data
 * @returns {Promise<Object|null>} Created note or null
 */
export const createNote = async noteData => {
  try {
    const notes = await getAllNotes();
    const newNote = {
      id: generateId(),
      title: noteData.title || 'Untitled',
      body: noteData.body || '',
      tags: noteData.tags || [],
      dueDate: noteData.dueDate || null,
      checklist: noteData.checklist || [],
      completed: noteData.completed || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    notes.push(newNote);
    await setItem(STORAGE_KEYS.NOTES, notes);
    return newNote;
  } catch (error) {
    console.error('NotesService - createNote error:', error);
    return null;
  }
};

/**
 * Update existing note
 * @param {string} id - Note ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated note or null
 */
export const updateNote = async (id, updateData) => {
  try {
    const notes = await getAllNotes();
    const noteIndex = notes.findIndex(note => note.id === id);

    if (noteIndex === -1) {
      return null;
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await setItem(STORAGE_KEYS.NOTES, notes);
    return notes[noteIndex];
  } catch (error) {
    console.error('NotesService - updateNote error:', error);
    return null;
  }
};

/**
 * Delete note
 * @param {string} id - Note ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteNote = async id => {
  try {
    const notes = await getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    await setItem(STORAGE_KEYS.NOTES, filteredNotes);
    return true;
  } catch (error) {
    console.error('NotesService - deleteNote error:', error);
    return false;
  }
};

/**
 * Search notes by title, body, or tags
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered notes
 */
export const searchNotes = async query => {
  try {
    const notes = await getAllNotes();

    if (!query || query.trim() === '') {
      return notes;
    }

    const searchTerm = query.toLowerCase().trim();

    return notes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(searchTerm);
      const bodyMatch = note.body.toLowerCase().includes(searchTerm);
      const tagsMatch = note.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm),
      );

      return titleMatch || bodyMatch || tagsMatch;
    });
  } catch (error) {
    console.error('NotesService - searchNotes error:', error);
    return [];
  }
};

/**
 * Filter notes by tag
 * @param {string} tag - Tag to filter by
 * @returns {Promise<Array>} Filtered notes
 */
export const getNotesByTag = async tag => {
  try {
    const notes = await getAllNotes();
    return notes.filter(note => note.tags.includes(tag));
  } catch (error) {
    console.error('NotesService - getNotesByTag error:', error);
    return [];
  }
};

/**
 * Get all unique tags
 * @returns {Promise<Array>} Array of unique tags
 */
export const getAllTags = async () => {
  try {
    const notes = await getAllNotes();
    const allTags = notes.flatMap(note => note.tags);
    return [...new Set(allTags)].sort();
  } catch (error) {
    console.error('NotesService - getAllTags error:', error);
    return [];
  }
};

/**
 * Export notes as JSON
 * @returns {Promise<string>} JSON string of all notes
 */
export const exportNotes = async () => {
  try {
    const notes = await getAllNotes();
    return JSON.stringify(notes, null, 2);
  } catch (error) {
    console.error('NotesService - exportNotes error:', error);
    return '[]';
  }
};

/**
 * Import notes from JSON
 * @param {string} jsonData - JSON string of notes
 * @returns {Promise<boolean>} Success status
 */
export const importNotes = async jsonData => {
  try {
    const importedNotes = JSON.parse(jsonData);

    if (!Array.isArray(importedNotes)) {
      throw new Error('Invalid notes format');
    }

    const existingNotes = await getAllNotes();
    const mergedNotes = [...existingNotes, ...importedNotes];

    // Remove duplicates based on ID
    const uniqueNotes = mergedNotes.filter(
      (note, index, array) => array.findIndex(n => n.id === note.id) === index,
    );

    await setItem(STORAGE_KEYS.NOTES, uniqueNotes);
    return true;
  } catch (error) {
    console.error('NotesService - importNotes error:', error);
    return false;
  }
};

/**
 * Toggle note completion status
 * @param {string} id - Note ID
 * @returns {Promise<Object|null>} Updated note or null
 */
export const toggleNoteComplete = async id => {
  try {
    const note = await getNoteById(id);
    if (!note) return null;

    return await updateNote(id, {
      completed: !note.completed,
    });
  } catch (error) {
    console.error('NotesService - toggleNoteComplete error:', error);
    return null;
  }
};

/**
 * Add item to checklist
 * @param {string} noteId - Note ID
 * @param {string} item - Checklist item text
 * @returns {Promise<Object|null>} Updated note or null
 */
export const addChecklistItem = async (noteId, item) => {
  try {
    const note = await getNoteById(noteId);
    if (!note) return null;

    const newItem = {
      id: generateId(),
      text: item,
      completed: false,
    };

    const updatedChecklist = [...note.checklist, newItem];

    return await updateNote(noteId, {
      checklist: updatedChecklist,
    });
  } catch (error) {
    console.error('NotesService - addChecklistItem error:', error);
    return null;
  }
};

/**
 * Toggle checklist item completion
 * @param {string} noteId - Note ID
 * @param {string} itemId - Checklist item ID
 * @returns {Promise<Object|null>} Updated note or null
 */
export const toggleChecklistItem = async (noteId, itemId) => {
  try {
    const note = await getNoteById(noteId);
    if (!note) return null;

    const updatedChecklist = note.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );

    return await updateNote(noteId, {
      checklist: updatedChecklist,
    });
  } catch (error) {
    console.error('NotesService - toggleChecklistItem error:', error);
    return null;
  }
};

// Default export for backward compatibility
const NotesService = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  getNotesByTag,
  getAllTags,
  exportNotes,
  importNotes,
  toggleNoteComplete,
  addChecklistItem,
  toggleChecklistItem,
};

export default NotesService;
