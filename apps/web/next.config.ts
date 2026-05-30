import type { NextConfig } from "next";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // For development stability
  },
};

export default nextConfig;
