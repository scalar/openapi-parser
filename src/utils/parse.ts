import { Validator } from '@seriousme/openapi-schema-validator'
import { ParseResult } from '../types'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function parse(value: string): Promise<ParseResult> {
  const validator = new Validator()

  const result = await validator.validate(value)

  if (!result.valid) {
    throw new Error(`Invalid Schema: ${result.errors}`)
  }

  return validator.resolveRefs() as ParseResult
}
