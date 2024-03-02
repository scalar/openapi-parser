import { escapeJsonPointer } from './escapeJsonPointer'
import { isObject } from './isObject'
import { resolveUri } from './resolveUri'
import { unescapeJsonPointer } from './unescapeJsonPointer'

export const pointerWords = new Set([
  '$ref',
  '$id',
  '$anchor',
  '$dynamicRef',
  '$dynamicAnchor',
  '$schema',
])

export function resolve(tree, replace) {
  let treeObj = tree
  if (!isObject(treeObj)) {
    return undefined
  }

  if (replace === false) {
    treeObj = structuredClone(tree)
  }

  const pointers = {}
  for (const word of pointerWords) {
    pointers[word] = []
  }

  function applyRef(path, target) {
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

  // recursively follow the reference path to the end
  function resolvePointer(path, prop, ref, id) {
    let currentRef = ''
    function recursiveSearchRefs(path, prop, ref, id) {
      let root = treeObj

      const paths = ref.split('/').slice(1)

      for (const p of paths) {
        root = root[unescapeJsonPointer(p)]
      }

      if (typeof root[prop] === 'undefined') {
        currentRef = ref
        return
      }
      recursiveSearchRefs(path, prop, root[prop], id)
    }
    recursiveSearchRefs(path, prop, ref, id)

    return currentRef
  }

  function parse(obj, path, id) {
    if (!isObject(obj)) {
      return
    }

    const objId = obj.$id || id
    for (const prop in obj) {
      if (pointerWords.has(prop)) {
        // recursively check if the reference is a pointer to another reference
        let resolvedRef = resolvePointer(path, prop, obj[prop], objId)
        pointers[prop].push({ ref: resolvedRef, obj, prop, path, id: objId })
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
