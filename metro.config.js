const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Support `@` alias pointing to project root
config.resolver = {
  ...config.resolver,
  alias: {
    ...(config.resolver.alias || {}),
    '@': path.resolve(__dirname)
  }
};

module.exports = config; 