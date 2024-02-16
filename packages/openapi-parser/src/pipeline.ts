import {
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

function loadAction(specification: string | Record<string, any>) {
  const normalizedSpecification = normalize(specification)

  return {
    get: () => getAction(normalizedSpecification),
    filter: (callback: (Specification: Record<string, any>) => boolean) =>
      filterAction(normalizedSpecification, callback),
    upgrade: () => upgradeAction(normalizedSpecification),
    validate: () => validateAction(normalizedSpecification),
    resolve: () => resolveAction(normalizedSpecification),
    toJson: () => toJsonAction(normalizedSpecification),
    toYaml: () => toYamlAction(normalizedSpecification),
  }
}

function upgradeAction(specification: Record<string, any>) {
  const upgradedSpecification = upgrade(specification)

  return {
    get: () => getAction(upgradedSpecification),
    filter: (callback: (Specification: Record<string, any>) => boolean) =>
      filterAction(upgradedSpecification, callback),
    validate: () => validateAction(upgradedSpecification),
    resolve: () => resolveAction(upgradedSpecification),
    toJson: () => toJsonAction(upgradedSpecification),
    toYaml: () => toYamlAction(upgradedSpecification),
  }
}

async function validateAction(specification: Record<string, any>) {
  return {
    ...(await validate(specification)),
    filter: (callback: (Specification: Record<string, any>) => boolean) =>
      filterAction(specification, callback),
    get: () => getAction(specification),
    resolve: () => resolveAction(specification),
    toJson: () => toJsonAction(specification),
    toYaml: () => toYamlAction(specification),
  }
}

async function resolveAction(specification: Record<string, any>) {
  return {
    ...(await resolve(specification)),
    filter: (callback: (Specification: Record<string, any>) => boolean) =>
      filterAction(specification, callback),
    toJson: () => toJsonAction(specification),
    toYaml: () => toYamlAction(specification),
  }
}

function filterAction(
  specification: Record<string, any>,
  callback: (specification: Record<string, any>) => boolean,
) {
  const filteredSpecification = filter(specification, callback)

  return {
    get: () => getAction(filteredSpecification),
    filter: () => filterAction(filteredSpecification, callback),
    upgrade: () => upgradeAction(filteredSpecification),
    validate: () => validateAction(filteredSpecification),
    resolve: () => resolveAction(filteredSpecification),
    toJson: () => toJsonAction(filteredSpecification),
    toYaml: () => toYamlAction(filteredSpecification),
  }
}

function getAction(specification: Record<string, any>) {
  return specification
}

function toJsonAction(specification: Record<string, any>) {
  return toJson(specification)
}

function toYamlAction(specification: Record<string, any>) {
  return toYaml(specification)
}
