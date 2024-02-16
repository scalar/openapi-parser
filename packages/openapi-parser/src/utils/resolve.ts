import { Validator } from '../lib'
import type { Filesystem, OpenAPI, ParseResult } from '../types'
import { isFilesystem } from './isFilesystem'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function resolve(
  value: string | Record<string, any> | Filesystem,
): Promise<ParseResult> {
  const validator = new Validator()

  const result = await validator.validate(value)

  // Detach the specification from the validator
  const specification = JSON.parse(
    JSON.stringify(validator.specification ?? null),
  ) as OpenAPI.Document

  // Error handling
  if (!result.valid) {
    return {
      valid: false,
      version: undefined,
      errors: result.errors,
    }
  }

  const schema = validator.resolveRefs(
    isFilesystem(value) ? (value as Filesystem) : undefined,
  ) as OpenAPI.Document

  return {
    valid: true,
    version: validator.version,
    specification,
    schema,
  }
}
