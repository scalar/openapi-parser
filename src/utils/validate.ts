import { Validator } from '@seriousme/openapi-schema-validator'
import type { ValidationResult } from '../types'

/**
 * Validates an OpenAPI schema.
 */
export async function validate(value: string): Promise<ValidationResult> {
  const validator = new Validator()
  const result = await validator.validate(value)

  return result
}
