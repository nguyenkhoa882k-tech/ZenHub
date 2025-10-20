import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';

// Enable SQLite debug mode in development
SQLite.DEBUG(__DEV__);
SQLite.enablePromise(true);

/**
 * Storage Service với adapter pattern hỗ trợ cả SQLite và AsyncStorage
 * Tự động chọn storage engine dựa trên config
 */
class StorageService {
  constructor() {
    this.storageType = NOTES_CONFIG.STORAGE_TYPE;
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Khởi tạo storage engine
   */
  async initialize() {
    try {
      if (this.storageType === 'SQLITE') {
        await this.initSQLite();
      } else {
        await this.initAsyncStorage();
      }
      this.isInitialized = true;
      console.log(`✅ Storage initialized: ${this.storageType}`);
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
      // Fallback to AsyncStorage
      if (this.storageType === 'SQLITE') {
        console.log('🔄 Falling back to AsyncStorage...');
        this.storageType = 'ASYNCSTORAGE';
        await this.initAsyncStorage();
        this.isInitialized = true;
      }
    }
  }

  /**
   * Khởi tạo SQLite database
   */
  async initSQLite() {
    this.db = await SQLite.openDatabase({
      name: NOTES_CONFIG.DB_NAME,
      location: 'default',
      createFromLocation: '~www/notes.db',
    });

    // Tạo các bảng
    await this.createTables();

    // Enable foreign keys
    await this.db.executeSql('PRAGMA foreign_keys = ON;');

    // Create FTS virtual table for full-text search
    await this.createFTSTable();
  }

  /**
   * Khởi tạo AsyncStorage (không cần setup đặc biệt)
   */
  async initAsyncStorage() {
    // AsyncStorage không cần khởi tạo đặc biệt
    // Chỉ cần kiểm tra quyền truy cập
    await AsyncStorage.getItem('test');
  }

  /**
   * Tạo các bảng SQLite
   */
  async createTables() {
    const tables = [
      // Bảng notes chính
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        folder_id INTEGER,
        pinned INTEGER DEFAULT 0,
        archived INTEGER DEFAULT 0,
        trashed INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 0,
        version INTEGER DEFAULT 1,
        board_column TEXT DEFAULT 'inbox',
        board_position INTEGER DEFAULT 0,
        due_date DATETIME,
        reminder_date DATETIME,
        color TEXT,
        template_id TEXT,
        metadata TEXT
      )`,

      // Bảng tags
      `CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#6B7280',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Bảng liên kết note-tag (many-to-many)
      `CREATE TABLE IF NOT EXISTS note_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
        UNIQUE(note_id, tag_id)
      )`,

      // Bảng attachments
      `CREATE TABLE IF NOT EXISTS attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        filename TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER DEFAULT 0,
        mime_type TEXT,
        thumbnail_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
      )`,

      // Bảng folders
      `CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        color TEXT DEFAULT '#6B7280',
        icon TEXT DEFAULT 'folder',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES folders (id) ON DELETE CASCADE
      )`,

      // Bảng versions (lưu lịch sử chỉnh sửa)
      `CREATE TABLE IF NOT EXISTS note_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        version INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        snapshot TEXT,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
      )`,

      // Bảng backlinks
      `CREATE TABLE IF NOT EXISTS note_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_note_id INTEGER NOT NULL,
        target_note_id INTEGER NOT NULL,
        link_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (target_note_id) REFERENCES notes (id) ON DELETE CASCADE,
        UNIQUE(source_note_id, target_note_id)
      )`,

      // Bảng boards configuration
      `CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const table of tables) {
      await this.db.executeSql(table);
    }

    // Tạo indexes cho performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_notes_folder_id ON notes(folder_id)',
      'CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned)',
      'CREATE INDEX IF NOT EXISTS idx_notes_trashed ON notes(trashed)',
      'CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id)',
      'CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id)',
      'CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON attachments(note_id)',
    ];

    for (const index of indexes) {
      await this.db.executeSql(index);
    }
  }

  /**
   * Tạo FTS table cho full-text search
   */
  async createFTSTable() {
    const ftsTable = `
      CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
        title, 
        content, 
        tags,
        content='notes', 
        content_rowid='id'
      )
    `;

    await this.db.executeSql(ftsTable);

    // Trigger để sync data với FTS table
    const triggers = [
      `CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON notes 
       BEGIN
         INSERT INTO notes_fts(rowid, title, content) 
         VALUES (new.id, new.title, new.content);
       END`,

      `CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON notes 
       BEGIN
         UPDATE notes_fts SET title = new.title, content = new.content 
         WHERE rowid = new.id;
       END`,

      `CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON notes 
       BEGIN
         DELETE FROM notes_fts WHERE rowid = old.id;
       END`,
    ];

    for (const trigger of triggers) {
      await this.db.executeSql(trigger);
    }
  }

  /**
   * Generic method để execute SQL query
   */
  async executeSql(sql, params = []) {
    if (this.storageType !== 'SQLITE') {
      throw new Error('SQL operations only available with SQLite storage');
    }

    try {
      const [results] = await this.db.executeSql(sql, params);
      return results;
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  /**
   * Get item from storage (works with both SQLite and AsyncStorage)
   */
  async getItem(key) {
    if (this.storageType === 'SQLITE') {
      // For simple key-value storage in SQLite
      const sql = 'SELECT value FROM key_value_store WHERE key = ?';
      const results = await this.executeSql(sql, [key]);
      return results.rows.length > 0
        ? JSON.parse(results.rows.item(0).value)
        : null;
    } else {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  }

  /**
   * Set item to storage
   */
  async setItem(key, value) {
    const jsonValue = JSON.stringify(value);

    if (this.storageType === 'SQLITE') {
      const sql = `INSERT OR REPLACE INTO key_value_store (key, value) VALUES (?, ?)`;
      await this.executeSql(sql, [key, jsonValue]);
    } else {
      await AsyncStorage.setItem(key, jsonValue);
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key) {
    if (this.storageType === 'SQLITE') {
      const sql = 'DELETE FROM key_value_store WHERE key = ?';
      await this.executeSql(sql, [key]);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }

  /**
   * Clear all data
   */
  async clear() {
    if (this.storageType === 'SQLITE') {
      // Xóa tất cả dữ liệu trong database
      const tables = [
        'notes',
        'tags',
        'note_tags',
        'attachments',
        'folders',
        'note_versions',
        'note_links',
        'boards',
      ];
      for (const table of tables) {
        await this.executeSql(`DELETE FROM ${table}`);
      }
      await this.executeSql('DELETE FROM notes_fts');
    } else {
      await AsyncStorage.clear();
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys() {
    if (this.storageType === 'SQLITE') {
      const results = await this.executeSql('SELECT key FROM key_value_store');
      return Array.from(
        { length: results.rows.length },
        (_, i) => results.rows.item(i).key,
      );
    } else {
      return await AsyncStorage.getAllKeys();
    }
  }

  /**
   * Transaction support for SQLite
   */
  async transaction(callback) {
    if (this.storageType !== 'SQLITE') {
      // For AsyncStorage, just execute the callback
      return await callback(this);
    }

    return new Promise((resolve, reject) => {
      this.db.transaction(
        async tx => {
          try {
            const result = await callback({
              executeSql: (sql, params = []) => {
                return new Promise((txResolve, txReject) => {
                  tx.executeSql(
                    sql,
                    params,
                    (_, results) => txResolve(results),
                    (_, error) => txReject(error),
                  );
                });
              },
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        error => reject(error),
      );
    });
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.storageType === 'SQLITE' && this.db) {
      await this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }

  /**
   * Get storage info
   */
  getStorageInfo() {
    return {
      type: this.storageType,
      initialized: this.isInitialized,
      database: this.db ? 'Connected' : 'Not connected',
    };
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
