import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure process.env.API_KEY is replaced with a string, defaulting to empty if undefined
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});