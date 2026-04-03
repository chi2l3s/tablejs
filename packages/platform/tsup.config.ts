import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['vite'],
  },
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
    clean: false,
  },
])
