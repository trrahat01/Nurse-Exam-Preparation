const path = require('path');

// Resolve the workspace root (parent of artifacts/mobile)
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = require('expo/metro-config').getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Ensure Metro can resolve packages from the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm (node-linker=hoisted) still keeps packages symlinked to the .pnpm store.
// Enable Metro symlink resolution so it uses the hoisted node_modules path
// instead of the .pnpm realpath (fixes "Unable to resolve ... expo-router/entry.js").
config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
