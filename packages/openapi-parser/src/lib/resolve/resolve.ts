import { AnyObject } from '../../types'
import { traverse } from '../../utils'
import { isObject } from './isObject'
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
export function resolve(
  /**
   * We need the whole specification, otherwise we can’t resolve the references.
   */
  wholeSpecification: AnyObject,
  /**
   * If `true`, the original specification will be modified.
   * If `false`, the original specification will be left untouched.
   */
  replace: boolean = true,
  /**
   * Sometimes, we only want to resolve references for a part of the specification.
   */
  partialSpecification?: AnyObject,
) {
  // Make sure we’re dealing with an object
  if (!isObject(partialSpecification ?? wholeSpecification)) {
    return undefined
  }

  let modifiedSpecification: AnyObject

  // Write
  if (replace) {
    modifiedSpecification = partialSpecification ?? wholeSpecification
  }
  // Read-only (detach from original object)
  else {
    modifiedSpecification = structuredClone(
      partialSpecification ?? wholeSpecification,
    )
  }

  // Go through the whole wholeSpecification and resolve all references
  return traverse(modifiedSpecification, (schema) => {
    // Ignore parts without a reference
    if (schema.$ref === undefined) {
      return schema
    }

    // Oh, great, there’s a reference! Let’s resolve it.
    // TODO: Maybe we shouldn’t look for the reference in the original specification (which will always have $refs),
    // but in the modified specification (which eventually won’t have any $refs).
    const target = resolveUri(wholeSpecification, schema.$ref)

    // If we can’t find the reference, we throw an error.
    if (target === undefined) {
      throw new Error(`Can’t resolve URI: ${schema.$ref}`)
    }

    // console.log()
    // console.log('modified spec', JSON.stringify(modifiedSpecification, null, 2))
    // console.log('target:', target)
    // console.log('schema:', schema)
    // console.log('$ref:', schema.$ref)

    // TODO: correctly resolve circular references
    const isCircular = target === modifiedSpecification

    // Get rid of the $ref property
    delete schema.$ref

    // Before we put the referenced content into place, we should resolve any references inside the reference.
    // Do not continue the recursion if we have a circular reference
    const resolvedTarget = isCircular
      ? target
      : resolve(wholeSpecification, replace, target)

    // We want to keep the reference to the original object, but add the original properties:
    Object.keys(resolvedTarget ?? {}).forEach((key) => {
      schema[key] = resolvedTarget[key]
    })

    return schema
  })
}

/**
 * Get the specified URI from a given specification
 */
function resolveUri(specification: AnyObject, uri: string) {
  // Understand the URI
  const [prefix, path] = uri.split('#', 2)
  // const hasHash = !!path
  const segments = path.split('/').map(unescapeJsonPointer).slice(1)

  if (prefix) {
    throw new Error(`External references are not supported yet: ${prefix}`)
  }

  // Get the target
  return segments.reduce(
    (accumulator: AnyObject, segment: string) => accumulator[segment],
    specification,
  )
}
