# Notes Module - Hệ Thống Ghi Chú & Sắp Xếp Ý Tưởng

## Tổng Quan

Notes Module là một hệ thống ghi chú mạnh mẽ và linh hoạt, được thiết kế để giúp người dùng capture, tổ chức và quản lý ý tưởng một cách hiệu quả. Module hoạt động hoàn toàn offline với khả năng backup và export dữ liệu.

## Tính Năng Chính

### 🚪 Quick Capture

- **Ghi chú nhanh**: Modal slide-up với animation mượt mà (240ms)
- **Modes**: Text, Checklist, Voice notes (future)
- **Tags**: Thêm và quản lý tags dễ dàng
- **Autofocus**: Tự động focus vào title input
- **Keyboard shortcuts**: Enter để chuyển field

### 🏠 Notes Home

- **Views**: Toggle giữa List và Grid view
- **Search**: Full-text search với live suggestions
- **Filters**: All, Favorites, Today, Unsorted, Templates
- **Sorting**: By date, title, priority với animation
- **Selection mode**: Bulk operations (delete, archive, pin)
- **Swipe actions**: Quick access đến các actions

### ✏️ Note Editor

- **Rich Text**: Markdown support với live preview
- **Autosave**: Tự động lưu sau 2 giây
- **Undo/Redo**: 10 levels version history
- **Toolbar**: Bold, Italic, Headers, Lists, Checkboxes
- **Word count**: Real-time counting
- **Metadata**: Created/updated timestamps

### 🏷️ Tags & Organization

- **Color-coded tags**: Mỗi tag có màu riêng
- **Tag suggestions**: Auto-complete khi gõ
- **Bulk tag operations**: Thêm/xóa tags hàng loạt
- **Smart filters**: Filter theo tags, folders
- **Tag cloud**: Visual tag explorer

### 🗂️ Storage & Backup

- **Dual Storage**: SQLite (recommended) hoặc AsyncStorage
- **Offline-first**: Hoạt động 100% offline
- **Auto backup**: Hàng ngày với retention policy
- **Export/Import**: JSON format với encryption option
- **Full-text search**: FTS table cho performance

## Cài Đặt & Cấu Hình

### Dependencies Required

```bash
npm install react-native-sqlite-storage
npm install @react-native-async-storage/async-storage
npm install react-navigation
npm install react-native-vector-icons
```

### Khởi Tạo Service

```javascript
import { notesService } from './src/services/notes/notesService';

// Initialize trong App.js hoặc component chính
await notesService.initialize();
```

### Cấu Hình Storage

Trong `src/config/notes/notesConfig.js`:

```javascript
export const NOTES_CONFIG = {
  // Chọn storage engine
  STORAGE_TYPE: 'SQLITE', // 'SQLITE' | 'ASYNCSTORAGE'

  // Performance settings
  MAX_NOTES: 10000,
  AUTOSAVE_DELAY: 2000, // 2 seconds

  // Animation durations
  ANIMATIONS: {
    MODAL_SLIDE_UP: 240,
    CARD_EXPAND: 300,
    DRAG_LIFT: 160,
  },
};
```

## Cách Sử Dụng

### Basic CRUD Operations

```javascript
import { notesService } from './services/notes/notesService';

// Tạo note mới
const note = await notesService.createNote({
  title: 'Tiêu đề mới',
  content: 'Nội dung ghi chú...',
  tags: ['work', 'important'],
});

// Lấy tất cả notes
const notes = await notesService.getAllNotes({
  sortBy: 'updated_at',
  sortOrder: 'DESC',
});

// Tìm kiếm
const results = await notesService.searchNotes('từ khóa');

// Cập nhật note
await notesService.updateNote(noteId, {
  title: 'Tiêu đề mới',
  content: 'Nội dung đã chỉnh sửa',
});

// Xóa note (soft delete)
await notesService.deleteNote(noteId);
```

### Template Usage

```javascript
// Tạo từ template
const note = await notesService.createNoteFromTemplate('meeting', {
  date: new Date().toLocaleDateString(),
  topic: 'Sprint Planning',
});
```

### Export/Import

```javascript
// Export toàn bộ data
const jsonData = await notesService.exportData();

// Import data
const result = await notesService.importData(jsonData, { merge: true });
```

## Database Schema (SQLite)

### Notes Table

```sql
CREATE TABLE notes (
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
  due_date DATETIME,
  reminder_date DATETIME,
  color TEXT,
  template_id TEXT,
  metadata TEXT
);
```

### Tags Table

```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Full-Text Search

```sql
CREATE VIRTUAL TABLE notes_fts USING fts5(
  title,
  content,
  tags,
  content='notes',
  content_rowid='id'
);
```

## Animation Specifications

### Modal Animations

- **Slide-up**: `translateY: 300px → 0px` trong 240ms với `easeOutCubic`
- **Fade-in**: `opacity: 0 → 1` song song với slide
- **Scale**: `scale: 0.8 → 1` với spring tension: 50, friction: 8

### Card Animations

- **Press**: `scale: 1 → 0.98` trong 150ms
- **Expand**: Spring animation với damping: 14, stiffness: 120
- **Stagger**: Delay 150ms cho mỗi card

### Drag & Drop (Future)

- **Lift**: `scale: 1 → 1.04` + shadow increase
- **Drop**: Bounce animation 160ms

## Sound Effects

Located in `assets/sounds/`:

- `save_tick.mp3` (120ms, 0.6 volume) - Khi lưu thành công
- `error_buzz.mp3` (400ms, 0.6 volume) - Khi có lỗi
- `click_soft.mp3` (100ms, 0.4 volume) - UI interactions

## Testing

### Manual Testing Checklist

- [ ] Quick capture modal hoạt động với animation smooth
- [ ] Search results hiện trong <300ms
- [ ] Autosave hoạt động sau 2 giây
- [ ] Export/Import roundtrip không mất data
- [ ] Full-text search tìm đúng kết quả
- [ ] Tags filter hoạt động chính xác
- [ ] View toggle animation mượt mà

### Performance Benchmarks

- **Note creation**: < 200ms
- **Search query**: < 300ms cho 5k notes
- **List rendering**: < 100ms cho 50 items
- **Export 1k notes**: < 2 seconds

## Troubleshooting

### Common Issues

**1. SQLite initialization failed**

```javascript
// Fallback sẽ tự động chuyển sang AsyncStorage
// Check logs: "🔄 Falling back to AsyncStorage..."
```

**2. Search không hoạt động**

```javascript
// Kiểm tra FTS table
const info = storageService.getStorageInfo();
console.log(info); // Check if SQLite connected
```

**3. Notes không tự động save**

```javascript
// Check autosave delay setting
console.log(NOTES_CONFIG.AUTOSAVE_DELAY); // Should be 2000ms
```

## Roadmap

### Phase 2 Features

- [ ] Kanban Board với drag & drop
- [ ] Voice notes với speech-to-text
- [ ] Calendar/Timeline view
- [ ] Mindmap visualization
- [ ] Real-time collaboration
- [ ] Encrypted sync với cloud

### Performance Improvements

- [ ] Virtual scrolling cho large lists
- [ ] Image compression cho attachments
- [ ] Background sync optimization
- [ ] Memory usage optimization

## API Reference

### NotesService Methods

```javascript
// Lifecycle
await notesService.initialize();
await notesService.clearAllData();

// CRUD
await notesService.createNote(data);
await notesService.getNoteById(id);
await notesService.updateNote(id, updates);
await notesService.deleteNote(id);
await notesService.restoreNote(id);

// Query
await notesService.getAllNotes(options);
await notesService.searchNotes(query, options);

// Tags
await notesService.createTag(name, color);
await notesService.getAllTags();
await notesService.addTagsToNote(noteId, tagNames);

// Templates
await notesService.createNoteFromTemplate(templateId, data);

// Backup
await notesService.exportData();
await notesService.importData(jsonData, options);
await notesService.getStats();
```

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow coding standards và animation specs
4. Add tests for new features
5. Submit pull request

---

**Created with ❤️ for ZenHub App**
