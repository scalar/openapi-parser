import json from '@rollup/plugin-json'
import { rm } from 'node:fs/promises'
import { builtinModules } from 'node:module'
import type { RollupOptions } from 'rollup'
import type { Plugin } from 'rollup'
import dts from 'rollup-plugin-dts'
import type { Options as ESBuildOptions } from 'rollup-plugin-esbuild'
import esbuild from 'rollup-plugin-esbuild'
import { webpackStats } from 'rollup-plugin-webpack-stats'

const input = `./src/index.ts`
const dir = 'dist'

/**
 * Remove the output directory.
 */
function cleanBeforeWrite(directory: string): Plugin {
  let removePromise: Promise<void>

  return {
    generateBundle(_options, _bundle, isWrite) {
      if (isWrite) {
        // Only remove before first write, but make all writes wait on the removal
        removePromise ??= rm(directory, {
          force: true,
          recursive: true,
        })

        return removePromise
      }
    },
    name: 'clean-before-write',
  }
}

/**
 * Minimal ESBuild minifier.
 */
function esbuildMinifer(options: ESBuildOptions) {
  const { renderChunk } = esbuild(options)

  return {
    name: 'esbuild-minifer',
    renderChunk,
  }
}

/**
 * Rollup configuration
 */
const config: RollupOptions[] = [
  // Code
  {
    input,
    output: [
      // ESM
      {
        dir,
        format: 'es',
        sourcemap: false,
        preserveModules: true,
      },
    ],
    plugins: [
      cleanBeforeWrite(dir),
      json(),
      esbuild({
        exclude: /node_modules/,
      }),
      esbuildMinifer,
      webpackStats(),
    ],
    external: [
      ...builtinModules,
      ...builtinModules.map((m) => `node:${m}`),
      'ajv/dist/2020',
      'ajv-draft-04',
      'ajv-formats',
      'yaml',
    ],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
  },
  // Types
  {
    input,
    output: [{ dir, format: 'es', sourcemap: false, preserveModules: true }],
    plugins: [dts()],
  },
]

export default config
