import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
