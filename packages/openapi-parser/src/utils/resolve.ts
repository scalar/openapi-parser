import { Validator } from '../lib'
import type { AnyObject, Filesystem, OpenAPI, ResolveResult } from '../types'
import { makeFilesystem } from './makeFilesystem'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function resolve(
  value: string | AnyObject | Filesystem,
): Promise<ResolveResult> {
  const validator = new Validator()
  const filesystem = makeFilesystem(value)
  const result = await validator.validate(filesystem)

  // Detach the specification from the validator
  // TODO: What if a filesystem with multiple files is passed?
  const specification = structuredClone(
    validator.specification,
  ) as OpenAPI.Document

  // Error handling
  // if (!result.valid) {
  //   return {
  //     valid: false,
  //     version: undefined,
  //     errors: result.errors,
  //   }
  // }

  const schema = validator.resolveReferences(filesystem)

  return {
    valid: result.valid,
    version: validator.version,
    errors: result.errors,
    specification,
    schema,
  }
}
