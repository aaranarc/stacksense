/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@stacksense/contracts", "@stacksense/engine", "@stacksense/ai"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
