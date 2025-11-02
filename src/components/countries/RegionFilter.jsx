import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { COUNTRY_REGIONS } from '../../config/constants';

const RegionFilter = ({
  selectedRegions,
  onRegionToggle,
  onClearAll,
  style,
}) => {
  const regionEmojis = {
    Africa: '🌍',
    Americas: '🌎',
    Asia: '🌏',
    Europe: '🌍',
    Oceania: '🏝️',
    Antarctic: '🧊',
  };

  // Mapping từ tiếng Anh sang tiếng Việt
  const regionNames = {
    Africa: 'Châu Phi',
    Americas: 'Châu Mỹ',
    Asia: 'Châu Á',
    Europe: 'Châu Âu',
    Oceania: 'Châu Đại Dương',
    Antarctic: 'Nam Cực',
  };

  const getRegionCount = region => {
    // Có thể pass như prop hoặc tính từ dữ liệu countries
    const counts = {
      Africa: 54,
      Americas: 35,
      Asia: 50,
      Europe: 53,
      Oceania: 16,
      Antarctic: 5,
    };
    return counts[region] || 0;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="location-outline" size={20} color="#374151" />
          <Text style={styles.title}>Lọc theo khu vực</Text>
        </View>

        {selectedRegions.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {COUNTRY_REGIONS.map(region => {
          const isSelected = selectedRegions.includes(region);
          return (
            <TouchableOpacity
              key={region}
              style={[
                styles.regionChip,
                isSelected && styles.regionChipSelected,
              ]}
              onPress={() => onRegionToggle(region)}
              activeOpacity={0.7}
            >
              <View style={styles.chipContent}>
                <Text style={styles.regionEmoji}>{regionEmojis[region]}</Text>
                <Text
                  style={[
                    styles.regionText,
                    isSelected && styles.regionTextSelected,
                  ]}
                >
                  {regionNames[region]}
                </Text>
                <Text
                  style={[
                    styles.regionCount,
                    isSelected && styles.regionCountSelected,
                  ]}
                >
                  {getRegionCount(region)}
                </Text>
              </View>

              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <Icon name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedRegions.length > 0 && (
        <View style={styles.selectedSummary}>
          <Text style={styles.summaryText}>
            Đã chọn {selectedRegions.length} khu vực
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  clearButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  scrollView: {
    marginHorizontal: -4,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  regionChip: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: 80,
    position: 'relative',
  },
  regionChipSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipContent: {
    alignItems: 'center',
  },
  regionEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  regionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  regionTextSelected: {
    color: '#FFFFFF',
  },
  regionCount: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  regionCountSelected: {
    color: '#E0E7FF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default RegionFilter;
