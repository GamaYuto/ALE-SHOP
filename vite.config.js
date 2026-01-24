import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Para Firebase Hosting, generalmente usamos la raíz '/'
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});
