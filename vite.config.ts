
import { defineConfig } from 'vite';

export default defineConfig({
  // Removed explicit define for process.env.API_KEY to ensure 
  // the platform's dynamic environment variables are not overwritten.
});
