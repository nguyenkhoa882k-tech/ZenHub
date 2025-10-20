module.exports = function (api) {
  api.cache(true);

  const presets = ['module:@react-native/babel-preset'];
  const plugins = [];

  // Temporarily disable nativewind to test basic functionality
  // if (
  //   process.env.NODE_ENV !== 'test' &&
  //   process.env.NODE_ENV !== 'production'
  // ) {
  //   plugins.push('nativewind/babel');
  // }

  return {
    presets,
    plugins,
  };
};
