import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      exclude: [
        'demo/*',
        'scripts/*',
        'vitest.workspace.ts',
        '**/createProfile.ts',
        '**/*.bench.ts',
      ],
    },
    reporters: ['default', 'json'],
    outputFile: './coverage/coverage-summary.json',
  },
})
