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
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';

import CountryCard from '../components/countries/CountryCard';
import SearchBar from '../components/countries/SearchBar';
import RegionFilter from '../components/countries/RegionFilter';
import countriesService from '../services/countriesService';

const CountriesScreen = ({ navigation }) => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Animation values for sticky search bar
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -60],
    extrapolate: 'clamp',
  });

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
    await loadCountries(true);
    setRefreshing(false);
  }, [loadCountries]);

  useFocusEffect(
    useCallback(() => {
      loadCountries();
    }, [loadCountries]),
  );

  const handleFavoritePress = useCallback(async country => {
    try {
      const updatedCountry = await countriesService.toggleFavorite(
        country.cca3,
      );

      setCountries(prevCountries =>
        prevCountries.map(c => (c.cca3 === country.cca3 ? updatedCountry : c)),
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
        country => country.region && selectedRegions.includes(country.region),
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        country =>
          (country.name?.common &&
            country.name.common.toLowerCase().includes(query)) ||
          (country.name?.official &&
            country.name.official.toLowerCase().includes(query)) ||
          (country.capital &&
            country.capital[0] &&
            country.capital[0].toLowerCase().includes(query)) ||
          (country.region && country.region.toLowerCase().includes(query)) ||
          (country.subregion &&
            country.subregion.toLowerCase().includes(query)) ||
          (country.cca2 && country.cca2.toLowerCase().includes(query)) ||
          (country.cca3 && country.cca3.toLowerCase().includes(query)),
      );
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
  }, [countries, searchQuery, selectedRegions, sortBy, showOnlyFavorites]);

  useEffect(() => {
    setFilteredCountries(processedCountries);
  }, [processedCountries]);

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
              : `${filteredCountries.length} / ${countries.length} quốc gia`}
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
            onRegionChange={setSelectedRegions}
            countries={countries}
          />
        )}
      </View>
    );
  }, [
    loading,
    refreshing,
    filteredCountries.length,
    showOnlyFavorites,
    showFilters,
    viewMode,
    sortBy,
    selectedRegions,
    countries,
    toggleFavoritesFilter,
    toggleFilters,
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
          {searchQuery || selectedRegions.length > 0 || showOnlyFavorites
            ? 'Không tìm thấy quốc gia nào'
            : 'Chưa có dữ liệu'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery || selectedRegions.length > 0 || showOnlyFavorites
            ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
            : 'Kéo xuống để tải dữ liệu'}
        </Text>
      </View>
    );
  }, [loading, searchQuery, selectedRegions.length, showOnlyFavorites]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
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

      {/* Sticky Search Bar */}
      <Animated.View
        style={[
          styles.stickySearchContainer,
          {
            transform: [{ translateY: searchBarTranslateY }],
          },
        ]}
      >
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm quốc gia, thủ đô, khu vực..."
        />
      </Animated.View>

      <FlatList
        data={filteredCountries}
        renderItem={renderCountryItem}
        keyExtractor={keyExtractor}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={`${viewMode}-${filteredCountries.length}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredCountries.length === 0 && styles.emptyListContent,
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
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
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listContent: {
    paddingTop: 80, // Space for sticky search bar
    paddingHorizontal: 16,
    paddingBottom: 20,
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
});

export default CountriesScreen;
