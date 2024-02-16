import { traverse } from './traverse'

/**
 * Filter the specification based on the callback
 */
export function filter(
  specification: Record<string, any>,
  callback: (schema: Record<string, any>) => boolean,
): Record<string, any> {
  return traverse(specification, (schema) => {
    return callback(schema) ? schema : undefined
  })
}
