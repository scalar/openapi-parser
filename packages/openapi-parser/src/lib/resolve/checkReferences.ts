import { AnyObject } from '../../types'
import { transformErrors } from '../Validator/transformErrors'
import { resolveReferences } from './resolveReferences'

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
