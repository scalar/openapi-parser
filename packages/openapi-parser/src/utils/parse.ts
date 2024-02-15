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
  // const specification = { ...(validator.specification as OpenAPI.Document) }
  // get validator.specification but detach from original object
  const specification = JSON.parse(
    JSON.stringify(validator.specification),
  ) as OpenAPI.Document

  if (!result.valid) {
    return {
      valid: false,
      version: undefined,
      errors: result.errors,
    }
  }

  // const schema = {} as OpenAPI.Document
  const schema = validator.resolveRefs() as OpenAPI.Document

  return {
    valid: true,
    version: validator.version,
    specification,
    schema,
  }
}
