const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: [
      'bin',
      'txt',
      'jpg',
      'png',
      'json',
      'mp3',
      'ttf',
      'wav',
      'm4a',
      'aac',
    ],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'svg'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
