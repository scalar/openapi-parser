import type { AnyObject } from '../types'
import { traverse } from './traverse'

/**
 * Filter the specification based on the callback
 */
export function filter(
  specification: AnyObject,
  callback: (schema: AnyObject) => boolean,
): AnyObject {
  return traverse(specification, (schema) => {
    return callback(schema) ? schema : undefined
  })
}
