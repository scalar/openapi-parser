import { existsSync, readFileSync } from 'node:fs'
import YAML from 'yaml'

import { ERRORS } from '../configuration'
import { makeFilesystem } from './makeFilesystem'

export type LoadPlugin = {
  check: (value?: any) => boolean
  get: (value: any) => any
}

export const readFilesPlugin: LoadPlugin = {
  check(value?: any) {
    // Not a string
    if (typeof value !== 'string') {
      return false
    }

    // URL
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return false
    }

    // Line breaks
    if (value.includes('\n')) {
      return false
    }

    // JSON
    if (isJson(value)) {
      return false
    }

    // YAML (run through YAML.parse)
    if (isYaml(value)) {
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
      console.error('[readFilesPlugin]', error)
    }
  },
}

export function isJson(value: string) {
  try {
    JSON.parse(value)

    return true
  } catch {
    return false
  }
}

export function isYaml(value: string) {
  // Line breaks
  if (!value.includes('\n')) {
    return false
  }

  try {
    YAML.parse(value)
    return true
  } catch (error) {
    console.log('ADSAS', error)
    return false
  }
}

export const fetchUrlsPlugin: LoadPlugin = {
  check(value?: any) {
    // Not a string
    if (typeof value !== 'string') {
      return false
    }

    // Not http/https
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return false
    }

    return true
  },
  async get(value?: any) {
    try {
      const response = await fetch(value)

      return await response.text()
    } catch (error) {
      console.error('[fetchUrlsPlugin]', error)
    }
  },
}

export async function load(
  value: any,
  options?: {
    plugins?: LoadPlugin[]
  },
) {
  for (const plugin of options?.plugins ?? []) {
    if (plugin.check(value)) {
      const content = await plugin.get(value)

      return makeFilesystem(content)
    }
  }

  return makeFilesystem(value)
}
