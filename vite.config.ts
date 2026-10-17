import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createSbdApiMiddleware } from './server/sbdServerMiddleware';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'sbd-rest-api-server',
      configureServer(server) {
        server.middlewares.use(createSbdApiMiddleware());
      },
    },
  ],
  server: {
    port: 5173,
    host: true,
  },
});
