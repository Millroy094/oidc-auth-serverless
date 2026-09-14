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
        },
      },
    },
    build: {
      rollupOptions: {
        plugins: [
          {
            name: 'exclude-test-files',
            enforce: 'post',
            resolveId(source: string) {
              if (source.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/)) {
                return { id: source, external: true };
              }
            },
          },
        ],
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './setup.ts',
    },
  };
  return defineConfig(config);
};
