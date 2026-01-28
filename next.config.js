/** @type {import('next').NextConfig} */
function getHostnameFromUrl(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.hostname || null;
  } catch {
    return null;
  }
}

const s3PublicBaseHostname = getHostnameFromUrl(process.env.AWS_S3_PUBLIC_BASE_URL);

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '',
        pathname: '/**',
      },
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
      ...(s3PublicBaseHostname
        ? [
            {
              protocol: 'https',
              hostname: s3PublicBaseHostname,
              port: '',
              pathname: '/**',
            },
          ]
        : []),
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