import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CountryCard = ({
  country,
  onPress,
  onFavoritePress,
  viewMode = 'grid', // 'grid' | 'list'
  style,
}) => {
  const formatPopulation = population => {
    if (!population || population === 0) return 'N/A';
    if (population >= 1000000000) {
      return `${(population / 1000000000).toFixed(1)}B`;
    } else if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(1)}K`;
    }
    return population.toString();
  };

  const formatArea = area => {
    if (!area || area === 0) return 'N/A';
    if (area >= 1000000) {
      return `${(area / 1000000).toFixed(1)}M km²`;
    } else if (area >= 1000) {
      return `${(area / 1000).toFixed(0)}K km²`;
    }
    return `${area} km²`;
  };

  if (viewMode === 'list') {
    return (
      <TouchableOpacity
        style={[styles.listCard, style]}
        onPress={() => onPress(country)}
        activeOpacity={0.7}
      >
        <View style={styles.listContent}>
          <View style={styles.listFlag}>
            <Image
              source={{ uri: country.flag }}
              style={styles.listFlagImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.listInfo}>
            <View style={styles.listHeader}>
              <Text style={styles.listName} numberOfLines={1}>
                {country.name.common}
              </Text>
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => onFavoritePress(country)}
              >
                <Icon
                  name={country.isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={country.isFavorite ? '#FF6B6B' : '#9CA3AF'}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.listCapital} numberOfLines={1}>
              📍{' '}
              {Array.isArray(country.capital)
                ? country.capital[0]
                : country.capital}
            </Text>

            <View style={styles.listStats}>
              <Text style={styles.listStat}>
                👥 {formatPopulation(country.population)}
              </Text>
              <Text style={styles.listStat}>🌍 {country.region}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.gridCard, style]}
      onPress={() => onPress(country)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.flagContainer}>
          <Image
            source={{ uri: country.flag }}
            style={styles.flagImage}
            resizeMode="cover"
          />
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onFavoritePress(country)}
        >
          <Icon
            name={country.isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={country.isFavorite ? '#FF6B6B' : '#9CA3AF'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.countryName} numberOfLines={2}>
          {country.name.common}
        </Text>

        <Text style={styles.capital} numberOfLines={1}>
          📍{' '}
          {Array.isArray(country.capital)
            ? country.capital[0]
            : country.capital}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatPopulation(country.population)}
            </Text>
            <Text style={styles.statLabel}>Population</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatArea(country.area)}</Text>
            <Text style={styles.statLabel}>Area</Text>
          </View>
        </View>

        <View style={styles.regionBadge}>
          <Text style={styles.regionText}>{country.region}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Card Styles
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  flagContainer: {
    width: 60,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
    paddingTop: 0,
  },
  countryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
  },
  capital: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  regionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  regionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },

  // List Card Styles
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    flexDirection: 'row',
    padding: 16,
  },
  listFlag: {
    width: 50,
    height: 35,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  listFlagImage: {
    width: '100%',
    height: '100%',
  },
  listInfo: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  listCapital: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  listStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listStat: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default CountryCard;
