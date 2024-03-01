import type {
  AnyObject,
  Filesystem,
  FilesystemEntry,
  ResolvedOpenAPI,
} from '../../../types'
import { escapeJsonPointer } from './escapeJsonPointer'
import { isObject } from './isObject'
import { resolveUri } from './resolveUri'
import { unescapeJsonPointer } from './unescapeJsonPointer'

const pointerWords = new Set([
  '$ref',
  '$id',
  '$anchor',
  '$dynamicRef',
  '$dynamicAnchor',
  '$schema',
])

export function resolveReferences(
  filesystem: Filesystem,
  replaceReferences: boolean = true,
  entrypoint?: FilesystemEntry,
  uri?: string,
) {
  // Use or find the file entrypoint
  entrypoint = entrypoint ?? filesystem.find((file) => file.isEntrypoint)

  // Get the content from the filesystem entry
  let { specification } = entrypoint

  // If the specification is not an object, return undefined
  if (!isObject(specification)) {
    return undefined
  }

  // Clone the specification to avoid modifying the original
  if (replaceReferences === false) {
    specification = structuredClone(specification)
  }

  // Find all references
  const pointers: {
    [key: string]: {
      ref: string
      obj: AnyObject | string
      prop: string
      path: string
      id: string
    }[]
  } = {}
  for (const word of pointerWords) {
    pointers[word] = []
  }

  // Apply the reference to the target
  function applyReference(path: string, target: AnyObject) {
    let root = specification
    const paths = path.split('/').slice(1)
    const prop = paths.pop()

    for (const p of paths) {
      root = root[unescapeJsonPointer(p)]
    }

    if (typeof prop !== 'undefined') {
      root[unescapeJsonPointer(prop)] = target
    } else {
      specification = target
    }
  }

  // Parse the object and find all references
  function parse(obj: AnyObject, path: string, id: string) {
    if (!isObject(obj)) {
      return
    }

    const objId = obj.$id || id

    for (const prop in obj) {
      if (pointerWords.has(prop)) {
        pointers[prop].push({
          ref: obj[prop],
          obj,
          prop,
          path,
          id: objId,
        })
        delete obj[prop]
      }

      parse(obj[prop], `${path}/${escapeJsonPointer(prop)}`, objId)
    }
  }

  // Find all references
  parse(specification, '#', '')

  // Resolve them all
  const anchors = { '': specification }
  const dynamicAnchors = {}

  for (const item of pointers.$id) {
    const { ref, obj, path, id } = item

    if (anchors[ref]) {
      throw new Error(`$id: '${ref}' defined more than once at ${path}`)
    }

    anchors[ref] = obj
  }

  for (const item of pointers.$anchor) {
    const { ref, obj, path, id } = item
    const fullRef = `${id}#${ref}`

    if (anchors[fullRef]) {
      throw new Error(`$anchor: '${ref}' defined more than once at '${path}'`)
    }

    anchors[fullRef] = obj
  }

  for (const item of pointers.$dynamicAnchor) {
    const { ref, obj, path } = item

    if (dynamicAnchors[`#${ref}`]) {
      throw new Error(
        `$dynamicAnchor: '${ref}' defined more than once at '${path}'`,
      )
    }

    dynamicAnchors[`#${ref}`] = obj
  }

  for (const item of pointers.$ref) {
    const { ref, id, path } = item
    const decodedRef = decodeURIComponent(ref)
    const fullRef = decodedRef[0] !== '#' ? decodedRef : `${id}${decodedRef}`

    applyReference(path, resolveUri(entrypoint, fullRef, anchors, filesystem))
  }

  for (const item of pointers.$dynamicRef) {
    const { ref, path } = item

    if (!dynamicAnchors[ref]) {
      throw new Error(`Can't resolve $dynamicAnchor: '${ref}'`)
    }

    applyReference(path, dynamicAnchors[ref])
  }

  // When a uri was passed, return only part of the specification
  // TODO: This can create maximum call stack size exceeded errors
  if (uri) {
    const paths = uri.split('/').slice(1)

    for (const p of paths) {
      specification = specification[unescapeJsonPointer(p)]
    }
  }

  return specification as ResolvedOpenAPI.Document
}
