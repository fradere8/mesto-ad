import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/mesto-ad/',
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
    port: 3000,     
  },
});