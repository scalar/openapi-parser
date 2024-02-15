import { Validator } from '../lib'
import type { OpenAPI, ParseResult } from '../types'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function resolve(
  value: string | Record<string, any>,
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

  const schema = validator.resolveRefs() as OpenAPI.Document

  return {
    valid: true,
    version: validator.version,
    specification,
    schema,
  }
}
