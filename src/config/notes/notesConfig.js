// Notes Module Configuration
export const NOTES_CONFIG = {
  // Database Settings
  DB_NAME: 'notes.db',
  DB_VERSION: 1,

  // Storage Options
  STORAGE_TYPE: 'SQLITE', // 'SQLITE' | 'ASYNCSTORAGE'

  // Performance Limits
  MAX_NOTES: 10000,
  MAX_CONTENT_LENGTH: 50000,
  MAX_ATTACHMENTS_PER_NOTE: 10,
  MAX_ATTACHMENT_SIZE: 50 * 1024 * 1024, // 50MB

  // Autosave Settings
  AUTOSAVE_DELAY: 2000, // 2 seconds
  VERSION_LIMIT: 10, // Keep last 10 versions

  // Animation Durations (milliseconds)
  ANIMATIONS: {
    MODAL_SLIDE_UP: 240,
    CARD_EXPAND: 300,
    DRAG_LIFT: 160,
    CHECKLIST_TOGGLE: 120,
    UNDO_SNACKBAR: 4000,
    SHIMMER_LOOP: 600,
  },

  // Animation Easing
  EASING: {
    MODAL: 'easeOutCubic',
    CARD_SPRING: { damping: 14, stiffness: 120 },
    DRAG_SCALE: 1.04,
  },

  // Sound Settings
  SOUNDS: {
    SAVE_TICK: {
      file: 'save_tick.mp3',
      volume: 0.6,
      duration: 120,
    },
    ERROR_BUZZ: {
      file: 'error_buzz.mp3',
      volume: 0.6,
      duration: 400,
    },
    NOTIFICATION_CHIME: {
      file: 'notif_chime.mp3',
      volume: 0.8,
      duration: 650,
    },
    CLICK_SOFT: {
      file: 'click_soft.mp3',
      volume: 0.4,
      duration: 100,
    },
  },

  // Default Templates
  TEMPLATES: {
    QUICK_NOTE: {
      id: 'quick_note',
      title: 'Ghi Chú Nhanh',
      content: '',
      tags: [],
    },
    MEETING: {
      id: 'meeting',
      title: 'Cuộc Họp - {date}',
      content: `# Cuộc Họp
      
**Thời gian:** {date}
**Người tham gia:** 

## Nội dung chính
- 

## Quyết định
- 

## Việc cần làm
- [ ] `,
      tags: ['cuộc-họp'],
    },
    IDEA: {
      id: 'idea',
      title: 'Ý Tưởng - {title}',
      content: `# Ý Tưởng

## Mô tả
{description}

## Lợi ích
- 

## Thách thức
- 

## Bước tiếp theo
- [ ] `,
      tags: ['ý-tưởng'],
    },
    BRAINSTORM: {
      id: 'brainstorm',
      title: 'Brainstorm - {topic}',
      content: `# Brainstorm: {topic}

## Câu hỏi chính
{question}

## Ý tưởng
- 
- 
- 

## Ý tưởng hay nhất
1. 

## Kế hoạch thực hiện
- [ ] `,
      tags: ['brainstorm'],
    },
    TODO: {
      id: 'todo',
      title: 'Danh Sách Việc Cần Làm',
      content: `# Việc Cần Làm

## Ưu tiên cao
- [ ] 
- [ ] 

## Ưu tiên trung bình
- [ ] 
- [ ] 

## Ưu tiên thấp
- [ ] 
- [ ] `,
      tags: ['todo'],
    },
  },

  // Default Tags
  DEFAULT_TAGS: [
    { name: 'quan-trọng', color: '#EF4444' },
    { name: 'công-việc', color: '#3B82F6' },
    { name: 'cá-nhân', color: '#10B981' },
    { name: 'ý-tưởng', color: '#F59E0B' },
    { name: 'todo', color: '#8B5CF6' },
    { name: 'cuộc-họp', color: '#EC4899' },
    { name: 'dự-án', color: '#06B6D4' },
    { name: 'học-tập', color: '#84CC16' },
  ],

  // Kanban Board Columns
  BOARD_COLUMNS: [
    { id: 'inbox', title: 'Hộp Thư', color: '#6B7280' },
    { id: 'to_explore', title: 'Cần Khám Phá', color: '#F59E0B' },
    { id: 'in_progress', title: 'Đang Thực Hiện', color: '#3B82F6' },
    { id: 'done', title: 'Hoàn Thành', color: '#10B981' },
  ],

  // Search Settings
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_RESULTS: 50,
    DEBOUNCE_DELAY: 300,
  },

  // Backup Settings
  BACKUP: {
    AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    MAX_BACKUP_FILES: 7, // Keep 7 days
    BACKUP_PATH: 'notes_backup',
  },

  // Notification Settings
  NOTIFICATIONS: {
    CHANNEL_ID: 'notes_reminders',
    CHANNEL_NAME: 'Nhắc Nhở Ghi Chú',
    DEFAULT_SNOOZE_MINUTES: [5, 15, 30, 60],
  },

  // UI Settings
  UI: {
    CARD_BORDER_RADIUS: 12,
    MODAL_BORDER_RADIUS: 20,
    LIST_ITEM_HEIGHT: 80,
    GRID_ITEM_HEIGHT: 120,
    FAB_SIZE: 56,
    TAG_HEIGHT: 24,
  },

  // Colors
  COLORS: {
    PRIMARY: '#667eea',
    SECONDARY: '#764ba2',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
    BACKGROUND: '#F8FAFC',
    SURFACE: '#FFFFFF',
    TEXT_PRIMARY: '#1F2937',
    TEXT_SECONDARY: '#6B7280',
    BORDER: '#E5E7EB',
    SHADOW: 'rgba(0, 0, 0, 0.1)',
  },

  // Text Sizes
  TEXT_SIZES: {
    XS: 12,
    SM: 14,
    BASE: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
};

// Feature Flags
export const NOTES_FEATURES = {
  VOICE_NOTES: true,
  RICH_TEXT_EDITOR: true,
  MARKDOWN_SUPPORT: true,
  KANBAN_BOARD: true,
  MINDMAP_VIEW: false, // Future feature
  CALENDAR_VIEW: true,
  TIMELINE_VIEW: true,
  BACKLINKS: true,
  FULL_TEXT_SEARCH: false, // Disabled due to FTS5 not supported in React Native SQLite
  LOCAL_NOTIFICATIONS: true,
  SOUND_EFFECTS: true,
  ENCRYPTION: true,
  AUTO_BACKUP: true,
  TEMPLATES: true,
  TAGS: true,
  FOLDERS: true,
  ATTACHMENTS: true,
  COLLABORATION: false, // Future feature
};

export default NOTES_CONFIG;
