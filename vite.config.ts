import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages under any repository name, or on any static host.
export default defineConfig({
  base: './',
  test: { environment: 'node' },
} as never);
