import { normalize, resolve, toJson, toYaml, upgrade, validate } from './utils'

export function openapi() {
  return {
    load: loadAction,
  }
}

function loadAction(specification: string | Record<string, any>) {
  const normalizedSpecification = normalize(specification)

  return {
    get: () => get(normalizedSpecification),
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
    get: () => get(upgradedSpecification),
    validate: () => validateAction(upgradedSpecification),
    resolve: () => resolveAction(upgradedSpecification),
    toJson: () => toJsonAction(upgradedSpecification),
    toYaml: () => toYamlAction(upgradedSpecification),
  }
}

async function validateAction(specification: Record<string, any>) {
  return {
    ...(await validate(specification)),
    get: () => get(specification),
    resolve: () => resolveAction(specification),
    toJson: () => toJsonAction(specification),
    toYaml: () => toYamlAction(specification),
  }
}

async function resolveAction(specification: Record<string, any>) {
  return {
    ...(await resolve(specification)),
    toJson: () => toJsonAction(specification),
    toYaml: () => toYamlAction(specification),
  }
}

function get(specification: Record<string, any>) {
  return specification
}

function toJsonAction(specification: Record<string, any>) {
  return toJson(specification)
}

function toYamlAction(specification: Record<string, any>) {
  return toYaml(specification)
}
