import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  /* config options here */
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  reactCompiler: true,
  output: 'standalone',
  turbopack: {
    resolveAlias: {
      'module': { browser: './src/empty.js' },
      'fs': { browser: './src/empty.js' },
      'path': { browser: './src/empty.js' },
      'url': { browser: './src/empty.js' },
    }
  },
  allowedDevOrigins: [
    "quad-kodak-speech-appointment.trycloudflare.com",
    'gather-mailto-periodically-detect.trycloudflare.com'
  ],
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        crypto: false,
        url: false,
        module: false
      };
    }
    return config;
  },
};


const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
