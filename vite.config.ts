/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 纯静态 SPA：hash 路由，部署在根路径，任何静态服务器零配置可托管
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
