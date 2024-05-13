import { AnyObject, Filesystem } from '../types'
import { getEntrypoint } from './getEntrypoint'
import { isFilesystem } from './isFilesystem'
import { makeFilesystem } from './makeFilesystem'
import { upgradeFromThreeToThreeOne } from './upgradeFromThreeToThreeOne'
import { upgradeFromTwoToThree } from './upgradeFromTwoToThree'

/**
 * Upgrade specification to OpenAPI 3.1.0
 */
export function upgrade(specification: AnyObject | Filesystem) {
  const upgraders = [upgradeFromTwoToThree, upgradeFromThreeToThreeOne]

  const wasFilesystem = isFilesystem(specification)

  // TODO: Run upgrade over the whole filesystem
  const result = upgraders.reduce(
    (specification, upgrader) => upgrader(specification),
    getEntrypoint(makeFilesystem(specification)).specification,
  )

  return wasFilesystem ? makeFilesystem(result) : result
}
