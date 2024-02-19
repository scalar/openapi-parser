export function escapeJsonPointer(str: string) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1')
}
