import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Docker dev: VITE_DEV_API_PROXY=http://back-end:5000
 * Host dev: default http://127.0.0.1:5000
 */
const devApiProxyTarget = process.env.VITE_DEV_API_PROXY || 'http://127.0.0.1:5000';

// https://vitest.dev/config/#configuration
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['jadishly-agential-marlyn.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: devApiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'node',
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['**/*.test.{js,jsx}', '**/main.jsx'],
    },
  },
});
