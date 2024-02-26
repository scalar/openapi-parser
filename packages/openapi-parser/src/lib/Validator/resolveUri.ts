import { unescapeJsonPointer } from 'ajv/dist/compile/util'

import { ERRORS } from '../../configuration'
import type { AnyObject, Filesystem, FilesystemEntry } from '../../types'
import { resolveFromFilesystem } from './resolveFromFilesystem'

export function resolveUri(
  file: FilesystemEntry,
  uri: string,
  anchors: AnyObject,
  filesystem?: Filesystem,
) {
  /**
   * Examples:
   *
   * - #/components/schemas/Upload
   * - ./components/coordinates.yaml
   * - schemas/upload.yaml#/components/schemas/Upload
   */
  const [prefix, path] = uri.split('#', 2)
  const hasHash = !!path

  // TODO: What are anchors?
  // console.log(anchors)

  // Default error message
  const defaultError = new Error(ERRORS.INVALID_REFERENCE.replace('%s', uri))

  // Local reference
  if (hasHash && path[0] !== '/') {
    if (anchors[uri]) {
      return anchors[uri]
    }

    throw defaultError
  }

  // File reference
  if (!anchors[prefix]) {
    const resolvedReference = resolveFromFilesystem(file, uri, filesystem)

    if (resolvedReference === undefined) {
      throw defaultError
    }

    return resolvedReference
  }

  // ???
  if (!hasHash) {
    return anchors[prefix]
  }

  // Creates an array with the individual keys of the path
  // Example:
  // components/schemas/Generic_Problem -> ['components', 'schemas', 'Generic_Problem']
  const paths = path
    // replace + with space
    .split('+')
    .join(' ')
    // remove first part of the path
    .split('/')
    .slice(1)

  try {
    // This loops accesses the nested properties of the anchors object to find the reference.
    // Example: ['components', 'schemas', 'Generic_Problem']
    const result = paths.reduce((specification, key) => {
      return specification[unescapeJsonPointer(key)]
    }, anchors[prefix])

    // Could not find the reference
    if (result === undefined) {
      throw ''
    }

    // Found the reference
    return result
  } catch {
    throw defaultError
  }
}
