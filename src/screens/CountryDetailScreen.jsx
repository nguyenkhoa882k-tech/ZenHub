import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 2));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.loadingBarContainer}>
      <View style={[styles.loadingBar, { width: `${progress}%` }]} />
    </View>
  );
};

const InfoRowWithLoading = ({
  label,
  value,
  onPress,
  isLoading = false,
  isEmpty = false,
}) => {
  // Determine what to show
  const showSkeletonLoader = isLoading;
  const showEmptyState = !isLoading && isEmpty;

  return (
    <TouchableOpacity
      style={[styles.infoRow, !onPress && styles.infoRowDisabled]}
      onPress={onPress}
      disabled={!onPress || isLoading}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueContainer}>
        {showSkeletonLoader ? (
          <View style={styles.skeletonLoader} />
        ) : showEmptyState ? (
          <Text style={[styles.infoValue, styles.emptyValue]}>
            Không có sẵn
          </Text>
        ) : (
          <Text style={styles.infoValue} numberOfLines={2}>
            {value}
          </Text>
        )}
        {onPress && !isLoading && (
          <Icon name="chevron-forward" size={16} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const CountryDetailScreen = ({ route, navigation }) => {
  const { country: initialCountry } = route.params;
  const [country, setCountry] = useState(initialCountry);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to check if data is loading/missing
  const isDataMissing = value => {
    return (
      !value ||
      value === 'Unknown' ||
      value === 'Không có sẵn' ||
      value === 'Không xác định' ||
      (Array.isArray(value) && value.length === 0)
    );
  };

  const handleFavoritePress = useCallback(async () => {
    try {
      const updatedCountry = await countriesService.toggleFavorite(
        country.cca3,
      );
      setCountry(prev => ({ ...prev, isFavorite: updatedCountry.isFavorite }));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu thích');
    }
  }, [country.cca3]);

  // 🔧 Debug function to refresh country data
  const refreshCountryData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing country data for:', country.cca3);
      console.log('📊 Current country data:', {
        name: country.name.common,
        latlng: country.latlng,
        population: country.population,
        area: country.area,
        capital: country.capital,
        // ✅ Debug government data
        government: {
          independent: country.independent,
          unMember: country.unMember,
          status: country.status,
          cca2: country.cca2,
          cca3: country.cca3,
          ccn3: country.ccn3,
          fifa: country.fifa,
          cioc: country.cioc,
        },
      });

      // Clear cache and fetch fresh data
      await countriesService.clearAllCache();
      const freshCountry = await countriesService.getCountryByCode(
        country.cca3,
      );

      console.log('✅ Fresh country data received:', freshCountry);
      console.log('🏛️ Government data comparison:', {
        old: {
          independent: country.independent,
          unMember: country.unMember,
          status: country.status,
          fifa: country.fifa,
          cioc: country.cioc,
        },
        new: {
          independent: freshCountry.independent,
          unMember: freshCountry.unMember,
          status: freshCountry.status,
          fifa: freshCountry.fifa,
          cioc: freshCountry.cioc,
        },
      });
      console.log('📍 Coordinates comparison:', {
        old: {
          latlng: country.latlng,
          isZero: country.latlng[0] === 0 && country.latlng[1] === 0,
        },
        new: {
          latlng: freshCountry.latlng,
          isZero: freshCountry.latlng[0] === 0 && freshCountry.latlng[1] === 0,
        },
      });

      setCountry(freshCountry);

      Alert.alert(
        'Dữ liệu đã cập nhật!',
        `Tọa độ cũ: ${formatCoordinates(
          country.latlng,
        )}\nTọa độ mới: ${formatCoordinates(freshCountry.latlng)}`,
      );
    } catch (error) {
      console.error('❌ Error refreshing country data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu mới');
    } finally {
      setIsRefreshing(false);
    }
  }, [country]);

  useEffect(() => {
    const headerLeftComponent = () => (
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name="arrow-back" size={24} color="#4F46E5" />
      </TouchableOpacity>
    );

    const headerRightComponent = () => (
      <View style={styles.headerButtonsRow}>
        <HeaderButton
          isFavorite={country.isFavorite}
          onPress={handleFavoritePress}
        />
        {/* Debug button - tap to refresh data with fresh API call */}
        <TouchableOpacity
          style={styles.debugButton}
          onPress={refreshCountryData}
          activeOpacity={0.7}
        >
          <Icon name="refresh-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    );

    navigation.setOptions({
      title: country.name.common,
      headerLeft: headerLeftComponent,
      headerRight: headerRightComponent,
    });
  }, [
    country.isFavorite,
    country.name.common,
    navigation,
    handleFavoritePress,
    refreshCountryData, // ✅ Add dependency
  ]);

  const formatNumber = number => {
    return new Intl.NumberFormat().format(number);
  };

  const formatCurrency = currencies => {
    if (!currencies) return 'Không có sẵn';
    return Object.values(currencies)
      .map(currency => `${currency.name} (${currency.symbol})`)
      .join(', ');
  };

  const formatLanguages = languages => {
    if (!languages) return 'Không có sẵn';
    return Object.values(languages).join(', ');
  };

  const formatTimezones = timezones => {
    if (!timezones || timezones.length === 0) return 'Không có sẵn';
    return timezones.join(', ');
  };

  const formatNativeName = nativeName => {
    if (!nativeName) return 'Không có sẵn';
    const names = Object.values(nativeName).map(
      name => name.common || name.official,
    );
    return names.join(', ');
  };

  const formatCapital = capital => {
    if (!capital || capital.length === 0) return 'Không có thủ đô';
    return capital.join(', ');
  };

  const formatTLD = tld => {
    if (!tld || tld.length === 0) return 'Không có';
    return tld.join(', ');
  };

  const formatDemonyms = demonyms => {
    if (!demonyms || !demonyms.eng) return 'Không có sẵn';
    const male = demonyms.eng.m || '';
    const female = demonyms.eng.f || '';
    if (male && female && male !== female) {
      return `${male} (nam), ${female} (nữ)`;
    }
    return male || female || 'Không có sẵn';
  };

  // ✅ Thêm các hàm format mới cho thông tin bổ sung
  const formatGini = gini => {
    if (!gini) return 'Không có dữ liệu';
    const years = Object.keys(gini).sort().reverse();
    const latestYear = years[0];
    return `${gini[latestYear]} (${latestYear})`;
  };

  const formatContinents = continents => {
    if (!continents || continents.length === 0) return 'Không có sẵn';
    return continents.join(', ');
  };

  const formatPostalCode = postalCode => {
    if (!postalCode) return 'Không có định dạng';
    return `Định dạng: ${postalCode.format || 'N/A'}`;
  };

  const formatCapitalInfo = capitalInfo => {
    if (!capitalInfo || !capitalInfo.latlng) return 'Không có tọa độ';
    const [lat, lng] = capitalInfo.latlng;
    return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
  };

  const formatTranslations = translations => {
    if (!translations) return 'Không có bản dịch';
    const availableLanguages = Object.keys(translations).slice(0, 5);
    return `Có bản dịch sang ${availableLanguages.length} ngôn ngữ`;
  };

  // ✅ Thêm hàm format cho thông tin chính phủ
  const formatStatus = status => {
    const statusMap = {
      'officially-assigned': 'Được công nhận chính thức',
      'user-assigned': 'Được gán bởi người dùng',
      reserved: 'Được bảo lưu',
      unassigned: 'Chưa được gán',
    };
    return statusMap[status] || status || 'Không xác định';
  };

  const formatCountryCode = (cca2, cca3, ccn3) => {
    let result = '';
    if (cca2) result += cca2;
    if (cca3) result += cca2 ? ` / ${cca3}` : cca3;
    if (ccn3) result += ` (${ccn3})`;
    return result || 'Không có mã';
  };

  const formatCoordinates = latlng => {
    if (!latlng || !Array.isArray(latlng) || latlng.length < 2) {
      return 'Tọa độ không có sẵn';
    }

    const [lat, lng] = latlng;

    // Check if coordinates are actually 0,0 (invalid fallback)
    if (lat === 0 && lng === 0) {
      return 'Tọa độ chưa được cung cấp';
    }

    return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
  };

  const getContinent = region => {
    const continentMap = {
      'Châu Á': '🌏',
      'Châu Âu': '🌍',
      'Châu Phi': '🌍',
      'Châu Mỹ': '🌎',
      'Châu Đại Dương': '🏝️',
      'Nam Cực': '🧊',
    };
    return continentMap[region] || '🌍';
  };

  const getRankByArea = area => {
    // Simplified ranking based on common area ranges
    if (area > 15000000) return 1; // Russia level
    if (area > 8000000) return 2; // Canada level
    if (area > 7000000) return 3; // USA/China level
    if (area > 3000000) return 4; // India level
    if (area > 2000000) return 5; // Saudi Arabia level
    if (area > 1000000) return '6-20'; // Large countries
    if (area > 500000) return '21-50'; // Medium-large countries
    if (area > 100000) return '51-100'; // Medium countries
    if (area > 50000) return '101-150'; // Small-medium countries
    return '150+'; // Small countries
  };

  const getRankByPopulation = population => {
    // Simplified ranking based on common population ranges
    if (population > 1000000000) return '1-2'; // China/India level
    if (population > 300000000) return '3-4'; // USA level
    if (population > 200000000) return '5-6'; // Indonesia level
    if (population > 100000000) return '7-15'; // Large population
    if (population > 50000000) return '16-30'; // Medium-large population
    if (population > 20000000) return '31-60'; // Medium population
    if (population > 5000000) return '61-120'; // Small-medium population
    if (population > 1000000) return '121-180'; // Small population
    return '180+'; // Very small population
  };

  const getSeasonInfo = latitude => {
    if (latitude > 0) {
      return 'Bán cầu Bắc (mùa đông: 12-2, mùa hè: 6-8)';
    } else if (latitude < 0) {
      return 'Bán cầu Nam (mùa đông: 6-8, mùa hè: 12-2)';
    }
    return 'Xích đạo (ít thay đổi theo mùa)';
  };

  const getClimateInfo = latitude => {
    const absLat = Math.abs(latitude);
    if (absLat > 60) return 'Cực địa (lạnh quanh năm)';
    if (absLat > 30) return 'Ôn đới (4 mùa rõ rệt)';
    if (absLat > 23.5) return 'Cận nhiệt đới (ấm, ít thay đổi)';
    return 'Nhiệt đới (nóng quanh năm)';
  };

  const openMap = useCallback(() => {
    const [lat, lng] = country.latlng;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ');
    });
  }, [country.latlng]);

  const openWikipedia = useCallback(() => {
    const wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(
      country.name.common,
    )}`;
    Linking.openURL(wikipediaUrl).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở Wikipedia');
    });
  }, [country.name.common]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Loading indicator when refreshing data */}
      {isRefreshing && (
        <View style={styles.topLoadingIndicator}>
          <LoadingBar />
          <Text style={styles.topLoadingText}>Đang cập nhật dữ liệu...</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isRefreshing && styles.scrollContentWithLoading,
        ]}
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
            <View style={styles.nameSection}>
              <Text style={styles.countryName}>
                {getContinent(country.region)} {country.name.common}
              </Text>
              <Text style={styles.officialName}>{country.name.official}</Text>
              {country.name.nativeName && (
                <Text style={styles.nativeName}>
                  Tên bản địa: {formatNativeName(country.name.nativeName)}
                </Text>
              )}
            </View>

            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatNumber(country.population)}
                </Text>
                <Text style={styles.statLabel}>Dân số</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatNumber(country.area)} km²
                </Text>
                <Text style={styles.statLabel}>Diện tích</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {Math.round(country.population / country.area)}
                </Text>
                <Text style={styles.statLabel}>Mật độ/km²</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location & Geography */}
        <InfoCard title="Vị trí & Địa lý" icon="earth-outline">
          <InfoRow label="Khu vực" value={country.region} />
          <InfoRow
            label="Tiểu khu vực"
            value={country.subregion || 'Không xác định'}
          />
          <InfoRow label="Thủ đô" value={formatCapital(country.capital)} />
          <InfoRow
            label="Tọa độ"
            value={formatCoordinates(country.latlng)}
            onPress={
              country.latlng[0] !== 0 || country.latlng[1] !== 0
                ? openMap
                : null
            }
          />
          <InfoRow
            label="Diện tích"
            value={`${formatNumber(country.area)} km²`}
          />
          <InfoRow
            label="Biên giới"
            value={
              country.borders?.length > 0
                ? `${country.borders.length} quốc gia: ${country.borders.join(
                    ', ',
                  )}`
                : 'Không có biên giới đất liền'
            }
          />
          <InfoRow
            label="Đất liền bao quanh"
            value={country.landlocked ? 'Có' : 'Không'}
          />
        </InfoCard>

        {/* Demographics */}
        <InfoCard title="Nhân khẩu học" icon="people-outline">
          <InfoRow label="Dân số" value={formatNumber(country.population)} />
          <InfoRow
            label="Mật độ dân số"
            value={`${Math.round(country.population / country.area)} người/km²`}
          />
          <InfoRow
            label="Ngôn ngữ"
            value={formatLanguages(country.languages)}
          />
          <InfoRow
            label="Tên gọi dân tộc"
            value={formatDemonyms(country.demonyms)}
          />
          <InfoRow label="Thủ đô" value={formatCapital(country.capital)} />
          <InfoRow
            label="Tọa độ thủ đô"
            value={formatCapitalInfo(country.capitalInfo)}
          />
          <InfoRow
            label="Châu lục"
            value={formatContinents(country.continents)}
          />
        </InfoCard>

        {/* Government & Politics */}
        <InfoCard title="Chính phủ & Chính trị" icon="library-outline">
          <InfoRowWithLoading
            label="Độc lập"
            value={country.independent ? 'Độc lập' : 'Lãnh thổ phụ thuộc'}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.independent)}
          />
          <InfoRowWithLoading
            label="Thành viên LHQ"
            value={country.unMember ? 'Có' : 'Không'}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.unMember)}
          />
          <InfoRowWithLoading
            label="Tình trạng chính thức"
            value={formatStatus(country.status)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.status)}
          />
          <InfoRowWithLoading
            label="Mã quốc gia ISO"
            value={formatCountryCode(country.cca2, country.cca3, country.ccn3)}
            isLoading={isRefreshing}
            isEmpty={
              isDataMissing(country.cca2) &&
              isDataMissing(country.cca3) &&
              isDataMissing(country.ccn3)
            }
          />
          <InfoRowWithLoading
            label="Mã FIFA"
            value={country.fifa || 'Không tham gia FIFA'}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.fifa)}
          />
          <InfoRowWithLoading
            label="Mã Olympic (IOC)"
            value={country.cioc || 'Không tham gia Olympic'}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.cioc)}
          />
        </InfoCard>

        {/* Economy */}
        <InfoCard title="Kinh tế" icon="card-outline">
          <InfoRowWithLoading
            label="Tiền tệ"
            value={formatCurrency(country.currencies)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.currencies)}
          />
          <InfoRowWithLoading
            label="Chỉ số Gini (Bất bình đẳng)"
            value={formatGini(country.gini)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.gini)}
          />
          <InfoRowWithLoading
            label="GDP (Danh nghĩa)"
            value="Dữ liệu không có sẵn"
            isLoading={isRefreshing}
            isEmpty={true}
          />
        </InfoCard>

        {/* Cultural Information */}
        <InfoCard title="Thông tin văn hóa" icon="globe-outline">
          <InfoRowWithLoading
            label="Múi giờ"
            value={formatTimezones(country.timezones)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.timezones)}
          />
          <InfoRowWithLoading
            label="Ngày bắt đầu tuần"
            value={country.startOfWeek === 'monday' ? 'Thứ hai' : 'Chủ nhật'}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.startOfWeek)}
          />
          <InfoRowWithLoading
            label="Tên miền internet"
            value={formatTLD(country.tld)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.tld)}
          />
          <InfoRowWithLoading
            label="Mã gọi điện thoại"
            value={country.callingCode}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.callingCode)}
          />
          <InfoRowWithLoading
            label="Định dạng mã bưu chính"
            value={formatPostalCode(country.postalCode)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.postalCode)}
          />
          <InfoRowWithLoading
            label="Ngôn ngữ chính thức"
            value={formatLanguages(country.languages)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.languages)}
          />
          <InfoRowWithLoading
            label="Tên bản địa"
            value={formatNativeName(country.nativeName)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.nativeName)}
          />
          <InfoRowWithLoading
            label="Tên thay thế"
            value={country.altSpellings?.join(', ') || 'Không có sẵn'}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.altSpellings)}
          />
          <InfoRowWithLoading
            label="Bản dịch quốc tế"
            value={formatTranslations(country.translations)}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.translations)}
          />
        </InfoCard>

        {/* Transportation */}
        <InfoCard title="Giao thông" icon="car-outline">
          <InfoRowWithLoading
            label="Lái xe bên"
            value={country.car?.side === 'right' ? 'Bên phải' : 'Bên trái'}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.car?.side)}
          />
          <InfoRowWithLoading
            label="Biển số xe"
            value={country.car?.signs?.join(', ') || 'Không có sẵn'}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.car?.signs)}
          />
        </InfoCard>

        {/* Additional Information */}
        <InfoCard title="Thông tin bổ sung" icon="information-circle-outline">
          <InfoRowWithLoading
            label="Thứ hạng diện tích thế giới"
            value={`#${getRankByArea(country.area)} trên thế giới`}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.area)}
          />
          <InfoRowWithLoading
            label="Thứ hạng dân số thế giới"
            value={`#${getRankByPopulation(country.population)} trên thế giới`}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.population)}
          />
          <InfoRowWithLoading
            label="Mùa"
            value={getSeasonInfo(country.latlng?.[0])}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.latlng?.[0])}
          />
          <InfoRowWithLoading
            label="Khí hậu"
            value={getClimateInfo(country.latlng?.[0])}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.latlng?.[0])}
          />
          <InfoRowWithLoading
            label="Châu lục"
            value={`${getContinent(country.region)} ${country.region}`}
            isLoading={isRefreshing}
            isEmpty={isDataMissing(country.region)}
          />
        </InfoCard>

        {/* External Links */}
        <InfoCard title="Tìm hiểu thêm" icon="link-outline">
          <InfoRowWithLoading
            label="Google Maps"
            value="Xem trên Google Maps"
            onPress={openMap}
            isLoading={isRefreshing}
            isEmpty={false}
          />
          <InfoRowWithLoading
            label="Wikipedia"
            value="Đọc trên Wikipedia"
            onPress={openWikipedia}
            isLoading={isRefreshing}
            isEmpty={false}
          />
          {country.maps?.googleMaps && (
            <InfoRowWithLoading
              label="Bản đồ chính thức"
              value="Mở liên kết bản đồ chính thức"
              onPress={() => Linking.openURL(country.maps.googleMaps)}
              isLoading={isRefreshing}
              isEmpty={isDataMissing(country.maps?.googleMaps)}
            />
          )}
        </InfoCard>

        {/* Flag Information */}
        <InfoCard title="Biểu tượng quốc gia" icon="flag-outline">
          <View style={styles.flagInfo}>
            <View style={styles.symbolsRow}>
              <View style={styles.symbolContainer}>
                <Text style={styles.symbolTitle}>Quốc kỳ</Text>
                <Image
                  source={{ uri: country.flag }}
                  style={styles.detailFlagImage}
                  resizeMode="contain"
                />
                {country.flagEmoji && (
                  <Text style={styles.flagEmoji}>{country.flagEmoji}</Text>
                )}
              </View>

              {country.coatOfArms?.png && (
                <View style={styles.symbolContainer}>
                  <Text style={styles.symbolTitle}>Quốc huy</Text>
                  <Image
                    source={{ uri: country.coatOfArms.png }}
                    style={styles.coatOfArmsImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>

            {country.flagAlt && (
              <Text style={styles.flagDescription}>{country.flagAlt}</Text>
            )}
          </View>
        </InfoCard>
      </ScrollView>

      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Icon name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginTop: 12,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  quickBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-start',
  },
  quickBackText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  floatingBackButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugButton: {
    padding: 8,
    marginLeft: 4,
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  scrollContentWithLoading: {
    paddingTop: 50,
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
  nameSection: {
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 8,
  },
  nativeName: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  symbolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  symbolContainer: {
    alignItems: 'center',
    flex: 1,
  },
  symbolTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  detailFlagImage: {
    width: width * 0.3,
    height: width * 0.3 * 0.6,
    borderRadius: 8,
    marginBottom: 8,
  },
  coatOfArmsImage: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 8,
  },
  flagEmoji: {
    fontSize: 32,
    marginTop: 4,
  },
  flagDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Loading Components Styles
  topLoadingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 70, 229, 0.1)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingBarContainer: {
    width: '60%',
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  topLoadingText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  skeletonLoader: {
    width: '70%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    opacity: 0.7,
  },
  emptyValue: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default CountryDetailScreen;
