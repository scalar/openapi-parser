import { Validator } from '../lib'
import type { AnyObject, Filesystem, OpenAPI, ValidateResult } from '../types'
import { makeFilesystem } from './makeFilesystem'

/**
 * Validates an OpenAPI schema.
 */
export async function validate(
  value: string | AnyObject | Filesystem,
): Promise<ValidateResult> {
  const validator = new Validator()
  const filesystem = makeFilesystem(value)
  const result = await validator.validate(filesystem)

  return {
    ...result,
    specification: validator.specification as OpenAPI.Document,
    version: validator.version,
  }
}
