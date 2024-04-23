import { AnyObject } from '../../types'
import { resolveReferences } from './resolveReferences'
import { transformErrors } from './transformErrors'

// TODO: Adapat for the new function
export function checkReferences(specification: AnyObject) {
  try {
    // TODO: This actually resolves all references. We could pass an option to make a dry run (tiny performance
    // improvement) or we return the schema, so the user can use it. Not doing anything with it, is a waste of
    // resources, though.
    resolveReferences(specification)

    return {
      valid: true,
      // schema: schema,
    }
  } catch (error) {
    return {
      valid: false,
      errors: transformErrors(specification, error.message),
    }
  }
}
