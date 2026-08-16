// Learn more: https://docs.expo.dev/guides/customizing-metro/
// Expo's default config auto-detects this pnpm monorepo. Do NOT override
// nodeModulesPaths / watchFolders here — overriding them breaks Expo's pnpm
// resolution (Metro then mis-resolves expo/AppEntry.js and the build fails).
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);