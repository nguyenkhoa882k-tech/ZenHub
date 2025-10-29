import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { env } from '../config/env';
import {
  fetchWallpapers,
  searchWallpapers,
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  WALLPAPER_CATEGORIES,
} from '../services/wallpaperService';
import WallpaperCard from '../components/wallpaper/WallpaperCard';
import CategorySelector from '../components/wallpaper/CategorySelector';
import SearchBar from '../components/wallpaper/SearchBar';
import WallpaperDetailModal from '../components/wallpaper/WallpaperDetailModal';

const TABS = {
  EXPLORE: 'explore',
  FAVORITES: 'favorites',
};

const WallpaperScreen = () => {
  // State management
  const [activeTab, setActiveTab] = useState(TABS.EXPLORE);
  const [wallpapers, setWallpapers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    WALLPAPER_CATEGORIES[0],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favoriteStatus, setFavoriteStatus] = useState({});

  // Load initial data
  useEffect(() => {
    loadWallpapers();
    loadFavorites();
  }, [selectedCategory]);

  // Load wallpapers
  const loadWallpapers = async (pageNum = 1, refresh = false) => {
    if (loading && !refresh) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let result;
      if (searchMode && searchQuery) {
        result = await searchWallpapers(searchQuery, pageNum);
        const newWallpapers = result.results;

        if (pageNum === 1) {
          setWallpapers(newWallpapers);
        } else {
          setWallpapers(prev => [...prev, ...newWallpapers]);
        }

        setHasMore(pageNum < result.totalPages);
      } else {
        const newWallpapers = await fetchWallpapers(
          selectedCategory.query,
          pageNum,
        );

        if (pageNum === 1) {
          setWallpapers(newWallpapers);
        } else {
          setWallpapers(prev => [...prev, ...newWallpapers]);
        }

        setHasMore(newWallpapers.length === 30); // Assume more if we got full page
      }

      setPage(pageNum);

      // Load favorite status for new wallpapers
      await loadFavoriteStatus();
    } catch (error) {
      console.error('Error loading wallpapers:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải hình nền. Vui lòng kiểm tra kết nối mạng.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load favorites
  const loadFavorites = async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Load favorite status for all wallpapers
  const loadFavoriteStatus = async () => {
    try {
      const status = {};
      for (const wallpaper of wallpapers) {
        status[wallpaper.id] = await isFavorite(wallpaper.id);
      }
      setFavoriteStatus(status);
    } catch (error) {
      console.error('Error loading favorite status:', error);
    }
  };

  // Handle search
  const handleSearch = useCallback(query => {
    setSearchQuery(query);
    setSearchMode(true);
    setPage(1);
    setHasMore(true);
    loadWallpapers(1, true);
  }, []);

  // Handle category change
  const handleCategoryChange = category => {
    setSelectedCategory(category);
    setSearchMode(false);
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async wallpaper => {
    try {
      const isCurrentlyFavorite = favoriteStatus[wallpaper.id];

      if (isCurrentlyFavorite) {
        await removeFromFavorites(wallpaper.id);
        setFavoriteStatus(prev => ({ ...prev, [wallpaper.id]: false }));
        setFavorites(prev => prev.filter(fav => fav.id !== wallpaper.id));
      } else {
        await addToFavorites(wallpaper);
        setFavoriteStatus(prev => ({ ...prev, [wallpaper.id]: true }));
        setFavorites(prev => [wallpaper, ...prev]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích');
    }
  };

  // Handle wallpaper press
  const handleWallpaperPress = wallpaper => {
    setSelectedWallpaper(wallpaper);
    setShowDetailModal(true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadWallpapers(page + 1);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    loadWallpapers(1, true);
    loadFavorites();
  };

  // Render wallpaper item
  const renderWallpaper = ({ item }) => (
    <WallpaperCard
      wallpaper={item}
      onPress={() => handleWallpaperPress(item)}
      onFavoritePress={handleFavoriteToggle}
      isFavorite={favoriteStatus[item.id] || false}
    />
  );

  // Render footer
  const renderFooter = () => {
    if (!loading || refreshing) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#2196F3" size="small" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon
        name={activeTab === TABS.FAVORITES ? 'heart-outline' : 'image-outline'}
        size={64}
        color="#CCCCCC"
      />
      <Text style={styles.emptyTitle}>
        {activeTab === TABS.FAVORITES
          ? 'Chưa có yêu thích'
          : 'Không có hình nền'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === TABS.FAVORITES
          ? 'Hãy thêm những hình nền yêu thích của bạn'
          : 'Thử tìm kiếm với từ khóa khác'}
      </Text>
    </View>
  );

  const currentData = activeTab === TABS.FAVORITES ? favorites : wallpapers;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hình Nền Đẹp</Text>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === TABS.EXPLORE && styles.activeTab]}
            onPress={() => setActiveTab(TABS.EXPLORE)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === TABS.EXPLORE && styles.activeTabText,
              ]}
            >
              Khám Phá
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === TABS.FAVORITES && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab(TABS.FAVORITES);
              loadFavorites();
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === TABS.FAVORITES && styles.activeTabText,
              ]}
            >
              Yêu Thích ({favorites.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo Banner */}
      {(!env.WALLPAPER_API_KEY ||
        env.WALLPAPER_API_KEY ===
          'unsplash_demo_key_replace_with_your_key') && (
        <View style={styles.demoBanner}>
          <Icon name="information-circle" size={16} color="#FF9500" />
          <Text style={styles.demoText}>
            Đang sử dụng dữ liệu demo. Thêm Unsplash API key để có hình nền
            thật.
          </Text>
        </View>
      )}

      {/* Content */}
      {activeTab === TABS.EXPLORE && (
        <>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearch={handleSearch}
            placeholder="Tìm kiếm hình nền..."
          />

          <CategorySelector
            categories={WALLPAPER_CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategoryChange}
          />
        </>
      )}

      {/* Wallpaper Grid */}
      <FlatList
        data={currentData}
        renderItem={renderWallpaper}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        onEndReached={activeTab === TABS.EXPLORE ? handleLoadMore : null}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading overlay */}
      {loading && wallpapers.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#2196F3" size="large" />
          <Text style={styles.loadingText}>Đang tải hình nền...</Text>
        </View>
      )}

      {/* Detail Modal */}
      <WallpaperDetailModal
        visible={showDetailModal}
        wallpaper={selectedWallpaper}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedWallpaper(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  demoText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
  },
  grid: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default WallpaperScreen;
