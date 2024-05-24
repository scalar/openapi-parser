import { builtinModules } from 'node:module'
import { webpackStats } from 'rollup-plugin-webpack-stats'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [dts({ rollupTypes: true }), webpackStats()],
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: '@scalar/openapi-parser',
      formats: ['es'],
    },
    rollupOptions: {
      external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
    },
  },
  test: {
    coverage: {
      exclude: ['scripts', 'tests'],
      enabled: false,
      reporter: 'text',
    },
  },
})
