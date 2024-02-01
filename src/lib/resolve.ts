import { Specification } from '../types'

function escapeJsonPointer(str: string) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1')
}

function unescapeJsonPointer(str: string) {
  return str.replace(/~1/g, '/').replace(/~0/g, '~')
}

const isObject = (obj: any) => typeof obj === 'object' && obj !== null

const pointerWords = new Set([
  '$ref',
  '$id',
  '$anchor',
  '$dynamicRef',
  '$dynamicAnchor',
  '$schema',
])

function resolveUri(uri: string, anchors: Record<string, any>) {
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
  } catch {
    throw err
  }
}

export function replaceRefs(tree: Specification) {
  return resolve(tree, true)
}

export function checkRefs(tree: Specification) {
  try {
    resolve(tree, false)

    return {
      valid: true,
    }
  } catch (err) {
    return {
      valid: false,
      errors: err.message,
    }
  }
}

function resolve(tree: Specification, replace: boolean) {
  let treeObj = tree

  if (!isObject(treeObj)) {
    return undefined
  }

  if (replace === false) {
    treeObj = structuredClone(tree)
  }

  const pointers: {
    [key: string]: {
      ref: string
      obj: Specification | string
      prop: string
      path: string
      id: string
    }[]
  } = {}
  for (const word of pointerWords) {
    pointers[word] = []
  }

  function applyRef(path: string, target: Specification) {
    let root = treeObj
    const paths = path.split('/').slice(1)
    const prop = paths.pop()

    for (const p of paths) {
      root = root[unescapeJsonPointer(p)]
    }

    if (typeof prop !== 'undefined') {
      root[unescapeJsonPointer(prop)] = target
    } else {
      treeObj = target
    }
  }

  function parse(obj: Specification, path: string, id: string) {
    if (!isObject(obj)) {
      return
    }

    const objId = obj.$id || id

    for (const prop in obj) {
      if (pointerWords.has(prop)) {
        pointers[prop].push({ ref: obj[prop], obj, prop, path, id: objId })
        delete obj[prop]
      }

      parse(obj[prop], `${path}/${escapeJsonPointer(prop)}`, objId)
    }
  }

  // find all refs
  parse(treeObj, '#', '')

  // resolve them
  const anchors = { '': treeObj }
  const dynamicAnchors = {}

  for (const item of pointers.$id) {
    const { ref, obj, path } = item

    if (anchors[ref]) {
      throw new Error(`$id : '${ref}' defined more than once at ${path}`)
    }

    anchors[ref] = obj
  }

  for (const item of pointers.$anchor) {
    const { ref, obj, path, id } = item
    const fullRef = `${id}#${ref}`

    if (anchors[fullRef]) {
      throw new Error(`$anchor : '${ref}' defined more than once at '${path}'`)
    }

    anchors[fullRef] = obj
  }

  for (const item of pointers.$dynamicAnchor) {
    const { ref, obj, path } = item

    if (dynamicAnchors[`#${ref}`]) {
      throw new Error(
        `$dynamicAnchor : '${ref}' defined more than once at '${path}'`,
      )
    }

    dynamicAnchors[`#${ref}`] = obj
  }

  for (const item of pointers.$ref) {
    const { ref, id, path } = item
    const decodedRef = decodeURIComponent(ref)
    const fullRef = decodedRef[0] !== '#' ? decodedRef : `${id}${decodedRef}`

    applyRef(path, resolveUri(fullRef, anchors))
  }

  for (const item of pointers.$dynamicRef) {
    const { ref, path } = item

    if (!dynamicAnchors[ref]) {
      throw new Error(`Can't resolve $dynamicAnchor : '${ref}'`)
    }

    applyRef(path, dynamicAnchors[ref])
  }

  return treeObj
}
