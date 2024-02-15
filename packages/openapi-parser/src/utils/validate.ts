import { Validator } from '../lib'
import type { ValidateOptions, ValidateResult } from '../types'

/**
 * Validates an OpenAPI schema.
 */
export async function validate(
  value: string | Record<string, any>,
  options?: ValidateOptions,
): Promise<ValidateResult> {
  const validator = new Validator()
  const result = await validator.validate(value, options)

  return {
    ...result,
    specification: validator.specification,
    version: validator.version,
  }
}
