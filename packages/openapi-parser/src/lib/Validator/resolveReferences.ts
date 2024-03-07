import { ERRORS } from '../../configuration'
import { AnyObject, ResolvedOpenAPI } from '../../types'
import { unescapeJsonPointer } from './unescapeJsonPointer'

// TODO: Add support for all pointer words
// export const pointerWords = new Set([
//   '$ref',
//   '$id',
//   '$anchor',
//   '$dynamicRef',
//   '$dynamicAnchor',
//   '$schema',
// ])

/**
 * Takes a specification and resolves all references.
 */
export function resolveReferences(input: AnyObject) {
  // Detach from input
  const specification = structuredClone(input)

  // Recursively resolve all references
  resolve(specification)

  // If we replace references with content, that includes a reference, we can’t deal with that right-away.
  // That’s why we need a second run.
  resolve(specification)

  // Return the resolved specification
  return specification as ResolvedOpenAPI.Document

  /**
   * Resolves the circular reference to an object and deletes the $ref properties.
   */
  function resolve(schema: AnyObject) {
    // Iterate over the whole objecct
    Object.entries(schema ?? {}).forEach(([key, value]) => {
      // Ignore parts without a reference
      if (schema.$ref !== undefined) {
        // Find the referenced content
        const target = resolveUri(specification, schema.$ref)

        if (target === undefined) {
          throw new Error(ERRORS.INVALID_REFERENCE.replace('%s', schema.$ref))
        }

        // Get rid of the reference
        delete schema.$ref

        if (typeof target === 'object') {
          Object.keys(target).forEach((key) => {
            if (schema[key] === undefined) {
              schema[key] = target[key]
            }
          })
        }
      }

      if (typeof value === 'object' && !isCircular(value)) {
        resolve(value)
      }
    })
  }
}

// TODO: Is there a better way? :D
function isCircular(schema: AnyObject) {
  try {
    JSON.stringify(schema)
    return false
  } catch (error) {
    return true
  }
}

/**
 * Resolves a URI to a part of the specification
 */
function resolveUri(specification: AnyObject, uri: string): AnyObject {
  // Understand the URI
  const [prefix, path] = uri.split('#', 2)

  if (prefix) {
    throw new Error(ERRORS.EXTERNAL_REFERENCE_NOT_SUPPORTED.replace('%s', uri))
  }

  const segments = unescapeJsonPointer(path).split('/').slice(1)

  return segments.reduce((acc, key) => {
    return acc[key]
  }, specification)
}
