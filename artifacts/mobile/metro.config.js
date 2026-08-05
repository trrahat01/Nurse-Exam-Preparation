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

module.exports = config;
