import ViteYaml from '@modyfi/vite-plugin-yaml'
import { webpackStats } from 'rollup-plugin-webpack-stats'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [ViteYaml(), dts({ rollupTypes: true }), webpackStats()],
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: '@scalar/openapi-parser',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['node:fs', 'node:path'],
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
