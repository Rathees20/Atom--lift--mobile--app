const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for additional file extensions
config.resolver.sourceExts.push('cjs');

// Add Node.js polyfills for web builds
config.resolver.alias = {
  ...config.resolver.alias,
  stream: 'stream-browserify',
  crypto: 'crypto-browserify',
  buffer: 'buffer',
  process: 'process/browser',
};

// Configure transformer for better web support
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
