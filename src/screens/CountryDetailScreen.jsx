import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import countriesService from '../services/countriesService';

const { width } = Dimensions.get('window');

const InfoCard = ({ title, children, icon }) => (
  <View style={styles.infoCard}>
    <View style={styles.cardHeader}>
      <Icon name={icon} size={20} color="#4F46E5" />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardContent}>{children}</View>
  </View>
);

const InfoRow = ({ label, value, onPress }) => (
  <TouchableOpacity
    style={[styles.infoRow, !onPress && styles.infoRowDisabled]}
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
      {onPress && <Icon name="chevron-forward" size={16} color="#9CA3AF" />}
    </View>
  </TouchableOpacity>
);

const HeaderButton = ({ isFavorite, onPress }) => (
  <TouchableOpacity style={styles.headerButton} onPress={onPress}>
    <Icon
      name={isFavorite ? 'heart' : 'heart-outline'}
      size={24}
      color={isFavorite ? '#FF6B6B' : '#6B7280'}
    />
  </TouchableOpacity>
);

const CountryDetailScreen = ({ route, navigation }) => {
  const { country: initialCountry } = route.params;
  const [country, setCountry] = useState(initialCountry);

  const handleFavoritePress = useCallback(async () => {
    try {
      const updatedCountry = await countriesService.toggleFavorite(
        country.cca3,
      );
      setCountry(prev => ({ ...prev, isFavorite: updatedCountry.isFavorite }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  }, [country.cca3]);

  useEffect(() => {
    const headerRightComponent = () => (
      <HeaderButton
        isFavorite={country.isFavorite}
        onPress={handleFavoritePress}
      />
    );

    navigation.setOptions({
      title: country.name.common,
      headerRight: headerRightComponent,
    });
  }, [
    country.isFavorite,
    country.name.common,
    navigation,
    handleFavoritePress,
  ]);

  const formatNumber = number => {
    return new Intl.NumberFormat().format(number);
  };

  const formatCurrency = currencies => {
    if (!currencies) return 'Not available';
    return Object.values(currencies)
      .map(currency => `${currency.name} (${currency.symbol})`)
      .join(', ');
  };

  const formatLanguages = languages => {
    if (!languages) return 'Not available';
    return Object.values(languages).join(', ');
  };

  const formatTimezones = timezones => {
    if (!timezones || timezones.length === 0) return 'Not available';
    return timezones.join(', ');
  };

  const openMap = useCallback(() => {
    const [lat, lng] = country.latlng;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps application');
    });
  }, [country.latlng]);

  const openWikipedia = useCallback(() => {
    const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(
      country.name.common,
    )}`;
    Linking.openURL(wikipediaUrl).catch(() => {
      Alert.alert('Error', 'Could not open Wikipedia');
    });
  }, [country.name.common]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Flag and Basic Info */}
        <View style={styles.flagSection}>
          <View style={styles.flagContainer}>
            <Image
              source={{ uri: country.flag }}
              style={styles.flagImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.basicInfo}>
            <Text style={styles.countryName}>{country.name.common}</Text>
            <Text style={styles.officialName}>{country.name.official}</Text>

            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatNumber(country.population)}
                </Text>
                <Text style={styles.statLabel}>Population</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatNumber(country.area)} km²
                </Text>
                <Text style={styles.statLabel}>Area</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location & Geography */}
        <InfoCard title="Location & Geography" icon="earth-outline">
          <InfoRow label="Region" value={country.region} />
          <InfoRow
            label="Subregion"
            value={country.subregion || 'Not specified'}
          />
          <InfoRow label="Capital" value={country.capital} />
          <InfoRow
            label="Coordinates"
            value={`${country.latlng[0]}°, ${country.latlng[1]}°`}
            onPress={openMap}
          />
          <InfoRow
            label="Borders"
            value={
              country.borders?.length > 0
                ? `${country.borders.length} countries`
                : 'No land borders'
            }
          />
          <InfoRow
            label="Landlocked"
            value={country.landlocked ? 'Yes' : 'No'}
          />
        </InfoCard>

        {/* Demographics */}
        <InfoCard title="Demographics" icon="people-outline">
          <InfoRow
            label="Population"
            value={formatNumber(country.population)}
          />
          <InfoRow
            label="Population Density"
            value={`${Math.round(
              country.population / country.area,
            )} people/km²`}
          />
          <InfoRow
            label="Languages"
            value={formatLanguages(country.languages)}
          />
        </InfoCard>

        {/* Government & Politics */}
        <InfoCard title="Government & Politics" icon="library-outline">
          <InfoRow
            label="Independence"
            value={country.independent ? 'Independent' : 'Dependent territory'}
          />
          <InfoRow label="UN Member" value={country.unMember ? 'Yes' : 'No'} />
          <InfoRow label="Status" value={country.status} />
        </InfoCard>

        {/* Economy */}
        <InfoCard title="Economy" icon="card-outline">
          <InfoRow
            label="Currencies"
            value={formatCurrency(country.currencies)}
          />
          <InfoRow label="GDP (Nominal)" value="Data not available" />
        </InfoCard>

        {/* Cultural Information */}
        <InfoCard title="Cultural Information" icon="globe-outline">
          <InfoRow
            label="Timezones"
            value={formatTimezones(country.timezones)}
          />
          <InfoRow
            label="Internet TLD"
            value={country.tld?.join(', ') || 'Not available'}
          />
          <InfoRow label="Calling Code" value={country.callingCode} />
        </InfoCard>

        {/* Transportation */}
        <InfoCard title="Transportation" icon="car-outline">
          <InfoRow
            label="Drives on"
            value={country.car?.side === 'right' ? 'Right side' : 'Left side'}
          />
          <InfoRow
            label="Car Signs"
            value={country.car?.signs?.join(', ') || 'Not available'}
          />
        </InfoCard>

        {/* External Links */}
        <InfoCard title="Learn More" icon="link-outline">
          <InfoRow
            label="Google Maps"
            value="View on Google Maps"
            onPress={openMap}
          />
          <InfoRow
            label="Wikipedia"
            value="Read on Wikipedia"
            onPress={openWikipedia}
          />
          {country.maps?.googleMaps && (
            <InfoRow
              label="Official Maps"
              value="Open official map link"
              onPress={() => Linking.openURL(country.maps.googleMaps)}
            />
          )}
        </InfoCard>

        {/* Flag Information */}
        <InfoCard title="Flag Information" icon="flag-outline">
          <View style={styles.flagInfo}>
            <Image
              source={{ uri: country.flag }}
              style={styles.detailFlagImage}
              resizeMode="contain"
            />
            {country.flagAlt && (
              <Text style={styles.flagDescription}>{country.flagAlt}</Text>
            )}
          </View>
        </InfoCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  flagSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  flagContainer: {
    alignSelf: 'center',
    width: 120,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  basicInfo: {
    alignItems: 'center',
  },
  countryName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  officialName: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
  },
  cardContent: {
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoRowDisabled: {
    // No special styling for disabled rows
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 100,
  },
  infoValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 16,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'right',
  },
  flagInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  detailFlagImage: {
    width: width * 0.6,
    height: width * 0.6 * 0.6,
    borderRadius: 8,
    marginBottom: 16,
  },
  flagDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CountryDetailScreen;
