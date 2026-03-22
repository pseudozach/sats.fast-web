import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        source: '/.well-known/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/lnurlp/:username',
        destination: '/api/lnurlp/:username',
      },
      {
        source: '/.well-known/liquid/:username',
        destination: '/api/liquid-info/:username',
      },
      {
        source: '/lnurl/payreq/:username',
        destination: '/api/lnurl-payreq/:username',
      },
      {
        source: '/liquid/payreq/:username',
        destination: '/api/liquid-payreq/:username',
      },
    ];
  },
  serverExternalPackages: ['@buildonspark/spark-sdk'],
};

export default nextConfig;
