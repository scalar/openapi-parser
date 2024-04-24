import { ERRORS } from '../../configuration'
import { AnyObject, Filesystem, ResolvedOpenAPI } from '../../types'
import { getEntrypoint } from '../../utils/getEntrypoint'
import { makeFilesystem } from '../../utils/makeFilesystem'
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
export function resolveReferences(input: AnyObject, specification?: AnyObject) {
  // Detach from input
  const clonedInput = structuredClone(input)

  // Make it a filesystem, even if it’s just one file
  const filesystem = makeFilesystem(clonedInput)

  // Get the main file
  const entrypoint = getEntrypoint(filesystem)

  // Recursively resolve all references
  resolve(entrypoint, filesystem)

  // If we replace references with content, that includes a reference, we can’t deal with that right-away.
  // That’s why we need a second run.
  resolve(entrypoint, filesystem)

  // Return the resolved specification
  return getEntrypoint(filesystem).specification as ResolvedOpenAPI.Document

  /**
   * Resolves the circular reference to an object and deletes the $ref properties.
   */
  function resolve(schema: AnyObject, filesystem: Filesystem) {
    // Iterate over the whole objecct
    Object.entries(schema ?? {}).forEach(([key, value]) => {
      // Ignore parts without a reference
      if (schema.$ref !== undefined) {
        // Find the referenced content
        const target = resolveUri(
          filesystem,
          specification ?? entrypoint.specification,
          schema.$ref,
        )

        // if (target === undefined) {
        //   throw new Error(ERRORS.INVALID_REFERENCE.replace('%s', schema.$ref))
        // }

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
        resolve(value, filesystem)
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
function resolveUri(
  filesystem: Filesystem,
  specification: AnyObject,
  uri: string,
): AnyObject {
  if (typeof uri !== 'string') return
  // Understand the URI
  const [prefix, path] = uri.split('#', 2)

  // External references
  if (prefix) {
    const externalReference = filesystem.find(
      (file) => file.filename === prefix,
    )

    if (!externalReference) {
      throw new Error(ERRORS.EXTERNAL_REFERENCE_NOT_FOUND.replace('%s', prefix))
    }

    // TODO: We should resolve references in there first I guess.
    return externalReference.specification
  }

  // Pointers
  const segments = unescapeJsonPointer(path).split('/').slice(1)

  return segments.reduce((acc, key) => {
    return acc[key]
  }, specification)
}
