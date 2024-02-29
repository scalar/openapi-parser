import { unescapeJsonPointer } from './unescapeJsonPointer'

export function resolveUri(uri, anchors) {
  const [prefix, path] = uri.split('#', 2)
  const hashPresent = !!path
  const err = new Error(
    `Can't resolve ${uri}${prefix ? ', only internal refs are supported.' : ''}`,
  )

  if (hashPresent && path[0] !== '/') {
    if (anchors[uri]) {
      return anchors[uri]
    }
    throw err
  }

  if (!anchors[prefix]) {
    throw err
  }

  if (!hashPresent) {
    return anchors[prefix]
  }

  const paths = path.split('/').slice(1)
  try {
    const result = paths.reduce(
      (o, n) => o[unescapeJsonPointer(n)],
      anchors[prefix],
    )
    if (result === undefined) {
      throw ''
    }
    return result
  } catch (_) {
    throw err
  }
}
