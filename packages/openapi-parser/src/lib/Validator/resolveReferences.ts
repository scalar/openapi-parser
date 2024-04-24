import { ERRORS } from '../../configuration'
import { dirname, join } from '../../polyfills/path'
import {
  AnyObject,
  Filesystem,
  FilesystemEntry,
  ResolvedOpenAPI,
} from '../../types'
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
export function resolveReferences(
  // Just a specification, or a set of files
  input: AnyObject | Filesystem,
  // Fallback to the entrypoint
  file?: FilesystemEntry,
) {
  // Detach from input
  const clonedInput = structuredClone(input)

  // Make it a filesystem, even if it’s just one file
  const filesystem = makeFilesystem(clonedInput)

  // Get the main file
  const entrypoint = getEntrypoint(filesystem)

  // Recursively resolve all references
  resolve(
    file?.specification ?? entrypoint.specification,
    filesystem,
    file ?? entrypoint,
  )

  // If we replace references with content, that includes a reference, we can’t deal with that right-away.
  // That’s why we need a second run.
  resolve(
    file?.specification ?? entrypoint.specification,
    filesystem,
    file ?? entrypoint,
  )

  // Return the resolved specification
  return (file ?? getEntrypoint(filesystem))
    .specification as ResolvedOpenAPI.Document

  /**
   * Resolves the circular reference to an object and deletes the $ref properties.
   */
  function resolve(
    schema: AnyObject,
    filesystem: Filesystem,
    file: FilesystemEntry,
  ) {
    // Iterate over the whole objecct
    Object.entries(schema ?? {}).forEach(([key, value]) => {
      // Ignore parts without a reference
      if (schema.$ref !== undefined) {
        // Find the referenced content
        const target = resolveUri(filesystem, file, schema, schema.$ref)
        // [ { filename: './foobar.json '} ]

        // { filename: './foobar.json '}
        // if (target === undefined) {
        // { content: … }
        //   throw new Error(ERRORS.INVALID_REFERENCE.replace('%s', schema.$ref))
        // 'foobar.json#/foo/bar'
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
        resolve(value, filesystem, file)
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
  // [ { filename: './foobar.json '} ]
  filesystem: Filesystem,
  // { filename: './foobar.json '}
  file: FilesystemEntry,
  // { content: … }
  specification: AnyObject,
  // 'foobar.json#/foo/bar'
  uri: string,
): AnyObject {
  if (typeof uri !== 'string') return
  // Understand the URI
  const [prefix, path] = uri.split('#', 2)

  // External references
  if (prefix) {
    const targetFilename = join(dirname(file?.filename), prefix)
    const externalReference = filesystem.find((entry) => {
      return entry.filename === targetFilename
    })

    if (!externalReference) {
      throw new Error(ERRORS.EXTERNAL_REFERENCE_NOT_FOUND.replace('%s', prefix))
    }

    const resolvedReferences = resolveReferences(filesystem, externalReference)

    // $ref: 'other-file.yaml'
    if (path === undefined) {
      return resolvedReferences
    }

    // $ref: 'other-file.yaml#/foo/bar'
    return resolveUri(
      filesystem,
      externalReference,
      resolvedReferences,
      `#${path}`,
    )
  }

  // Pointers
  const segments = unescapeJsonPointer(path).split('/').slice(1)

  return segments.reduce((acc, key) => {
    return acc[key]
  }, specification)
}
