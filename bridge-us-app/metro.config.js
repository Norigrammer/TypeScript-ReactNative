const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * Exclude nested BridgeUsApp to avoid mixed project transforms.
 */
const config = getDefaultConfig(__dirname);

// Restrict Metro to only watch the current project root
config.watchFolders = [path.resolve(__dirname)];

config.resolver = config.resolver || {};
// Block any files under BridgeUsApp (Windows or POSIX paths)
config.resolver.blockList = /BridgeUsApp[\\/].*/;

module.exports = config;
