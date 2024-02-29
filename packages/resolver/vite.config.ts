import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: '@scalar/openapi-parser',
      formats: ['es'],
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
