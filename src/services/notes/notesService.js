import * as storageService from './storageService';
import { NOTES_CONFIG, NOTES_FEATURES } from '../../config/notes/notesConfig';

/**
 * Notes Service - Quản lý tất cả operations liên quan đến notes
 * Hỗ trợ CRUD, search, versioning, templates, và nhiều tính năng khác
 */

// Internal state
let initialized = false;

/**
 * Khởi tạo service
 */
export const initialize = async () => {
  if (!storageService.getIsInitialized()) {
    await storageService.initialize();
  }

  // Tạo key-value table cho AsyncStorage mode
  if (storageService.getStorageType() === 'SQLITE') {
    await storageService.executeSql(`
      CREATE TABLE IF NOT EXISTS key_value_store (
        key TEXT PRIMARY KEY,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Khởi tạo default tags nếu chưa có
  await initializeDefaultTags();

  initialized = true;
  console.log('✅ NotesService initialized');
};

/**
 * Tạo default tags
 */
const initializeDefaultTags = async () => {
  const existingTags = await getAllTags();
  if (existingTags.length === 0) {
    for (const tag of NOTES_CONFIG.DEFAULT_TAGS) {
      await createTag(tag.name, tag.color);
    }
  }
};

// ==================== CRUD OPERATIONS ====================

/**
 * Tạo note mới
 */
export const createNote = async (data = {}) => {
  const note = {
    title: data.title || 'Ghi Chú Mới',
    content: data.content || '',
    folder_id: data.folder_id || null,
    pinned: data.pinned || 0,
    priority: data.priority || 0,
    board_column: data.board_column || 'inbox',
    board_position: data.board_position || 0,
    due_date: data.due_date || null,
    reminder_date: data.reminder_date || null,
    color: data.color || null,
    template_id: data.template_id || null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  };

  if (storageService.getStorageType() === 'SQLITE') {
    const sql = `
      INSERT INTO notes (title, content, folder_id, pinned, priority, board_column, board_position, due_date, reminder_date, color, template_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      note.title,
      note.content,
      note.folder_id,
      note.pinned,
      note.priority,
      note.board_column,
      note.board_position,
      note.due_date,
      note.reminder_date,
      note.color,
      note.template_id,
      note.metadata,
    ];

    const result = await storageService.executeSql(sql, params);
    const noteId = result.insertId;

    // Thêm tags nếu có
    if (data.tags && data.tags.length > 0) {
      await addTagsToNote(noteId, data.tags);
    }

    // Tạo version đầu tiên
    await createNoteVersion(noteId, note.title, note.content, 1);

    return await getNoteById(noteId);
  } else {
    // AsyncStorage implementation
    const noteId = Date.now().toString();
    const fullNote = {
      ...note,
      id: noteId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await storageService.setItem(`note_${noteId}`, fullNote);

    // Cập nhật danh sách notes
    const notesList = (await storageService.getItem('notes_list')) || [];
    notesList.push(noteId);
    await storageService.setItem('notes_list', notesList);

    return fullNote;
  }
};

/**
 * Lấy note theo ID
 */
export const getNoteById = async noteId => {
  if (storageService.getStorageType() === 'SQLITE') {
    const sql = `
      SELECT n.*, 
             GROUP_CONCAT(t.name) as tag_names,
             GROUP_CONCAT(t.color) as tag_colors,
             f.name as folder_name
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      LEFT JOIN folders f ON n.folder_id = f.id
      WHERE n.id = ? AND n.trashed = 0
      GROUP BY n.id
    `;

    const result = await storageService.executeSql(sql, [noteId]);
    if (result.rows.length === 0) return null;

    const note = result.rows.item(0);

    // Parse metadata
    if (note.metadata) {
      note.metadata = JSON.parse(note.metadata);
    }

    // Parse tags
    note.tags = [];
    if (note.tag_names) {
      const names = note.tag_names.split(',');
      const colors = note.tag_colors.split(',');
      note.tags = names.map((name, index) => ({
        name: name.trim(),
        color: colors[index] ? colors[index].trim() : '#6B7280',
      }));
    }

    return note;
  } else {
    return await storageService.getItem(`note_${noteId}`);
  }
};

/**
 * Cập nhật note
 */
export const updateNote = async (noteId, updates) => {
  const currentNote = await getNoteById(noteId);
  if (!currentNote) throw new Error('Note not found');

  const updatedNote = {
    ...currentNote,
    ...updates,
    updated_at: new Date().toISOString(),
    version: (currentNote.version || 1) + 1,
  };

  if (storageService.getStorageType() === 'SQLITE') {
    const sql = `
      UPDATE notes 
      SET title = ?, content = ?, folder_id = ?, pinned = ?, priority = ?, 
          board_column = ?, board_position = ?, due_date = ?, reminder_date = ?, 
          color = ?, template_id = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP, version = ?
      WHERE id = ?
    `;

    const params = [
      updatedNote.title,
      updatedNote.content,
      updatedNote.folder_id,
      updatedNote.pinned,
      updatedNote.priority,
      updatedNote.board_column,
      updatedNote.board_position,
      updatedNote.due_date,
      updatedNote.reminder_date,
      updatedNote.color,
      updatedNote.template_id,
      updatedNote.metadata ? JSON.stringify(updatedNote.metadata) : null,
      updatedNote.version,
      noteId,
    ];

    await storageService.executeSql(sql, params);

    // Cập nhật tags nếu có thay đổi
    if (updates.tags) {
      await updateNoteTags(noteId, updates.tags);
    }

    // Tạo version mới
    await createNoteVersion(
      noteId,
      updatedNote.title,
      updatedNote.content,
      updatedNote.version,
    );

    return await getNoteById(noteId);
  } else {
    await storageService.setItem(`note_${noteId}`, updatedNote);
    return updatedNote;
  }
};

/**
 * Xóa note (soft delete)
 */
export const deleteNote = async noteId => {
  if (storageService.getStorageType() === 'SQLITE') {
    const sql =
      'UPDATE notes SET trashed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await storageService.executeSql(sql, [noteId]);
  } else {
    const note = await getNoteById(noteId);
    if (note) {
      note.trashed = true;
      note.updated_at = new Date().toISOString();
      await storageService.setItem(`note_${noteId}`, note);
    }
  }
};

/**
 * Xóa note vĩnh viễn
 */
export const permanentDeleteNote = async noteId => {
  if (storageService.getStorageType() === 'SQLITE') {
    await storageService.transaction(async tx => {
      // Xóa attachments
      await tx.executeSql('DELETE FROM attachments WHERE note_id = ?', [
        noteId,
      ]);
      // Xóa tags
      await tx.executeSql('DELETE FROM note_tags WHERE note_id = ?', [noteId]);
      // Xóa versions
      await tx.executeSql('DELETE FROM note_versions WHERE note_id = ?', [
        noteId,
      ]);
      // Xóa links
      await tx.executeSql(
        'DELETE FROM note_links WHERE source_note_id = ? OR target_note_id = ?',
        [noteId, noteId],
      );
      // Xóa note
      await tx.executeSql('DELETE FROM notes WHERE id = ?', [noteId]);
    });
  } else {
    await storageService.removeItem(`note_${noteId}`);
    const notesList = (await storageService.getItem('notes_list')) || [];
    const updatedList = notesList.filter(id => id !== noteId);
    await storageService.setItem('notes_list', updatedList);
  }
};

/**
 * Khôi phục note từ trash
 */
export const restoreNote = async noteId => {
  if (storageService.getStorageType() === 'SQLITE') {
    const sql =
      'UPDATE notes SET trashed = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await storageService.executeSql(sql, [noteId]);
  } else {
    const note = await getNoteById(noteId);
    if (note) {
      note.trashed = false;
      note.updated_at = new Date().toISOString();
      await storageService.setItem(`note_${noteId}`, note);
    }
  }
};

// ==================== QUERY OPERATIONS ====================

/**
 * Lấy tất cả notes với filters và sorting
 */
export const getAllNotes = async (options = {}) => {
  const {
    includeArchived = false,
    includeTrashed = false,
    folderId = null,
    tags = [],
    sortBy = 'updated_at',
    sortOrder = 'DESC',
    limit = null,
    offset = 0,
  } = options;

  if (storageService.getStorageType() === 'SQLITE') {
    let sql = `
      SELECT n.*, 
             GROUP_CONCAT(t.name) as tag_names,
             GROUP_CONCAT(t.color) as tag_colors,
             f.name as folder_name
      FROM notes n
      LEFT JOIN note_tags nt ON n.id = nt.note_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      LEFT JOIN folders f ON n.folder_id = f.id
      WHERE 1=1
    `;

    const params = [];

    if (!includeTrashed) {
      sql += ' AND n.trashed = 0';
    }

    if (!includeArchived) {
      sql += ' AND n.archived = 0';
    }

    if (folderId !== null) {
      sql += ' AND n.folder_id = ?';
      params.push(folderId);
    }

    sql += ` GROUP BY n.id ORDER BY n.${sortBy} ${sortOrder}`;

    if (limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const result = await storageService.executeSql(sql, params);
    const notes = [];

    for (let i = 0; i < result.rows.length; i++) {
      const note = result.rows.item(i);

      // Parse metadata
      if (note.metadata) {
        note.metadata = JSON.parse(note.metadata);
      }

      // Parse tags
      note.tags = [];
      if (note.tag_names) {
        const names = note.tag_names.split(',');
        const colors = note.tag_colors.split(',');
        note.tags = names.map((name, index) => ({
          name: name.trim(),
          color: colors[index] ? colors[index].trim() : '#6B7280',
        }));
      }

      notes.push(note);
    }

    // Filter by tags if specified
    if (tags.length > 0) {
      return notes.filter(note =>
        tags.every(tag => note.tags.some(noteTag => noteTag.name === tag)),
      );
    }

    return notes;
  } else {
    // AsyncStorage implementation
    const notesList = (await storageService.getItem('notes_list')) || [];
    const notes = [];

    for (const noteId of notesList) {
      const note = await storageService.getItem(`note_${noteId}`);
      if (
        note &&
        (!note.trashed || includeTrashed) &&
        (!note.archived || includeArchived)
      ) {
        notes.push(note);
      }
    }

    // Sort notes
    notes.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return sortOrder === 'DESC'
        ? bVal.localeCompare(aVal)
        : aVal.localeCompare(bVal);
    });

    return notes.slice(offset, limit ? offset + limit : undefined);
  }
};

/**
 * Tìm kiếm notes
 */
export const searchNotes = async (query, options = {}) => {
  if (!query || query.length < NOTES_CONFIG.SEARCH.MIN_QUERY_LENGTH) {
    return [];
  }

  const { limit = NOTES_CONFIG.SEARCH.MAX_RESULTS } = options;

  if (
    storageService.getStorageType() === 'SQLITE' &&
    NOTES_FEATURES.FULL_TEXT_SEARCH
  ) {
    // Sử dụng FTS search
    const sql = `
      SELECT n.*, 
             snippet(notes_fts, 1, '<mark>', '</mark>', '...', 20) as snippet,
             bm25(notes_fts) as rank
      FROM notes_fts
      JOIN notes n ON notes_fts.rowid = n.id
      WHERE notes_fts MATCH ? AND n.trashed = 0
      ORDER BY rank
      LIMIT ?
    `;

    const result = await storageService.executeSql(sql, [query, limit]);
    const notes = [];

    for (let i = 0; i < result.rows.length; i++) {
      const note = result.rows.item(i);
      notes.push(note);
    }

    return notes;
  } else {
    // Fallback: simple text search
    const allNotes = await getAllNotes();
    const searchResults = allNotes
      .filter(note => {
        const searchText = `${note.title} ${note.content}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .slice(0, limit);

    return searchResults;
  }
};

// ==================== TAG OPERATIONS ====================

/**
 * Tạo tag mới
 */
export const createTag = async (name, color = '#6B7280') => {
  if (storageService.getStorageType() === 'SQLITE') {
    const sql = 'INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)';
    const result = await storageService.executeSql(sql, [name, color]);
    return result.insertId;
  } else {
    const tags = (await storageService.getItem('tags')) || {};
    const tagId = Date.now().toString();
    tags[tagId] = {
      id: tagId,
      name,
      color,
      created_at: new Date().toISOString(),
    };
    await storageService.setItem('tags', tags);
    return tagId;
  }
};

/**
 * Lấy tất cả tags
 */
export const getAllTags = async () => {
  try {
    if (storageService.getStorageType() === 'SQLITE') {
      const sql = 'SELECT * FROM tags ORDER BY name';
      const result = await storageService.executeSql(sql);
      const tags = [];

      for (let i = 0; i < result.rows.length; i++) {
        tags.push(result.rows.item(i));
      }

      return tags;
    } else {
      const tags = (await storageService.getItem('tags')) || {};
      return Object.values(tags);
    }
  } catch (error) {
    console.error('getAllTags error:', error);
    return [];
  }
};

/**
 * Thêm tags vào note
 */
export const addTagsToNote = async (noteId, tagNames) => {
  if (storageService.getStorageType() === 'SQLITE') {
    for (const tagName of tagNames) {
      // Tạo tag nếu chưa tồn tại
      let tagId = await createTag(tagName);

      if (!tagId) {
        // Lấy existing tag
        const result = await storageService.executeSql(
          'SELECT id FROM tags WHERE name = ?',
          [tagName],
        );
        if (result.rows.length > 0) {
          tagId = result.rows.item(0).id;
        }
      }

      // Thêm vào note_tags
      if (tagId) {
        await storageService.executeSql(
          'INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)',
          [noteId, tagId],
        );
      }
    }
  }
};

/**
 * Cập nhật tags của note
 */
export const updateNoteTags = async (noteId, tagNames) => {
  if (storageService.getStorageType() === 'SQLITE') {
    // Xóa tất cả tags cũ
    await storageService.executeSql('DELETE FROM note_tags WHERE note_id = ?', [
      noteId,
    ]);

    // Thêm tags mới
    await addTagsToNote(noteId, tagNames);
  }
};

// ==================== VERSION OPERATIONS ====================

/**
 * Tạo version mới cho note
 */
export const createNoteVersion = async (noteId, title, content, version) => {
  if (storageService.getStorageType() === 'SQLITE') {
    const sql = `
      INSERT INTO note_versions (note_id, title, content, version, snapshot)
      VALUES (?, ?, ?, ?, ?)
    `;

    const snapshot = JSON.stringify({
      title,
      content,
      timestamp: new Date().toISOString(),
    });
    await storageService.executeSql(sql, [
      noteId,
      title,
      content,
      version,
      snapshot,
    ]);

    // Giữ chỉ số version gần nhất theo config
    await cleanupOldVersions(noteId);
  }
};

/**
 * Dọn dẹp versions cũ
 */
export const cleanupOldVersions = async noteId => {
  if (storageService.getStorageType() === 'SQLITE') {
    const sql = `
      DELETE FROM note_versions 
      WHERE note_id = ? AND id NOT IN (
        SELECT id FROM note_versions 
        WHERE note_id = ? 
        ORDER BY version DESC 
        LIMIT ?
      )
    `;

    await storageService.executeSql(sql, [
      noteId,
      noteId,
      NOTES_CONFIG.VERSION_LIMIT,
    ]);
  }
};

/**
 * Lấy history của note
 */
export const getNoteVersions = async noteId => {
  if (storageService.getStorageType() === 'SQLITE') {
    const sql =
      'SELECT * FROM note_versions WHERE note_id = ? ORDER BY version DESC';
    const result = await storageService.executeSql(sql, [noteId]);
    const versions = [];

    for (let i = 0; i < result.rows.length; i++) {
      const version = result.rows.item(i);
      if (version.snapshot) {
        version.snapshot = JSON.parse(version.snapshot);
      }
      versions.push(version);
    }

    return versions;
  } else {
    return [];
  }
};

// ==================== TEMPLATE OPERATIONS ====================

/**
 * Tạo note từ template
 */
export const createNoteFromTemplate = async (templateId, data = {}) => {
  const template = NOTES_CONFIG.TEMPLATES[templateId];
  if (!template) throw new Error('Template not found');

  const noteData = {
    title: interpolateTemplate(template.title, data),
    content: interpolateTemplate(template.content, data),
    tags: template.tags || [],
    template_id: templateId,
    ...data,
  };

  return await createNote(noteData);
};

/**
 * Interpolate template strings
 */
export const interpolateTemplate = (template, data) => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (key === 'date') {
      return new Date().toLocaleDateString('vi-VN');
    }
    return data[key] || match;
  });
};

// ==================== UTILITY METHODS ====================

/**
 * Lấy thống kê
 */
export const getStats = async () => {
  if (storageService.getStorageType() === 'SQLITE') {
    const queries = [
      'SELECT COUNT(*) as total FROM notes WHERE trashed = 0',
      'SELECT COUNT(*) as archived FROM notes WHERE archived = 1 AND trashed = 0',
      'SELECT COUNT(*) as trashed FROM notes WHERE trashed = 1',
      'SELECT COUNT(*) as tags FROM tags',
      'SELECT COUNT(*) as folders FROM folders',
    ];

    const results = await Promise.all(
      queries.map(sql => storageService.executeSql(sql)),
    );

    return {
      totalNotes: results[0].rows.item(0).total,
      archivedNotes: results[1].rows.item(0).archived,
      trashedNotes: results[2].rows.item(0).trashed,
      totalTags: results[3].rows.item(0).tags,
      totalFolders: results[4].rows.item(0).folders,
    };
  } else {
    const notesList = (await storageService.getItem('notes_list')) || [];
    const tags = (await storageService.getItem('tags')) || {};

    return {
      totalNotes: notesList.length,
      archivedNotes: 0,
      trashedNotes: 0,
      totalTags: Object.keys(tags).length,
      totalFolders: 0,
    };
  }
};

/**
 * Export data to JSON
 */
export const exportData = async () => {
  const data = {
    notes: await getAllNotes({
      includeArchived: true,
      includeTrashed: true,
    }),
    tags: await getAllTags(),
    exportDate: new Date().toISOString(),
    version: '1.0',
  };

  return JSON.stringify(data, null, 2);
};

/**
 * Import data from JSON
 */
export const importData = async (jsonData, options = { merge: true }) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    if (!options.merge) {
      // Clear existing data
      await clearAllData();
    }

    // Import tags first
    if (data.tags) {
      for (const tag of data.tags) {
        await createTag(tag.name, tag.color);
      }
    }

    // Import notes
    if (data.notes) {
      for (const note of data.notes) {
        const { id, created_at, updated_at, ...noteData } = note;
        await createNote(noteData);
      }
    }

    return { success: true, message: 'Import completed successfully' };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all data
 */
export const clearAllData = async () => {
  await storageService.clear();
  await initializeDefaultTags();
};

// ==================== CHECKLIST OPERATIONS ====================

/**
 * Add checklist item to note
 */
export const addChecklistItem = async (noteId, item) => {
  try {
    const note = await getNoteById(noteId);
    if (!note) return null;

    const newItem = {
      id: Date.now().toString(),
      text: item,
      completed: false,
    };

    // If note has checklist in metadata, update it
    const metadata = note.metadata || {};
    const checklist = metadata.checklist || [];
    const updatedChecklist = [...checklist, newItem];

    return await updateNote(noteId, {
      metadata: { ...metadata, checklist: updatedChecklist },
    });
  } catch (error) {
    console.error('NotesService - addChecklistItem error:', error);
    return null;
  }
};

/**
 * Toggle checklist item completion
 */
export const toggleChecklistItem = async (noteId, itemId) => {
  try {
    const note = await getNoteById(noteId);
    if (!note) return null;

    const metadata = note.metadata || {};
    const checklist = metadata.checklist || [];

    const updatedChecklist = checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );

    return await updateNote(noteId, {
      metadata: { ...metadata, checklist: updatedChecklist },
    });
  } catch (error) {
    console.error('NotesService - toggleChecklistItem error:', error);
    return null;
  }
};

// Getter for initialized state
export const getInitialized = () => initialized;

// Export an object with all functions for backward compatibility
const notesService = {
  initialize,
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  permanentDeleteNote,
  restoreNote,
  getAllNotes,
  searchNotes,
  createTag,
  getAllTags,
  addTagsToNote,
  updateNoteTags,
  createNoteVersion,
  cleanupOldVersions,
  getNoteVersions,
  createNoteFromTemplate,
  interpolateTemplate,
  getStats,
  exportData,
  importData,
  clearAllData,
  addChecklistItem,
  toggleChecklistItem,
  get initialized() {
    return initialized;
  },
  storage: storageService,
};

export default notesService;
