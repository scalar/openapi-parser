import { resolve } from './resolve'

export function replaceRefs(tree) {
  // Don’t mutate the original tree
  return resolve(structuredClone(tree), true)
}
