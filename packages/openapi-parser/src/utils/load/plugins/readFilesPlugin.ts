import { existsSync, readFileSync } from 'node:fs'

import { ERRORS } from '../../../configuration'
import { isJson } from '../../isJson'
import { isYaml } from '../../isYaml'
import { LoadPlugin } from '../load'

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
