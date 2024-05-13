import { existsSync, readFileSync } from 'node:fs'

import { ERRORS } from '../configuration'
import { makeFilesystem } from './makeFilesystem'

export type LoadPlugin = {
  check: (value?: any) => boolean
  get: (value: any) => any
}

export const loadFilesPlugin: LoadPlugin = {
  check(value?: any) {
    if (typeof value !== 'string') {
      return false
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
      return false
    }

    return true
  },
  async get(value?: any) {
    if (!existsSync(value)) {
      throw new Error(ERRORS.FILE_DOES_NOT_EXIST.replace('%s', value))
    }

    try {
      return readFileSync(value, 'utf-8')
    } catch (error) {
      console.error('[loadFilesPlugin]', error)
    }
  },
}

// TODO: Make configurable
const plugins: LoadPlugin[] = [loadFilesPlugin]

export async function load(value: any) {
  for (const plugin of plugins) {
    if (plugin.check(value)) {
      const content = await plugin.get(value)

      // TODO: Fetch references

      return makeFilesystem(content)
    }
  }
}
