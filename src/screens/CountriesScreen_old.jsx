import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  
  // Animation values for sticky header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, -50],
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
        prevCountries.map(c =>
          c.cca3 === country.cca3 ? updatedCountry : c
        )
      );
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu thích', [{ text: 'Đồng ý' }]);
    }
  }, []);
      );

      setCountries(prevCountries =>
        prevCountries.map(c =>
          c.cca3 === country.cca3
            ? { ...c, isFavorite: updatedCountry.isFavorite }
            : c,
        ),
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  }, []);

  const handleCountryPress = useCallback(
    country => {
      navigation.navigate('CountryDetail', { country });
    },
    [navigation],
  );

  const handleRegionToggle = useCallback(region => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  }, []);

  const clearRegionFilter = useCallback(() => {
    setSelectedRegions([]);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  }, []);

  const toggleSortBy = useCallback(() => {
    const sortOptions = ['name', 'population', 'area'];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  }, [sortBy]);

  const getSortLabel = sortType => {
    const labels = {
      name: 'Name',
      population: 'Population',
      area: 'Area',
    };
    return labels[sortType] || 'Name';
  };

  const filteredAndSortedCountries = useMemo(() => {
    let result = countries;

    // Apply search filter
    if (searchQuery.trim()) {
      result = countriesService.searchCountries(result, searchQuery);
    }

    // Apply region filter
    if (selectedRegions.length > 0) {
      result = result.filter(country =>
        selectedRegions.includes(country.region),
      );
    }

    // Apply favorites filter
    if (showOnlyFavorites) {
      result = result.filter(country => country.isFavorite);
    }

    // Sort results
    result = countriesService.sortCountries(result, sortBy);

    return result;
  }, [countries, searchQuery, selectedRegions, showOnlyFavorites, sortBy]);

  useEffect(() => {
    setFilteredCountries(filteredAndSortedCountries);
  }, [filteredAndSortedCountries]);

  const renderCountryItem = useCallback(
    ({ item }) => (
      <CountryCard
        country={item}
        onPress={handleCountryPress}
        onFavoritePress={handleFavoritePress}
        viewMode={viewMode}
        style={viewMode === 'grid' ? styles.gridItem : styles.listItem}
      />
    ),
    [viewMode, handleCountryPress, handleFavoritePress],
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        showFilterButton={true}
        onFilterPress={() => setShowFilters(!showFilters)}
        filterActive={
          showFilters || selectedRegions.length > 0 || showOnlyFavorites
        }
        style={styles.searchBar}
      />

      {showFilters && (
        <View style={styles.filtersContainer}>
          <RegionFilter
            selectedRegions={selectedRegions}
            onRegionToggle={handleRegionToggle}
            onClearAll={clearRegionFilter}
          />

          <View style={styles.additionalFilters}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showOnlyFavorites && styles.filterButtonActive,
              ]}
              onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
            >
              <Icon
                name={showOnlyFavorites ? 'heart' : 'heart-outline'}
                size={16}
                color={showOnlyFavorites ? '#FFFFFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  showOnlyFavorites && styles.filterButtonTextActive,
                ]}
              >
                Favorites Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <View style={styles.resultInfo}>
          <Text style={styles.resultText}>
            {filteredCountries.length} countries
          </Text>
          {(searchQuery || selectedRegions.length > 0 || showOnlyFavorites) && (
            <Text style={styles.filterIndicator}>• Filtered</Text>
          )}
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleSortBy}>
            <Icon name="swap-vertical-outline" size={16} color="#6B7280" />
            <Text style={styles.controlButtonText}>{getSortLabel(sortBy)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={toggleViewMode}
          >
            <Icon
              name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
              size={16}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="earth-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedRegions.length > 0 || showOnlyFavorites
          ? 'No countries found'
          : 'No countries available'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedRegions.length > 0 || showOnlyFavorites
          ? 'Try adjusting your search or filters'
          : 'Pull down to refresh and load countries'}
      </Text>
    </View>
  );

  if (loading && countries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading countries...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <FlatList
        data={filteredCountries}
        renderItem={renderCountryItem}
        keyExtractor={item => item.cca3}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F9FAFB',
  },
  searchBar: {
    marginBottom: 0,
  },
  filtersContainer: {
    marginTop: 16,
  },
  additionalFilters: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  resultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterIndicator: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
    marginLeft: 4,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 8,
  },
  controlButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 32,
  },
  gridItem: {
    marginHorizontal: 8,
  },
  listItem: {
    marginHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CountriesScreen;
