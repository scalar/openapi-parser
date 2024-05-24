import { resolveReferences } from '../lib'
import type { AnyObject, Filesystem, ResolveResult } from '../types'
import { details } from './details'
import { getEntrypoint } from './getEntrypoint'
import { makeFilesystem } from './makeFilesystem'

/**
 * Validates an OpenAPI schema and resolves all references.
 */
export async function dereference(
  value: string | AnyObject | Filesystem,
): Promise<ResolveResult> {
  const filesystem = makeFilesystem(value)

  const entrypoint = getEntrypoint(filesystem)
  const result = resolveReferences(filesystem)

  return {
    specification: result.schema,
    errors: result.errors,
    schema: result.schema,
    ...details(entrypoint.specification),
  }
}
