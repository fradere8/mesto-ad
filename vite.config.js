import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  root: '.', 
  build: {
    outDir: 'dist',     
    emptyOutDir: true,  
    rollupOptions: {
      input: resolve(__dirname, 'src/scripts/index.js'), 
    },
  },
  server: {
    open: true,         
  },
});