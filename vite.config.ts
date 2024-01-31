import { defineConfig } from 'vitest/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    // TODO: Doesn’t even work
    // https://github.com/ajv-validator/ajv/issues/1744
    nodePolyfills({
      // To exclude specific polyfills, add them to this list.
      exclude: [],
      // Whether to polyfill specific globals.
      globals: {
        Buffer: true, // can also be 'build', 'dev', or false
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
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
      enabled: true,
      reporter: 'text',
    },
  },
})
