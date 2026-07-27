module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    // react-native-reanimated/plugin and react-native-worklets/plugin
    // are auto-included by babel-preset-expo in SDK 54
    // Do NOT add them manually to avoid duplicate plugin errors
  };
};