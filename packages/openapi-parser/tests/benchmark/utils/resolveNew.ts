import { type AnyObject, openapi } from '../../../src'

export async function resolveNew(specification: AnyObject) {
  return await openapi().load(structuredClone(specification)).resolve()
}
