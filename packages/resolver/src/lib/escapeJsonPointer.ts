export function escapeJsonPointer(str) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1')
}
