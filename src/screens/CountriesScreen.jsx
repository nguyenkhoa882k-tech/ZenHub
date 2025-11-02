import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';

import CountryCard from '../components/countries/CountryCard';
import SearchBar from '../components/countries/SearchBar';
import RegionFilter from '../components/countries/RegionFilter';
import countriesService from '../services/countriesService';

const CountriesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [displayedCountries, setDisplayedCountries] = useState([]); // Countries currently displayed
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Loading more countries
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  // Animation values for sticky search bar with smart hide/show
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('up');
  const scrollTimer = useRef(null);

  const searchBarTranslateY = useRef(new Animated.Value(0)).current;

  // Handle scroll direction and auto-show after stopping
  const handleScrollDirection = useCallback(
    currentScrollY => {
      const diff = currentScrollY - lastScrollY.current;

      if (Math.abs(diff) < 3) return; // Ignore small movements

      const newDirection = diff > 0 ? 'down' : 'up';

      if (newDirection !== scrollDirection.current) {
        scrollDirection.current = newDirection;

        // Hide search bar when scrolling down (past 30px)
        if (newDirection === 'down' && currentScrollY > 30) {
          Animated.timing(searchBarTranslateY, {
            toValue: -90,
            duration: 250,
            useNativeDriver: true,
          }).start();
        }
        // Show search bar immediately when scrolling up
        else if (newDirection === 'up') {
          Animated.timing(searchBarTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }

      lastScrollY.current = currentScrollY;

      // Clear existing timer
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }

      // Show search bar after stopping scroll for 800ms
      scrollTimer.current = setTimeout(() => {
        if (scrollTimer.current) {
          // Check if component is still mounted
          Animated.spring(searchBarTranslateY, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      }, 800);
    },
    [searchBarTranslateY],
  );

  const loadCountries = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await countriesService.getAllCountries(forceRefresh);
      setCountries(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách quốc gia:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách quốc gia. Vui lòng kiểm tra kết nối mạng và thử lại.',
        [{ text: 'Đồng ý' }],
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Reset pagination state
    setCurrentPage(1);
    setHasMore(true);
    await loadCountries(true);
    setRefreshing(false);
  }, [loadCountries]);

  useFocusEffect(
    useCallback(() => {
      loadCountries();
    }, [loadCountries]),
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
        scrollTimer.current = null; // Prevent memory leaks
      }
    };
  }, []);

  // Debounce search query for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFavoritePress = useCallback(async country => {
    try {
      const updatedCountry = await countriesService.toggleFavorite(
        country.cca3,
      );

      // Cập nhật countries array
      setCountries(prevCountries =>
        prevCountries.map(c => (c.cca3 === country.cca3 ? updatedCountry : c)),
      );

      // Cập nhật displayedCountries array để tránh delay UI
      setDisplayedCountries(prevDisplayed =>
        prevDisplayed.map(c => (c.cca3 === country.cca3 ? updatedCountry : c)),
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu thích', [
        { text: 'Đồng ý' },
      ]);
    }
  }, []);

  // Filter and sort countries based on current settings
  const processedCountries = useMemo(() => {
    let result = [...countries];

    // Apply favorites filter
    if (showOnlyFavorites) {
      result = result.filter(country => country.isFavorite);
    }

    // Apply region filter
    if (selectedRegions.length > 0) {
      result = result.filter(
        country =>
          country.regionEnglish &&
          selectedRegions.includes(country.regionEnglish),
      );
    }

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(country => {
        // Tên tiếng Việt
        const commonName = country.name?.common?.toLowerCase() || '';
        const officialName = country.name?.official?.toLowerCase() || '';

        // Tên tiếng Anh (để tìm kiếm)
        const englishCommon =
          country.name?.english?.common?.toLowerCase() || '';
        const englishOfficial =
          country.name?.english?.official?.toLowerCase() || '';

        // Thông tin khác
        const capital = country.capital?.[0]?.toLowerCase() || '';
        const region = country.region?.toLowerCase() || '';
        const code = (country.cca2 || '').toLowerCase();

        return (
          commonName.includes(query) || // Tìm theo tên tiếng Việt
          officialName.includes(query) || // Tìm theo tên chính thức tiếng Việt
          englishCommon.includes(query) || // Tìm theo tên tiếng Anh
          englishOfficial.includes(query) || // Tìm theo tên chính thức tiếng Anh
          capital.includes(query) || // Tìm theo thủ đô
          region.includes(query) || // Tìm theo khu vực
          code.includes(query) // Tìm theo mã quốc gia
        );
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = a.name?.common || '';
          const nameB = b.name?.common || '';
          return nameA.localeCompare(nameB, 'vi');
        case 'population':
          return (b.population || 0) - (a.population || 0);
        case 'area':
          return (b.area || 0) - (a.area || 0);
        case 'region':
          const regionA = a.region || '';
          const regionB = b.region || '';
          return regionA.localeCompare(regionB, 'vi');
        default:
          const defaultNameA = a.name?.common || '';
          const defaultNameB = b.name?.common || '';
          return defaultNameA.localeCompare(defaultNameB, 'vi');
      }
    });

    return result;
  }, [
    countries,
    debouncedSearchQuery,
    selectedRegions,
    sortBy,
    showOnlyFavorites,
  ]);

  // Update displayed countries when filtered data changes
  useEffect(() => {
    setFilteredCountries(processedCountries);
    // Reset pagination when filters change
    setCurrentPage(1);
    setHasMore(processedCountries.length > ITEMS_PER_PAGE);
    // Show first page
    setDisplayedCountries(processedCountries.slice(0, ITEMS_PER_PAGE));
  }, [processedCountries]);

  // Load more countries for pagination
  const loadMoreCountries = useCallback(() => {
    if (loadingMore || !hasMore || filteredCountries.length <= ITEMS_PER_PAGE)
      return;

    setLoadingMore(true);

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newCountries = processedCountries.slice(startIndex, endIndex);

      if (newCountries.length > 0) {
        setDisplayedCountries(prev => [...prev, ...newCountries]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < processedCountries.length);
      } else {
        setHasMore(false);
      }

      setLoadingMore(false);
    });
  }, [
    loadingMore,
    hasMore,
    currentPage,
    processedCountries,
    filteredCountries.length,
  ]);

  const handleCountryPress = useCallback(
    country => {
      navigation.navigate('CountryDetail', { country });
    },
    [navigation],
  );

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  }, []);

  const handleSortChange = useCallback(newSortBy => {
    setSortBy(newSortBy);
  }, []);

  const toggleFavoritesFilter = useCallback(() => {
    setShowOnlyFavorites(prev => !prev);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const onRegionToggle = useCallback(region => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        // Remove region if already selected
        return prev.filter(r => r !== region);
      } else {
        // Add region if not selected
        return [...prev, region];
      }
    });
  }, []);

  const onClearAllRegions = useCallback(() => {
    setSelectedRegions([]);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedRegions([]);
    setShowOnlyFavorites(false);
    setSortBy('name');
  }, []);

  const getItemLayout = useCallback(
    (data, index) => {
      const itemHeight = viewMode === 'grid' ? 200 : 120;
      return {
        length: itemHeight,
        offset: itemHeight * index,
        index,
      };
    },
    [viewMode],
  );

  const keyExtractor = useCallback(item => item.cca3, []);

  const ListSeparator = useCallback(
    () => <View style={styles.listSeparator} />,
    [],
  );

  const renderCountryItem = useCallback(
    ({ item }) => (
      <CountryCard
        country={item}
        onPress={() => handleCountryPress(item)}
        onFavoritePress={() => handleFavoritePress(item)}
        viewMode={viewMode}
      />
    ),
    [handleCountryPress, handleFavoritePress, viewMode],
  );

  const renderHeader = useCallback(() => {
    if (loading && !refreshing) {
      return null;
    }

    return (
      <View style={styles.headerContent}>
        <View style={styles.headerControls}>
          <Text style={styles.resultsText}>
            {showOnlyFavorites
              ? `${filteredCountries.length} quốc gia yêu thích`
              : `Hiển thị ${displayedCountries.length} / ${filteredCountries.length} quốc gia`}
          </Text>

          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                showOnlyFavorites && styles.activeButton,
              ]}
              onPress={toggleFavoritesFilter}
            >
              <Icon
                name={showOnlyFavorites ? 'heart' : 'heart-outline'}
                size={20}
                color={showOnlyFavorites ? '#FF6B6B' : '#666'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, showFilters && styles.activeButton]}
              onPress={toggleFilters}
            >
              <Icon name="filter-outline" size={20} color="#666" />
            </TouchableOpacity>

            {(debouncedSearchQuery ||
              selectedRegions.length > 0 ||
              showOnlyFavorites ||
              sortBy !== 'name') && (
              <TouchableOpacity
                style={[styles.controlButton, styles.clearButton]}
                onPress={clearAllFilters}
              >
                <Icon name="refresh-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.controlButton}
              onPress={toggleViewMode}
            >
              <Icon
                name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sắp xếp theo:</Text>
          <View style={styles.sortButtons}>
            {[
              { key: 'name', label: 'Tên' },
              { key: 'population', label: 'Dân số' },
              { key: 'area', label: 'Diện tích' },
              { key: 'region', label: 'Khu vực' },
            ].map(sort => (
              <TouchableOpacity
                key={sort.key}
                style={[
                  styles.sortButton,
                  sortBy === sort.key && styles.activeSortButton,
                ]}
                onPress={() => handleSortChange(sort.key)}
              >
                <Text
                  style={[
                    styles.sortButtonText,
                    sortBy === sort.key && styles.activeSortButtonText,
                  ]}
                >
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {showFilters && (
          <RegionFilter
            selectedRegions={selectedRegions}
            onRegionToggle={onRegionToggle}
            onClearAll={onClearAllRegions}
            countries={countries}
          />
        )}
      </View>
    );
  }, [
    loading,
    refreshing,
    filteredCountries.length,
    displayedCountries.length,
    showOnlyFavorites,
    showFilters,
    viewMode,
    sortBy,
    selectedRegions,
    countries,
    debouncedSearchQuery,
    toggleFavoritesFilter,
    toggleFilters,
    onRegionToggle,
    onClearAllRegions,
    clearAllFilters,
    toggleViewMode,
    handleSortChange,
  ]);

  const renderEmptyState = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải danh sách quốc gia...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Icon name="earth-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>
          {debouncedSearchQuery ||
          selectedRegions.length > 0 ||
          showOnlyFavorites
            ? 'Không tìm thấy quốc gia nào'
            : 'Chưa có dữ liệu'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {debouncedSearchQuery ||
          selectedRegions.length > 0 ||
          showOnlyFavorites
            ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
            : 'Kéo xuống để tải dữ liệu'}
        </Text>
      </View>
    );
  }, [
    loading,
    debouncedSearchQuery,
    selectedRegions.length,
    showOnlyFavorites,
  ]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Đang tải thêm quốc gia...</Text>
      </View>
    );
  }, [loadingMore]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: event => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        handleScrollDirection(currentScrollY);
      },
    },
  );

  if (loading && countries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải danh sách quốc gia...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Animated Search Bar with Back Button */}
      <Animated.View
        style={[
          styles.stickySearchContainer,
          {
            top: insets.top, // Điều chỉnh theo safe area
            transform: [{ translateY: searchBarTranslateY }],
          },
        ]}
      >
        <View style={styles.searchBarWrapper}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm quốc gia, thủ đô, khu vực..."
            />
          </View>
        </View>
      </Animated.View>

      <FlatList
        data={displayedCountries}
        renderItem={renderCountryItem}
        keyExtractor={keyExtractor}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // ✅ Chỉ thay đổi key khi viewMode thay đổi
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : null}
        ItemSeparatorComponent={viewMode === 'list' ? ListSeparator : null}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: 90 + insets.top }, // Dynamic padding based on safe area
          displayedCountries.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            title="Kéo để làm mới..."
            titleColor="#666"
          />
        }
        onEndReached={loadMoreCountries}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        getItemLayout={viewMode === 'list' ? getItemLayout : undefined}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  stickySearchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 6,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchBarContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  listSeparator: {
    height: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContent: {
    marginBottom: 16,
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#FFF',
    borderColor: '#FF6B6B',
  },
  sortContainer: {
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeSortButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#FFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
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
    marginLeft: 8,
  },
});

export default CountriesScreen;
