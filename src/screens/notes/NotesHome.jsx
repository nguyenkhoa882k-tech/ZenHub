import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from '@react-native-vector-icons/ionicons';
import { notesService } from '../../services/notes/notesService';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';
import NoteCard from '../../components/notes/NoteCard';
import QuickCaptureModal from '../../components/notes/QuickCaptureModal';

const { width } = Dimensions.get('window');

const NotesHome = () => {
  const navigation = useNavigation();

  // State management
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  // Animation refs
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  const filterBarAnim = useRef(new Animated.Value(0)).current;

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'Tất Cả', icon: 'document-text-outline' },
    { key: 'favorites', label: 'Yêu Thích', icon: 'heart-outline' },
    { key: 'today', label: 'Hôm Nay', icon: 'today-outline' },
    { key: 'unsorted', label: 'Chưa Phân Loại', icon: 'file-tray-outline' },
    { key: 'templates', label: 'Mẫu', icon: 'copy-outline' },
  ];

  // Sort options
  const sortOptions = [
    { key: 'updated_at', label: 'Chỉnh Sửa Gần Nhất', icon: 'time-outline' },
    { key: 'created_at', label: 'Tạo Mới Nhất', icon: 'add-circle-outline' },
    { key: 'title', label: 'Tên A-Z', icon: 'text-outline' },
    { key: 'priority', label: 'Ưu Tiên', icon: 'flag-outline' },
  ];

  // Initialize service and load data
  useFocusEffect(
    useCallback(() => {
      initializeAndLoadNotes();
      animateIn();

      return () => {
        // Cleanup animations
        searchBarAnim.setValue(0);
        filterBarAnim.setValue(0);
      };
    }, []),
  );

  const initializeAndLoadNotes = async () => {
    try {
      setLoading(true);
      await notesService.initialize();
      await loadNotes();
    } catch (error) {
      console.error('Error initializing notes:', error);
      Alert.alert('Lỗi', 'Không thể tải ghi chú. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const allNotes = await notesService.getAllNotes({
        sortBy,
        sortOrder,
        includeArchived: selectedFilter === 'archived',
      });

      setNotes(allNotes);
      applyFilters(allNotes, selectedFilter, searchQuery);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const applyFilters = (notesList, filter, search) => {
    let filtered = [...notesList];

    // Apply filter
    switch (filter) {
      case 'favorites':
        filtered = filtered.filter(note => note.pinned === 1);
        break;
      case 'today':
        const today = new Date().toDateString();
        filtered = filtered.filter(
          note =>
            new Date(note.created_at).toDateString() === today ||
            new Date(note.updated_at).toDateString() === today,
        );
        break;
      case 'unsorted':
        filtered = filtered.filter(
          note => !note.folder_id && (!note.tags || note.tags.length === 0),
        );
        break;
      case 'templates':
        filtered = filtered.filter(note => note.template_id);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower) ||
          (note.tags &&
            note.tags.some(tag =>
              tag.name.toLowerCase().includes(searchLower),
            )),
      );
    }

    setFilteredNotes(filtered);
  };

  // Animation functions
  const animateIn = () => {
    Animated.parallel([
      Animated.spring(searchBarAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(filterBarAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateFAB = show => {
    Animated.spring(fabAnim, {
      toValue: show ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // Event handlers
  const handleSearch = useCallback(
    query => {
      setSearchQuery(query);
      applyFilters(notes, selectedFilter, query);
    },
    [notes, selectedFilter],
  );

  const handleFilterChange = filter => {
    setSelectedFilter(filter);
    applyFilters(notes, filter, searchQuery);

    // Animate filter change
    Animated.sequence([
      Animated.timing(filterBarAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(filterBarAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSortChange = sortKey => {
    const newOrder =
      sortKey === sortBy && sortOrder === 'DESC' ? 'ASC' : 'DESC';
    setSortBy(sortKey);
    setSortOrder(newOrder);
    setShowSortMenu(false);

    // Reload with new sorting
    loadNotes();
  };

  const handleViewModeToggle = () => {
    setViewMode(prev => (prev === 'list' ? 'grid' : 'list'));

    // Animate view change
    Animated.sequence([
      Animated.timing(fabAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNotePress = note => {
    if (selectionMode) {
      toggleNoteSelection(note.id);
    } else {
      navigation.navigate('NoteDetail', { noteId: note.id });
    }
  };

  const handleNoteLongPress = note => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedNotes([note.id]);
    }
  };

  const toggleNoteSelection = noteId => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId],
    );
  };

  const handleBulkAction = async action => {
    try {
      switch (action) {
        case 'delete':
          for (const noteId of selectedNotes) {
            await notesService.deleteNote(noteId);
          }
          break;
        case 'archive':
          for (const noteId of selectedNotes) {
            await notesService.updateNote(noteId, { archived: 1 });
          }
          break;
        case 'pin':
          for (const noteId of selectedNotes) {
            await notesService.updateNote(noteId, { pinned: 1 });
          }
          break;
      }

      setSelectionMode(false);
      setSelectedNotes([]);
      await loadNotes();
    } catch (error) {
      console.error('Bulk action error:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác. Vui lòng thử lại.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const handleQuickCaptureComplete = async () => {
    setShowQuickCapture(false);
    await loadNotes();
  };

  // Render functions
  const renderSearchBar = () => (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          opacity: searchBarAnim,
          transform: [
            {
              translateY: searchBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.searchBar}>
        <Icon
          name="search-outline"
          size={20}
          color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm ghi chú..."
          placeholderTextColor={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon
              name="close-circle"
              size={20}
              color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowSortMenu(true)}
        >
          <Icon
            name="funnel-outline"
            size={20}
            color={NOTES_CONFIG.COLORS.PRIMARY}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewModeToggle}
        >
          <Icon
            name={viewMode === 'list' ? 'grid-outline' : 'list-outline'}
            size={20}
            color={NOTES_CONFIG.COLORS.PRIMARY}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderFilterBar = () => (
    <Animated.View
      style={[
        styles.filterContainer,
        {
          opacity: filterBarAnim,
          transform: [
            {
              translateX: filterBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-width, 0],
              }),
            },
          ],
        },
      ]}
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filterOptions}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedFilter === item.key && styles.filterPillActive,
            ]}
            onPress={() => handleFilterChange(item.key)}
          >
            <Icon
              name={item.icon}
              size={16}
              color={
                selectedFilter === item.key
                  ? '#FFFFFF'
                  : NOTES_CONFIG.COLORS.PRIMARY
              }
            />
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === item.key && styles.filterPillTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </Animated.View>
  );

  const renderNoteItem = ({ item, index }) => (
    <NoteCard
      note={item}
      viewMode={viewMode}
      isSelected={selectedNotes.includes(item.id)}
      selectionMode={selectionMode}
      onPress={() => handleNotePress(item)}
      onLongPress={() => handleNoteLongPress(item)}
      style={[
        viewMode === 'grid' && styles.gridItem,
        {
          marginBottom: 12,
          opacity: 1,
        },
      ]}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="document-text-outline"
        size={64}
        color={NOTES_CONFIG.COLORS.TEXT_SECONDARY}
      />
      <Text style={styles.emptyTitle}>Chưa có ghi chú nào</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Không tìm thấy ghi chú phù hợp'
          : 'Bắt đầu tạo ghi chú đầu tiên của bạn'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => setShowQuickCapture(true)}
        >
          <Text style={styles.emptyButtonText}>Tạo Ghi Chú Mới</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSortMenu = () => (
    <Modal
      visible={showSortMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortMenu(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSortMenu(false)}
      >
        <View style={styles.sortMenu}>
          <Text style={styles.sortMenuTitle}>Sắp Xếp Theo</Text>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortMenuItem,
                sortBy === option.key && styles.sortMenuItemActive,
              ]}
              onPress={() => handleSortChange(option.key)}
            >
              <Icon
                name={option.icon}
                size={20}
                color={
                  sortBy === option.key
                    ? NOTES_CONFIG.COLORS.PRIMARY
                    : NOTES_CONFIG.COLORS.TEXT_SECONDARY
                }
              />
              <Text
                style={[
                  styles.sortMenuItemText,
                  sortBy === option.key && styles.sortMenuItemTextActive,
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.key && (
                <Icon
                  name={sortOrder === 'DESC' ? 'chevron-down' : 'chevron-up'}
                  size={16}
                  color={NOTES_CONFIG.COLORS.PRIMARY}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderSelectionBar = () =>
    selectionMode && (
      <View style={styles.selectionBar}>
        <TouchableOpacity
          onPress={() => {
            setSelectionMode(false);
            setSelectedNotes([]);
          }}
        >
          <Icon
            name="close"
            size={24}
            color={NOTES_CONFIG.COLORS.TEXT_PRIMARY}
          />
        </TouchableOpacity>

        <Text style={styles.selectionCount}>
          {selectedNotes.length} đã chọn
        </Text>

        <View style={styles.selectionActions}>
          <TouchableOpacity
            style={styles.selectionAction}
            onPress={() => handleBulkAction('pin')}
          >
            <Icon
              name="bookmark-outline"
              size={24}
              color={NOTES_CONFIG.COLORS.WARNING}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectionAction}
            onPress={() => handleBulkAction('archive')}
          >
            <Icon
              name="archive-outline"
              size={24}
              color={NOTES_CONFIG.COLORS.INFO}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectionAction}
            onPress={() => handleBulkAction('delete')}
          >
            <Icon
              name="trash-outline"
              size={24}
              color={NOTES_CONFIG.COLORS.ERROR}
            />
          </TouchableOpacity>
        </View>
      </View>
    );

  const renderFAB = () => (
    <Animated.View
      style={[
        styles.fab,
        {
          opacity: fabAnim,
          transform: [
            {
              scale: fabAnim,
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => setShowQuickCapture(true)}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderSelectionBar()}
      {renderSearchBar()}
      {renderFilterBar()}

      <FlatList
        data={filteredNotes}
        renderItem={renderNoteItem}
        keyExtractor={item => item.id.toString()}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={[
          styles.listContainer,
          filteredNotes.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[NOTES_CONFIG.COLORS.PRIMARY]}
            tintColor={NOTES_CONFIG.COLORS.PRIMARY}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        onScroll={event => {
          const scrollY = event.nativeEvent.contentOffset.y;
          animateFAB(scrollY < 100);
        }}
        scrollEventThrottle={16}
      />

      {renderFAB()}
      {renderSortMenu()}

      <QuickCaptureModal
        visible={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        onComplete={handleQuickCaptureComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  filterContainer: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: NOTES_CONFIG.COLORS.BORDER,
  },
  filterList: {
    paddingHorizontal: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
  },
  filterPillActive: {
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
    borderColor: NOTES_CONFIG.COLORS.PRIMARY,
  },
  filterPillText: {
    marginLeft: 4,
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.PRIMARY,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  gridItem: {
    width: (width - 48) / 2,
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.LG,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortMenu: {
    backgroundColor: NOTES_CONFIG.COLORS.SURFACE,
    borderRadius: 12,
    padding: 16,
    margin: 32,
    minWidth: 200,
  },
  sortMenuTitle: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.LG,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  sortMenuItemActive: {
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  sortMenuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
  },
  sortMenuItemTextActive: {
    color: NOTES_CONFIG.COLORS.PRIMARY,
    fontWeight: '500',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: NOTES_CONFIG.COLORS.INFO,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionCount: {
    flex: 1,
    marginLeft: 16,
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  selectionAction: {
    marginLeft: 16,
    padding: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fabButton: {
    width: NOTES_CONFIG.UI.FAB_SIZE,
    height: NOTES_CONFIG.UI.FAB_SIZE,
    borderRadius: NOTES_CONFIG.UI.FAB_SIZE / 2,
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default NotesHome;
