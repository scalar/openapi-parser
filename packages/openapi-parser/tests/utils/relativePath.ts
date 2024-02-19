import path from 'node:path'

export const relativePath = function (url: string, file: string) {
  return path.join(
    // test directory
    new URL(url).pathname.split('/').slice(0, -2).join('/'),
    // file in test directory
    file,
  )
}
