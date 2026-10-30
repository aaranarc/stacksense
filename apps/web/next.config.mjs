import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@stacksense/contracts', '@stacksense/engine', '@stacksense/ai'],
  cacheComponents: true,
  partialPrefetching: true,
  webpack(config) {
    function addTailwind(rules) {
      for (const rule of rules) {
        if (!rule || typeof rule !== 'object') continue;
        if (Array.isArray(rule.use) && rule.use.some(entry => entry?.loader?.includes('postcss-loader'))) {
          rule.use.push({ loader: require.resolve('@tailwindcss/turbopack') });
        }
        if (rule.oneOf) addTailwind(rule.oneOf);
        if (rule.rules) addTailwind(rule.rules);
      }
    }
    addTailwind(config.module.rules);
    return config;
  },
};
export default nextConfig;
