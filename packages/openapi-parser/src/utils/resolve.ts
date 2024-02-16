import { Validator } from '../lib'
import type { Filesystem, OpenAPI, ParseResult } from '../types'
import { makeFilesystem } from './makeFilesystem'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function resolve(
  value: string | Record<string, any> | Filesystem,
): Promise<ParseResult> {
  const validator = new Validator()
  const filesystem = makeFilesystem(value)

  const result = await validator.validate(filesystem)

  // Detach the specification from the validator
  // TODO: What if a filesystem with multiple files is passed?
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

  const schema = validator.resolveRefs(filesystem) as OpenAPI.Document

  return {
    valid: true,
    version: validator.version,
    specification,
    schema,
  }
}
