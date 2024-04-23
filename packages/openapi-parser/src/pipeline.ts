import type { AnyObject } from './types'
import {
  details,
  filter,
  normalize,
  resolve,
  toJson,
  toYaml,
  upgrade,
  validate,
} from './utils'

export function openapi() {
  return {
    load: loadAction,
  }
}

/**
 * Load an OpenAPI specification.
 *
 * Example: openapi().load({ openapi: '3.0.0' })
 */
function loadAction(specification: string | AnyObject) {
  const normalizedSpecification = normalize(specification)

  return {
    get: () => getAction(normalizedSpecification),
    details: () => detailsAction(normalizedSpecification),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(normalizedSpecification, callback),
    upgrade: () => upgradeAction(normalizedSpecification),
    validate: () => validateAction(normalizedSpecification),
    resolve: () => resolveAction(normalizedSpecification),
    toJson: () => toJsonAction(normalizedSpecification),
    toYaml: () => toYamlAction(normalizedSpecification),
  }
}

/**
 * Upgrade an OpenAPI specification.
 */
function upgradeAction(specification: AnyObject) {
  const upgradedSpecification = upgrade(specification)

  return {
    get: () => getAction(upgradedSpecification),
    details: () => detailsAction(upgradedSpecification),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(upgradedSpecification, callback),
    validate: () => validateAction(upgradedSpecification),
    resolve: () => resolveAction(upgradedSpecification),
    toJson: () => toJsonAction(upgradedSpecification),
    toYaml: () => toYamlAction(upgradedSpecification),
  }
}

/**
 * Validate an OpenAPI specification.
 */
async function validateAction(specification: AnyObject) {
  return {
    ...(await validate(specification)),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(specification, callback),
    get: () => getAction(specification),
    details: () => detailsAction(specification),
    resolve: () => resolveAction(specification),
    toJson: () => toJsonAction(specification),
    toYaml: () => toYamlAction(specification),
  }
}

/**
 * Resolve references in an OpenAPI specification.
 */
async function resolveAction(specification: AnyObject) {
  return {
    ...(await resolve(specification)),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(specification, callback),
    toJson: () => toJsonAction(specification),
    toYaml: () => toYamlAction(specification),
  }
}

/**
 * Remove parts of an OpenAPI specification with the given callback.
 */
function filterAction(
  specification: AnyObject,
  callback: (specification: AnyObject) => boolean,
) {
  const filteredSpecification = filter(specification, callback)

  return {
    get: () => getAction(filteredSpecification),
    details: () => detailsAction(filteredSpecification),
    filter: () => filterAction(filteredSpecification, callback),
    upgrade: () => upgradeAction(filteredSpecification),
    validate: () => validateAction(filteredSpecification),
    resolve: () => resolveAction(filteredSpecification),
    toJson: () => toJsonAction(filteredSpecification),
    toYaml: () => toYamlAction(filteredSpecification),
  }
}

function getAction(specification: AnyObject) {
  return specification
}

function detailsAction(specification: AnyObject) {
  return details(specification)
}

function toJsonAction(specification: AnyObject) {
  return toJson(specification)
}

function toYamlAction(specification: AnyObject) {
  return toYaml(specification)
}
