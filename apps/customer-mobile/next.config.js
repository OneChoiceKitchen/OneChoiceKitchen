//@ts-check
const { composePlugins, withNx } = require('@nx/next');

/** @type {import('@nx/next/plugins/with-nx').WithNxOptions} */
const nextConfig = {
  nx: {},
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://127.0.0.1:3000/api/:path*' },
      { source: '/images/:path*', destination: 'http://127.0.0.1:4208/images/:path*' },
      { source: '/uploads/:path*', destination: 'http://127.0.0.1:4208/uploads/:path*' },
    ];
  },
};

module.exports = composePlugins(withNx)(nextConfig);
