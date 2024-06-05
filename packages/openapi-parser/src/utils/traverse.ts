import { AnyObject } from '../types'

/**
 * Recursively traverses the specification and applies the transform function to each node.
 *
 * TODO: Use JSON.stringify? Is that faster?
 */
export function traverse(
  specification: AnyObject,
  transform: (specification: AnyObject) => AnyObject,
) {
  const result: AnyObject = {}

  for (const [key, value] of Object.entries(specification)) {
    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return traverse(item, transform)
        }

        return item
      })
    } else if (typeof value === 'object' && value !== null) {
      result[key] = traverse(value, transform)
    } else {
      result[key] = value
    }
  }

  return transform(result)
}
