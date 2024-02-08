import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: '@scalar/openapi-parser',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['@seriousme/openapi-schema-validator'],
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
