/// <reference types='vitest' />
import { defineConfig } from 'vite';
import type { ViteDevServer, Connect } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

function seoMockPlugin() {
  return {
    name: 'seo-mock-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        if (req.url === '/api/seo/metadata/home' || req.url === '/api/seo/settings') {
          const seoPath = path.resolve(__dirname, '../../../libs/ui-design-system/src/lib/global-metadata/seo.json');
          if (req.method === 'GET') {
            try {
              const data = fs.readFileSync(seoPath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } catch (err) {
              res.statusCode = 404;
              res.end('{}');
            }
            return;
          } else if (req.method === 'PUT') {
            let body = '';
            req.on('data', (chunk: Buffer) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              fs.writeFileSync(seoPath, body);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            });
            return;
          }
        }
        next();
      });
    },
  };
}


export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/apps/admin/admin-portal',

  server: {
    port: 4205,
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
        target: 'http://127.0.0.1:4208',
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

  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']), seoMockPlugin()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: '../../../dist/apps/admin/admin-portal',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  optimizeDeps: {
    // Prevent repeated re-optimization that can cause stack overflow on Windows
    force: false,
    holdUntilCrawlEnd: false,
  },
});
