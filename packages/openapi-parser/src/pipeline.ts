import type { AnyObject, Filesystem } from './types'
import {
  details,
  filter,
  getEntrypoint,
  load,
  resolve,
  toJson,
  toYaml,
  upgrade,
  validate,
} from './utils'
import { type LoadPlugin } from './utils/load'

export function openapi() {
  return {
    load: loadAction,
  }
}

export type ActionQueue = {
  action: typeof load | typeof upgrade
  async: boolean
  options?: AnyObject
}[]

/**
 * Load an OpenAPI specification.
 *
 * Example: await openapi().load({ openapi: '3.0.0' })
 */
function loadAction(
  specification: string | AnyObject,
  options?: {
    plugins: LoadPlugin[]
  },
) {
  const queue: ActionQueue = [
    {
      action: load,
      async: true,
      options: options,
    },
  ]

  return {
    get: () => getAction(specification, queue),
    details: () => detailsAction(entrypoint),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(entrypoint, callback),
    upgrade: () => upgradeAction(specification, queue),
    validate: () => validateAction(specification, queue),
    resolve: () => resolveAction(specification, queue),
    toJson: () => toJsonAction(entrypoint),
    toYaml: () => toYamlAction(entrypoint),
  }
}

/**
 * Upgrade an OpenAPI specification.
 */
function upgradeAction(
  specification: string | AnyObject,
  queue: ActionQueue = [],
) {
  queue.push({
    action: upgrade,
    async: false,
  })

  return {
    get: () => getAction(specification, queue),
    details: () => detailsAction(upgradedSpecification),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(upgradedSpecification, callback),
    validate: () => validateAction(specification, queue),
    resolve: () => resolveAction(upgradedSpecification),
    toJson: () => toJsonAction(upgradedSpecification),
    toYaml: () => toYamlAction(upgradedSpecification),
  }
}

/**
 * Validate an OpenAPI specification.
 */
async function validateAction(
  specification: string | AnyObject,
  queue: ActionQueue,
) {
  const filesystem = await workThroughQueue(specification, queue)

  return {
    ...(await validate(filesystem)),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(specification, callback),
    get: () => getAction(specification),
    details: () => detailsAction(specification),
    resolve: () => resolveAction(specification, queue),
    toJson: () => toJsonAction(specification),
    toYaml: () => toYamlAction(specification),
  }
}

/**
 * Resolve references in an OpenAPI specification.
 */
async function resolveAction(
  specification: string | AnyObject,
  queue: ActionQueue = [],
) {
  const filesystem = await workThroughQueue(specification, queue)

  return {
    ...(await resolve(getEntrypoint(filesystem).specification)),
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
  specification: string | AnyObject,
  callback: (specification: string | AnyObject) => boolean,
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

async function getAction(
  specification: string | AnyObject,
  queue: ActionQueue,
) {
  const filesystem = await workThroughQueue(specification, queue)

  // Return the specification of the entrypoint
  // TODO: IRKS
  return getEntrypoint(filesystem).specification
}

function detailsAction(specification: string | AnyObject) {
  return details(specification)
}

function toJsonAction(specification: string | AnyObject) {
  return toJson(specification)
}

function toYamlAction(specification: string | AnyObject) {
  return toYaml(specification)
}

async function workThroughQueue(
  specification: string | AnyObject,
  queue: ActionQueue,
) {
  let result = specification

  for (const { action, async, options } of queue) {
    if (async) {
      result = await action(result, options)
    } else {
      result = action(result, options)
    }
  }

  return result
}
