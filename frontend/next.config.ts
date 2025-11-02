import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint and TypeScript checks during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
