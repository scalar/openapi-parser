import { AnyObject } from '../types'
import { traverse } from './traverse'

/**
 * Walks through the specification and returns all references as an array.
 *
 * Warning: Doesn’t return internal references.
 */
export function getListOfReferences(specification: AnyObject) {
  const references: string[] = []

  traverse(specification, (value: any) => {
    if (
      value.$ref &&
      typeof value.$ref === 'string' &&
      !value.$ref.startsWith('#')
    ) {
      references.push(value.$ref.split('#')[0])
    }

    return value
  })

  return references
}
