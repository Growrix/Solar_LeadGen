/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
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
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      // AWS S3 public hosts (when AWS_S3_PUBLIC_BASE_URL is not used)
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig