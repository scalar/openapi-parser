import YAML from 'yaml'

/**
 * Normalize the OpenAPI specification to a JavaScript object.
 */
export function normalize(
  specification: string | Record<string, any>,
): Record<string, any> {
  if (typeof specification === 'string') {
    try {
      return JSON.parse(specification)
    } catch (error) {
      return YAML.parse(specification)
    }
  }

  return specification
}
