import { AnyObject } from '../../types'
import { transformErrors } from '../Validator/transformErrors'
import { resolve } from './resolve'

export function checkRefs(tree: AnyObject) {
  try {
    resolve(tree, false)
    return { valid: true }
  } catch (err) {
    return { valid: false, errors: transformErrors(tree, err.message) }
  }
}
