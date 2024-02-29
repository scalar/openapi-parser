import { resolve } from './resolve'

export function checkRefs(tree) {
  try {
    resolve(tree, false)
    return { valid: true }
  } catch (err) {
    return { valid: false, errors: err.message }
  }
}
