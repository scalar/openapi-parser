import { Validator } from '../lib'
import { ParseResult } from '../types'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function parse(value: string): Promise<ParseResult> {
  const validator = new Validator()

  const result = await validator.validate(value)

  if (!result.valid) {
    throw new Error(JSON.stringify(result.errors, null, 2))
  }

  return validator.resolveRefs() as ParseResult
}
