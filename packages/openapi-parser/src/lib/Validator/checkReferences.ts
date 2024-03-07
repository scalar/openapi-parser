import { AnyObject } from '../../types'
import { resolveReferences } from './resolveReferences'
import { transformErrors } from './transformErrors'

// TODO: Adapat for the new function
export function checkReferences(specification: AnyObject) {
  try {
    resolveReferences(specification)

    return {
      valid: true,
    }
  } catch (error) {
    return {
      valid: false,
      errors: transformErrors(specification, error.message),
    }
  }
}
