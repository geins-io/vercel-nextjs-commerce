import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'], // Add allowed image domains here
  },
  env: {
    CUSTOM_ENV_VARIABLE: process.env.CUSTOM_ENV_VARIABLE || 'defaultValue',
  },
  webpack: (config) => {
    // Add custom Webpack rules here
    config.module.rules.push({
      test: /\.(graphql|gql)$/, // Match .graphql and .gql files
      exclude: /node_modules/, // Exclude files in node_modules
      loader: 'graphql-tag/loader', // Use graphql-tag loader
    });

    return config;
  },
};

export default nextConfig;
