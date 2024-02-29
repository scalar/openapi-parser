export function unescapeJsonPointer(str) {
  return str.replace(/~1/g, '/').replace(/~0/g, '~')
}
