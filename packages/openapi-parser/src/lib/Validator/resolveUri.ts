import { unescapeJsonPointer } from 'ajv/dist/compile/util'

import type { Filesystem, FilesystemEntry } from '../../types'
import { resolveFromFilesystem } from './resolveFromFilesystem'

export function resolveUri(
  file: FilesystemEntry,
  uri: string,
  anchors: Record<string, any>,
  filesystem?: Filesystem,
) {
  const [prefix, path] = uri.split('#', 2)

  const hashPresent = !!path

  const err = new Error(
    `Can't resolve ${uri}${
      prefix ? ', only internal refs are supported.' : ''
    }`,
  )

  if (hashPresent && path[0] !== '/') {
    if (anchors[uri]) {
      return anchors[uri]
    }

    throw err
  }

  if (!anchors[prefix]) {
    if (filesystem) {
      return resolveFromFilesystem(file, uri, filesystem)
    } else {
      throw err
    }
  }

  if (!hashPresent) {
    return anchors[prefix]
  }

  const paths = path
    // replace + with space
    .split('+')
    .join(' ')
    // remove first part of the path
    .split('/')
    .slice(1)

  try {
    const result = paths.reduce(
      (o, n) => o[unescapeJsonPointer(n)],
      anchors[prefix],
    )

    if (result === undefined) {
      throw ''
    }

    return result
  } catch {
    throw err
  }
}
