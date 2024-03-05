import { AnyObject } from '../../types'
import { transformErrors } from '../Validator/transformErrors'
import { resolve } from './resolve'

export function checkReferences(specification: AnyObject) {
  try {
    resolve(specification, false)

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
