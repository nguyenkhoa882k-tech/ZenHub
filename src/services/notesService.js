import { STORAGE_KEYS } from '../config/constants';
import StorageService from './storageService';
import { generateId } from '../utils/helpers';

class NotesService {
  /**
   * Get all notes
   * @returns {Promise<Array>} Array of notes
   */
  static async getAllNotes() {
    try {
      const notes = await StorageService.getItem(STORAGE_KEYS.NOTES, []);
      return notes.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      );
    } catch (error) {
      console.error('NotesService - getAllNotes error:', error);
      return [];
    }
  }

  /**
   * Get note by ID
   * @param {string} id - Note ID
   * @returns {Promise<Object|null>} Note object or null
   */
  static async getNoteById(id) {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.id === id) || null;
    } catch (error) {
      console.error('NotesService - getNoteById error:', error);
      return null;
    }
  }

  /**
   * Create new note
   * @param {Object} noteData - Note data
   * @returns {Promise<Object|null>} Created note or null
   */
  static async createNote(noteData) {
    try {
      const notes = await this.getAllNotes();
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
      await StorageService.setItem(STORAGE_KEYS.NOTES, notes);
      return newNote;
    } catch (error) {
      console.error('NotesService - createNote error:', error);
      return null;
    }
  }

  /**
   * Update existing note
   * @param {string} id - Note ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated note or null
   */
  static async updateNote(id, updateData) {
    try {
      const notes = await this.getAllNotes();
      const noteIndex = notes.findIndex(note => note.id === id);

      if (noteIndex === -1) {
        return null;
      }

      notes[noteIndex] = {
        ...notes[noteIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await StorageService.setItem(STORAGE_KEYS.NOTES, notes);
      return notes[noteIndex];
    } catch (error) {
      console.error('NotesService - updateNote error:', error);
      return null;
    }
  }

  /**
   * Delete note
   * @param {string} id - Note ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteNote(id) {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      await StorageService.setItem(STORAGE_KEYS.NOTES, filteredNotes);
      return true;
    } catch (error) {
      console.error('NotesService - deleteNote error:', error);
      return false;
    }
  }

  /**
   * Search notes by title, body, or tags
   * @param {string} query - Search query
   * @returns {Promise<Array>} Filtered notes
   */
  static async searchNotes(query) {
    try {
      const notes = await this.getAllNotes();

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
  }

  /**
   * Filter notes by tag
   * @param {string} tag - Tag to filter by
   * @returns {Promise<Array>} Filtered notes
   */
  static async getNotesByTag(tag) {
    try {
      const notes = await this.getAllNotes();
      return notes.filter(note => note.tags.includes(tag));
    } catch (error) {
      console.error('NotesService - getNotesByTag error:', error);
      return [];
    }
  }

  /**
   * Get all unique tags
   * @returns {Promise<Array>} Array of unique tags
   */
  static async getAllTags() {
    try {
      const notes = await this.getAllNotes();
      const allTags = notes.flatMap(note => note.tags);
      return [...new Set(allTags)].sort();
    } catch (error) {
      console.error('NotesService - getAllTags error:', error);
      return [];
    }
  }

  /**
   * Export notes as JSON
   * @returns {Promise<string>} JSON string of all notes
   */
  static async exportNotes() {
    try {
      const notes = await this.getAllNotes();
      return JSON.stringify(notes, null, 2);
    } catch (error) {
      console.error('NotesService - exportNotes error:', error);
      return '[]';
    }
  }

  /**
   * Import notes from JSON
   * @param {string} jsonData - JSON string of notes
   * @returns {Promise<boolean>} Success status
   */
  static async importNotes(jsonData) {
    try {
      const importedNotes = JSON.parse(jsonData);

      if (!Array.isArray(importedNotes)) {
        throw new Error('Invalid notes format');
      }

      const existingNotes = await this.getAllNotes();
      const mergedNotes = [...existingNotes, ...importedNotes];

      // Remove duplicates based on ID
      const uniqueNotes = mergedNotes.filter(
        (note, index, array) =>
          array.findIndex(n => n.id === note.id) === index,
      );

      await StorageService.setItem(STORAGE_KEYS.NOTES, uniqueNotes);
      return true;
    } catch (error) {
      console.error('NotesService - importNotes error:', error);
      return false;
    }
  }

  /**
   * Toggle note completion status
   * @param {string} id - Note ID
   * @returns {Promise<Object|null>} Updated note or null
   */
  static async toggleNoteComplete(id) {
    try {
      const note = await this.getNoteById(id);
      if (!note) return null;

      return await this.updateNote(id, {
        completed: !note.completed,
      });
    } catch (error) {
      console.error('NotesService - toggleNoteComplete error:', error);
      return null;
    }
  }

  /**
   * Add item to checklist
   * @param {string} noteId - Note ID
   * @param {string} item - Checklist item text
   * @returns {Promise<Object|null>} Updated note or null
   */
  static async addChecklistItem(noteId, item) {
    try {
      const note = await this.getNoteById(noteId);
      if (!note) return null;

      const newItem = {
        id: generateId(),
        text: item,
        completed: false,
      };

      const updatedChecklist = [...note.checklist, newItem];

      return await this.updateNote(noteId, {
        checklist: updatedChecklist,
      });
    } catch (error) {
      console.error('NotesService - addChecklistItem error:', error);
      return null;
    }
  }

  /**
   * Toggle checklist item completion
   * @param {string} noteId - Note ID
   * @param {string} itemId - Checklist item ID
   * @returns {Promise<Object|null>} Updated note or null
   */
  static async toggleChecklistItem(noteId, itemId) {
    try {
      const note = await this.getNoteById(noteId);
      if (!note) return null;

      const updatedChecklist = note.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      );

      return await this.updateNote(noteId, {
        checklist: updatedChecklist,
      });
    } catch (error) {
      console.error('NotesService - toggleChecklistItem error:', error);
      return null;
    }
  }
}

export default NotesService;
