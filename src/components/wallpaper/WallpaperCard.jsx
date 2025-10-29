import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with margin

const WallpaperCard = ({ wallpaper, onPress, onFavoritePress, isFavorite }) => {
  // Ensure we have required data
  if (!wallpaper || !wallpaper.id) {
    return (
      <View style={[styles.card, styles.errorCard]}>
        <Text style={styles.errorText}>Lỗi tải hình ảnh</Text>
      </View>
    );
  }

  // Get image URL with fallbacks
  const imageUrl =
    wallpaper.urls?.small ||
    wallpaper.thumbnail ||
    wallpaper.url ||
    wallpaper.urls?.regular ||
    'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={error => console.log('Image load error:', error)}
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />

        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => onFavoritePress(wallpaper)}
        >
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#FF6B6B' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Info Overlay */}
        <View style={styles.infoOverlay}>
          <Text style={styles.authorName} numberOfLines={1}>
            {wallpaper.author || 'Unknown Author'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="heart" size={12} color="#FFFFFF" />
              <Text style={styles.statText}>{wallpaper.likes || 0}</Text>
            </View>

            <View style={styles.statItem}>
              <Icon name="download" size={12} color="#FFFFFF" />
              <Text style={styles.statText}>{wallpaper.downloads || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 1.6, // 16:10 aspect ratio
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  errorCard: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
});

export default WallpaperCard;
