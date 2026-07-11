/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/apps/rider/rider-portal',

  server: {
    port: 4207,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/images/Menu_Items': {
        target: 'http://localhost:4208',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4208',
        changeOrigin: true,
      },
      '/images/Tiffin_Items': {
        target: 'http://localhost:4208',
        changeOrigin: true,
      },
      '/tiffin-flyers': {
        target: 'http://127.0.0.1:4208',
        changeOrigin: true,
      }
    }
  },

  resolve: {
    dedupe: ['react', 'react-dom'],
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: '../../../dist/apps/rider/rider-portal',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
