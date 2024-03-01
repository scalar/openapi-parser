export function unescapeJsonPointer(str: string) {
  return str.replace(/~1/g, '/').replace(/~0/g, '~')
}
