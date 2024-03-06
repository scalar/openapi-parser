import { AnyObject } from '../../types'
import { traverse } from '../../utils'
import { isObject } from './isObject'
import { unescapeJsonPointer } from './unescapeJsonPointer'

export const pointerWords = new Set([
  '$ref',
  '$id',
  '$anchor',
  '$dynamicRef',
  '$dynamicAnchor',
  '$schema',
])

/**
 * Counting the number of executions to just stop at some point.
 * TODO: We need be a better way to detect circular references or prevent infinite loops.
 */
// let executions = 0
// const executionHardLimit = 1000

const cache = new Map()

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
  // executions++

  // // Prevent infinite loops
  // if (executions > executionHardLimit) {
  //   return undefined
  // }

  // Make sure we’re dealing with an object
  if (!isObject(partialSpecification ?? wholeSpecification)) {
    console.log('NOT AN OBJECT')
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
    const target = findReference(wholeSpecification, schema.$ref)

    // If we can’t find the reference, we throw an error.
    if (target === undefined) {
      throw new Error(`Can’t resolve URI: ${schema.$ref}`)
    }

    // console.log()
    // console.log('schema:', schema)
    // console.log('$ref:', schema.$ref)
    // console.log('target:', target)

    delete schema.$ref

    // Before we put the referenced content into place, we should resolve any references inside the reference.
    // Recursion FTW!
    // TODO: This is causing a max call stack error.
    const resolvedTarget = resolve(wholeSpecification, true, target)

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
function findReference(specification: AnyObject, uri: string) {
  // Understand the URI
  const [prefix, path] = uri.split('#', 2)
  const hasHash = !!path
  const segments = path.split('/').map(unescapeJsonPointer).slice(1)

  // console.log('findReference', {
  //   uri,
  //   prefix,
  //   hasHash,
  //   path,
  //   segments,
  //   specification,
  // })

  // Get the target
  return segments.reduce(
    (accumulator: AnyObject, segment: string) => accumulator[segment],
    specification,
  )
}
