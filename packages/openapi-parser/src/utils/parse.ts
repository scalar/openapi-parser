import { Validator } from '../lib'
import type { OpenAPI, ParseResult } from '../types'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function parse(
  value: string | Record<string, any>,
): Promise<ParseResult> {
  const validator = new Validator()

  const result = await validator.validate(value)

  if (!result.valid) {
    return {
      valid: false,
      version: undefined,
      errors: result.errors,
    }
  }

  const document = validator.resolveRefs() as OpenAPI.Document

  return {
    valid: true,
    version: validator.version,
    document,
  }
}
