import { spec } from 'node:test/reporters'
import YAML from 'yaml'

import { Filesystem } from '../types'
import { isFilesystem } from './isFilesystem'

/**
 * Normalize the OpenAPI specification to a JavaScript object.
 * Don’t touch the object if it’s a `Filesystem` (multiple files).
 */
export function normalize(
  specification: string | Record<string, any> | Filesystem,
): Record<string, any> | Filesystem {
  if (isFilesystem(specification)) {
    return specification as Filesystem
  }

  if (typeof specification === 'string') {
    try {
      return JSON.parse(specification)
    } catch (error) {
      return YAML.parse(specification)
    }
  }

  return specification
}
