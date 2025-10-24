import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for stability (can be re-enabled later)
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Add transpilePackages for better compatibility
  transpilePackages: ['@dfinity/agent', '@dfinity/principal', '@dfinity/candid'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthingy.s3.us-west-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
    }
    
    // Add module resolution fixes for React Server Components
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
};

export default nextConfig;
