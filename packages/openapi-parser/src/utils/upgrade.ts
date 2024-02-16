import { upgradeFromThreeToThreeOne } from './upgradeFromThreeToThreeOne'
import { upgradeFromTwoToThree } from './upgradeFromTwoToThree'

/**
 * Upgrade specification to OpenAPI 3.1.0
 */
export function upgrade(specification: Record<string, any>) {
  const upgraders = [upgradeFromTwoToThree, upgradeFromThreeToThreeOne]

  return upgraders.reduce(
    (specification, upgrader) => upgrader(specification),
    specification,
  )
}
