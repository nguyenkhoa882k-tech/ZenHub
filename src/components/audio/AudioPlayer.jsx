import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { NOTES_CONFIG } from '../../config/notes/notesConfig';

const AudioPlayer = ({ filePath, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressWidth = () => {
    if (!duration || duration === 0) return '0%';
    const percentage = Math.round((currentTime / duration) * 100);
    return `${Math.min(percentage, 100)}%`;
  };

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        // Pause logic would go here
        setIsPlaying(false);
        Alert.alert('Thông báo', 'Tạm dừng phát audio');
      } else {
        // Play logic would go here
        setIsPlaying(true);
        Alert.alert('Thông báo', `Đang phát file: ${filePath}`);

        // Simulate playback for now
        setTimeout(() => {
          setIsPlaying(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      Alert.alert('Lỗi', 'Không thể phát audio');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.audioInfo}>
        <Icon
          name="musical-notes"
          size={20}
          color={NOTES_CONFIG.COLORS.PRIMARY}
        />
        <Text style={styles.fileName}>
          Ghi âm {duration ? `(${formatTime(duration)})` : ''}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: getProgressWidth() }]} />
        </View>
      </View>

      <Text style={styles.filePath} numberOfLines={1}>
        📁 {filePath}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: NOTES_CONFIG.COLORS.BORDER,
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileName: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.BASE,
    fontWeight: '600',
    color: NOTES_CONFIG.COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.SM,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: NOTES_CONFIG.COLORS.BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NOTES_CONFIG.COLORS.PRIMARY,
  },
  filePath: {
    fontSize: NOTES_CONFIG.TEXT_SIZES.XS,
    color: NOTES_CONFIG.COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
});

export default AudioPlayer;
