import { Validator } from '../lib'
import type { ValidateOptions, ValidationResult } from '../types'

/**
 * Validates an OpenAPI schema.
 */
export async function validate(
  value: string,
  options?: ValidateOptions,
): Promise<ValidationResult> {
  const validator = new Validator()
  const result = await validator.validate(value, options)

  return result
}
