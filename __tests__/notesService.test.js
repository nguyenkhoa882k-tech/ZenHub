import NotesService from '../src/services/notesService';
import StorageService from '../src/services/storageService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Mock StorageService
jest.mock('../src/services/storageService');

describe('NotesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a new note with default values', async () => {
      const mockNotes = [];
      StorageService.getItem.mockResolvedValue(mockNotes);
      StorageService.setItem.mockResolvedValue(true);

      const noteData = {
        title: 'Test Note',
        body: 'Test content',
      };

      const result = await NotesService.createNote(noteData);

      expect(result).toMatchObject({
        title: 'Test Note',
        body: 'Test content',
        tags: [],
        checklist: [],
        completed: false,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should handle empty title with default', async () => {
      const mockNotes = [];
      StorageService.getItem.mockResolvedValue(mockNotes);
      StorageService.setItem.mockResolvedValue(true);

      const noteData = { body: 'Test content' };
      const result = await NotesService.createNote(noteData);

      expect(result.title).toBe('Untitled');
    });
  });

  describe('getAllNotes', () => {
    it('should return sorted notes by updatedAt', async () => {
      const mockNotes = [
        {
          id: '1',
          title: 'Note 1',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          title: 'Note 2',
          updatedAt: '2023-01-02T00:00:00.000Z',
        },
      ];
      StorageService.getItem.mockResolvedValue(mockNotes);

      const result = await NotesService.getAllNotes();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2'); // Most recent first
      expect(result[1].id).toBe('1');
    });

    it('should return empty array when no notes', async () => {
      StorageService.getItem.mockResolvedValue([]);

      const result = await NotesService.getAllNotes();

      expect(result).toEqual([]);
    });
  });

  describe('updateNote', () => {
    it('should update existing note', async () => {
      const mockNotes = [
        {
          id: '1',
          title: 'Original Title',
          body: 'Original Body',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ];
      StorageService.getItem.mockResolvedValue(mockNotes);
      StorageService.setItem.mockResolvedValue(true);

      const updateData = { title: 'Updated Title' };
      const result = await NotesService.updateNote('1', updateData);

      expect(result.title).toBe('Updated Title');
      expect(result.body).toBe('Original Body');
      expect(result.updatedAt).not.toBe('2023-01-01T00:00:00.000Z');
    });

    it('should return null for non-existent note', async () => {
      const mockNotes = [];
      StorageService.getItem.mockResolvedValue(mockNotes);

      const result = await NotesService.updateNote('999', { title: 'Test' });

      expect(result).toBeNull();
    });
  });

  describe('deleteNote', () => {
    it('should delete note by id', async () => {
      const mockNotes = [
        { id: '1', title: 'Note 1' },
        { id: '2', title: 'Note 2' },
      ];
      StorageService.getItem.mockResolvedValue(mockNotes);
      StorageService.setItem.mockResolvedValue(true);

      const result = await NotesService.deleteNote('1');

      expect(result).toBe(true);
      expect(StorageService.setItem).toHaveBeenCalledWith(expect.any(String), [
        { id: '2', title: 'Note 2' },
      ]);
    });
  });

  describe('searchNotes', () => {
    it('should search notes by title, body, and tags', async () => {
      const mockNotes = [
        {
          id: '1',
          title: 'JavaScript Guide',
          body: 'Learn React Native',
          tags: ['programming'],
        },
        {
          id: '2',
          title: 'Recipe',
          body: 'How to cook pasta',
          tags: ['cooking'],
        },
        {
          id: '3',
          title: 'Shopping',
          body: 'Buy groceries',
          tags: ['shopping', 'programming'],
        },
      ];
      StorageService.getItem.mockResolvedValue(mockNotes);

      // Search by title
      let result = await NotesService.searchNotes('javascript');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');

      // Search by body
      result = await NotesService.searchNotes('pasta');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');

      // Search by tag
      result = await NotesService.searchNotes('programming');
      expect(result).toHaveLength(2);

      // Empty search should return all
      result = await NotesService.searchNotes('');
      expect(result).toHaveLength(3);
    });
  });

  describe('toggleNoteComplete', () => {
    it('should toggle completion status', async () => {
      const mockNote = {
        id: '1',
        title: 'Test Note',
        completed: false,
      };

      // Mock getNoteById
      NotesService.getNoteById = jest.fn().mockResolvedValue(mockNote);

      // Mock updateNote
      const updatedNote = { ...mockNote, completed: true };
      NotesService.updateNote = jest.fn().mockResolvedValue(updatedNote);

      const result = await NotesService.toggleNoteComplete('1');

      expect(NotesService.updateNote).toHaveBeenCalledWith('1', {
        completed: true,
      });
      expect(result.completed).toBe(true);
    });
  });
});
