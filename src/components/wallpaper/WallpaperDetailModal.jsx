import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Share from 'react-native-share';
import {
  getPhotoDetails,
  trackDownload,
  addToFavorites,
  removeFromFavorites,
  isFavorite,
} from '../../services/wallpaperService';

const { width, height } = Dimensions.get('window');

const WallpaperDetailModal = ({ visible, wallpaper, onClose }) => {
  const [photoDetails, setPhotoDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPhotoFavorite, setIsPhotoFavorite] = useState(false);

  useEffect(() => {
    if (visible && wallpaper) {
      loadPhotoDetails();
      checkFavoriteStatus();
    }
  }, [visible, wallpaper?.id]); // Only depend on wallpaper ID to avoid recreating functions

  const loadPhotoDetails = async () => {
    try {
      setLoading(true);
      const details = await getPhotoDetails(wallpaper.id);
      setPhotoDetails(details);
    } catch (error) {
      console.error('Error loading photo details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chi tiết hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await isFavorite(wallpaper.id);
      setIsPhotoFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleShare = async () => {
    try {
      const shareOptions = {
        title: `Hình nền đẹp từ ${wallpaper.author}`,
        message: `Xem hình nền tuyệt đẹp này từ ${wallpaper.author}`,
        url: wallpaper.urls?.regular || wallpaper.url || wallpaper.fullUrl,
      };

      await Share.open(shareOptions);
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing:', error);
        Alert.alert('Lỗi', 'Không thể chia sẻ hình ảnh');
      }
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Track download with Unsplash
      const success = await trackDownload(wallpaper.id);

      if (success) {
        Alert.alert(
          'Tải xuống thành công',
          'Hình ảnh đã được tải xuống và lưu vào thư viện của bạn',
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert('Lỗi', 'Không thể tải xuống hình ảnh');
      }
    } catch (error) {
      console.error('Error downloading:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tải xuống');
    } finally {
      setDownloading(false);
    }
  };

  const handleFavorite = async () => {
    try {
      if (isPhotoFavorite) {
        await removeFromFavorites(wallpaper.id);
        setIsPhotoFavorite(false);
        Alert.alert('Đã xóa', 'Đã xóa khỏi danh sách yêu thích');
      } else {
        await addToFavorites(wallpaper);
        setIsPhotoFavorite(true);
        Alert.alert('Đã thêm', 'Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh sách yêu thích');
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatNumber = num => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (!wallpaper) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />

      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFavorite}
            >
              <Icon
                name={isPhotoFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isPhotoFavorite ? '#FF6B6B' : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Icon name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                wallpaper.urls?.regular || wallpaper.url || wallpaper.fullUrl,
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Info Panel */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.bottomPanel}
        >
          <ScrollView
            style={styles.infoContainer}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                {/* Title & Author */}
                <Text style={styles.title} numberOfLines={2}>
                  {photoDetails?.title || wallpaper.title}
                </Text>

                <TouchableOpacity style={styles.authorContainer}>
                  <Text style={styles.authorLabel}>Tác giả:</Text>
                  <Text style={styles.authorName}>{wallpaper.author}</Text>
                </TouchableOpacity>

                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Icon name="heart" size={16} color="#FF6B6B" />
                    <Text style={styles.statText}>
                      {formatNumber(wallpaper.likes)} lượt thích
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Icon name="download" size={16} color="#4CAF50" />
                    <Text style={styles.statText}>
                      {formatNumber(wallpaper.downloads)} lượt tải
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Icon name="resize" size={16} color="#2196F3" />
                    <Text style={styles.statText}>
                      {wallpaper.width} × {wallpaper.height}
                    </Text>
                  </View>
                </View>

                {/* Additional Info */}
                {photoDetails?.createdAt && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ngày tạo:</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(photoDetails.createdAt)}
                    </Text>
                  </View>
                )}

                {photoDetails?.tags && photoDetails.tags.length > 0 && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Thẻ:</Text>
                    <Text style={styles.infoValue}>
                      {photoDetails.tags.join(', ')}
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Download Button */}
          <TouchableOpacity
            style={[
              styles.downloadButton,
              downloading && styles.downloadButtonDisabled,
            ]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Icon name="download" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.downloadButtonText}>
              {downloading ? 'Đang tải...' : 'Tải xuống'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    paddingTop: 60,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 28,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginRight: 8,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonDisabled: {
    backgroundColor: '#666666',
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WallpaperDetailModal;
