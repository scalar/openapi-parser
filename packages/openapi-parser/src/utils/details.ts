import { supportedVersions } from '../configuration'
import { AnyObject } from '../types'

/**
 * Get versions of the OpenAPI specification.
 */
export function details(specification: AnyObject) {
  for (const version of new Set(supportedVersions)) {
    const specificationType = version === '2.0' ? 'swagger' : 'openapi'
    const value = specification[specificationType]

    if (typeof value === 'string' && value.startsWith(version)) {
      return {
        version,
        specificationType,
        specificationVersion: value,
      }
    }
  }

  return {
    version: undefined,
    specificationType: undefined,
    specificationVersion: undefined,
  }
}
