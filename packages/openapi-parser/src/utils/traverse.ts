/**
 * Recursively traverses the specification and applies the transform function to each node.
 */
export function traverse(
  specification: Record<string, any>,
  transform: (specification: Record<string, any>) => Record<string, any>,
) {
  const result: Record<string, any> = {}

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
