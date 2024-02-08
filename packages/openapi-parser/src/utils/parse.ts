import { Validator } from '../lib'
import type { OpenAPI, ParseResult } from '../types'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function parse(value: string): Promise<ParseResult> {
  const validator = new Validator()

  const result = await validator.validate(value)

  if (!result.valid) {
    return {
      valid: false,
      errors: result.errors,
    }
  }

  return {
    valid: true,
    document: validator.resolveRefs() as OpenAPI.Document,
  }
}
