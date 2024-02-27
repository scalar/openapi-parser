import type { Filesystem } from '../../types'
import { resolveReferences } from './resolveReferences'
import { transformErrors } from './transformErrors'

export function checkReferences(filesystem: Filesystem) {
  const entrypoint = filesystem.find((file) => file.isEntrypoint === true)

  try {
    resolveReferences(filesystem, false)

    return {
      valid: true,
    }
  } catch (err) {
    return {
      valid: false,
      errors: transformErrors(entrypoint, err.message),
    }
  }
}
