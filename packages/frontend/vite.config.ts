import dotenv from 'dotenv';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

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
    define: {
      'process.env': process.env,
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_ENDPOINT,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
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
