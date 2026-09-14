import dotenv from 'dotenv';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

dotenv.config();

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const config = {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          exportType: 'default',
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: '**/*.svg',
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': process.env,
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_ENDPOINT || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          // Ministack (local AWS emulator) routes API Gateway requests by
          // Host header rather than by a real DNS name/path, and expects
          // the stage name as a path prefix. VITE_API_GATEWAY_HOST/STAGE
          // are only set for local dev (see setup-local-dev.sh); against a
          // real backend they're unset and the proxy passes requests
          // through unchanged.
          ...(process.env.VITE_API_GATEWAY_STAGE && {
            rewrite: (requestPath: string) => `/${process.env.VITE_API_GATEWAY_STAGE}${requestPath}`,
          }),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (process.env.VITE_API_GATEWAY_HOST) {
                proxyReq.setHeader('Host', process.env.VITE_API_GATEWAY_HOST);
              }
            });
          },
        },
      },
    },
  };
  return defineConfig(config);
};
