import React from 'react';
import { View, StyleSheet } from 'react-native';
import NotesHome from './notes/NotesHome';
import { createBannerAd } from '../services/adsService';
import { NOTES_CONFIG } from '../config/notes/notesConfig';

const NotesScreen = () => {
  return (
    <View style={styles.container}>
      <NotesHome />

      {/* Banner Ad */}
      <View style={styles.adContainer}>{createBannerAd('self-center')}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOTES_CONFIG.COLORS.BACKGROUND,
  },
  adContainer: {
    backgroundColor: '#FF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#CC0000',
  },
});

export default NotesScreen;
