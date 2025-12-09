import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react({
          // Exclude pdf components from HMR
          exclude: /components\/pdf\//,
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'global': {},
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'stream': 'stream-browserify',
          'zlib': 'browserify-zlib',
          'util': 'util',
          'buffer': 'buffer',
        }
      }
    };
});
