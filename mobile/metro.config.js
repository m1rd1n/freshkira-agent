const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-font's ExpoFontLoader.web.js passes a named function to registerWebModule().
// In production builds, Terser inlines the function as anonymous (function(){...}),
// which causes registerWebModule to throw "Module implementation must be a class"
// because it checks moduleImplementation.name for the module registry key.
// keep_fnames: true preserves function names through inlining, fixing the crash.
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  keep_fnames: true,
  keep_classnames: true,
};

module.exports = config;
