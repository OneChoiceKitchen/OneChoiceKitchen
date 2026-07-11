const { composePlugins, withNx } = require('@nx/webpack');

// Nx composable webpack plugin — do not remove
module.exports = composePlugins(withNx(), (config) => {
  // SQLite externals: prevent webpack from bundling native bindings
  config.externals = [
    ...(config.externals || []),
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
    '@prisma/client',
  ];
  return config;
});
