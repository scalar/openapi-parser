import {
  type AnyObject,
  normalize,
  openapi,
  resolveReferences,
} from '../../../src'

export async function resolveNew(specification: AnyObject) {
  return resolveReferences(normalize(specification))
}
