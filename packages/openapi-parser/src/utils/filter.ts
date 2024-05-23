import type { AnyObject } from '../types'
import { getEntrypoint } from './getEntrypoint'
import { makeFilesystem } from './makeFilesystem'
import { traverse } from './traverse'

/**
 * Filter the specification based on the callback
 */
export function filter(
  specification: AnyObject,
  callback: (schema: AnyObject) => boolean,
): AnyObject {
  const filesystem = makeFilesystem(specification)

  return traverse(getEntrypoint(filesystem).specification, (schema) => {
    return callback(schema) ? schema : undefined
  })
}
