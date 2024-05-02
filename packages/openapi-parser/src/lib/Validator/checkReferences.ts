import { AnyObject, Filesystem } from '../../types'
import { resolveReferences } from './resolveReferences'
import { transformErrors } from './transformErrors'

// TODO: Adapat for the new function
export function checkReferences(value: AnyObject | Filesystem) {
  try {
    // TODO: This actually resolves all references. We could pass an option to make a dry run (tiny performance
    // improvement) or we return the schema, so the user can use it. Not doing anything with it, is a waste of
    // resources, though.
    const result = resolveReferences(value)

    return {
      valid: result?.valid ?? false,
      errors: result?.errors ?? [],
      // schema: schema,
    }
  } catch (error) {
    return {
      valid: false,
      errors: transformErrors(undefined, error.message),
    }
  }
}
