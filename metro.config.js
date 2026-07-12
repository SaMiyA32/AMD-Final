const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add 'cjs' for Firebase compatibility
config.resolver.sourceExts.push('cjs');

module.exports = withNativeWind(config, { input: "./global.css" });
