module.exports = function (api) {
  api.cache(true);

  const presets = ['module:@react-native/babel-preset'];
  const plugins = [];

  // Only add nativewind plugin when not in test environment
  if (process.env.NODE_ENV !== 'test') {
    plugins.push('nativewind/babel');
  }

  return {
    presets,
    plugins,
  };
};
