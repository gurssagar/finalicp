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
      
      // Exclude Node.js specific modules from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'ws': false,
        'bufferutil': false,
        'utf-8-validate': false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
