import path from 'node:path'

export const testDirectory = function (file: string) {
  return path.join(
    // test directory
    new URL(import.meta.url).pathname.split('/').slice(0, -2).join('/'),
    // file in test directory
    file,
  )
}
