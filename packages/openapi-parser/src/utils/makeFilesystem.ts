import type { AnyObject, Filesystem } from '../types'
import { isFilesystem } from './isFilesystem'
import { normalize } from './normalize'

export function makeFilesystem(
  value: string | AnyObject | Filesystem,
): Filesystem {
  // Keep as is
  if (isFilesystem(value)) {
    return value as Filesystem
  }

  // Make an object
  const specification = normalize(value)

  // Create fake filesystem
  return [
    {
      entrypoint: true,
      specification,
      filename: 'openapi.json',
      dir: './',
      references: [
        // TODO: Fill
      ],
    },
  ]
}
