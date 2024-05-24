import type { AnyObject, Filesystem } from './types'
import {
  dereference,
  details,
  filter,
  getEntrypoint,
  load,
  toJson,
  toYaml,
  upgrade,
  validate,
} from './utils'
import { type LoadPlugin } from './utils/load/load'
import { makeFilesystem } from './utils/makeFilesystem'

export function openapi() {
  return {
    load: loadAction,
  }
}

export type ActionQueue = {
  action: typeof load | typeof upgrade | typeof filter
  async: boolean
  options?: AnyObject
}[]

/**
 * JSON, YAML or object representation of an OpenAPI API definition
 */
export type AnyApiDefinitionFormat = string | AnyObject

/**
 * Load an OpenAPI specification.
 *
 * Example: await openapi().load({ openapi: '3.0.0' })
 */
function loadAction(
  specification: AnyApiDefinitionFormat,
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
    files: () => filesAction(specification, queue),
    details: () => detailsAction(specification, queue),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(specification, queue, callback),
    upgrade: () => upgradeAction(specification, queue),
    validate: () => validateAction(specification, queue),
    dereference: () => dereferenceAction(specification, queue),
    toJson: () => toJsonAction(specification, queue),
    toYaml: () => toYamlAction(specification, queue),
  }
}

/**
 * Upgrade an OpenAPI specification.
 */
function upgradeAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue = [],
) {
  queue.push({
    action: upgrade,
    async: false,
  })

  return {
    get: () => getAction(specification, queue),
    files: () => filesAction(specification, queue),
    details: () => detailsAction(specification, queue),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(specification, queue, callback),
    validate: () => validateAction(specification, queue),
    dereference: () => dereferenceAction(specification, queue),
    toJson: () => toJsonAction(specification, queue),
    toYaml: () => toYamlAction(specification, queue),
  }
}

/**
 * Validate an OpenAPI specification.
 */
async function validateAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue,
) {
  const filesystem = await workThroughQueue(specification, queue)

  return {
    ...(await validate(filesystem)),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(specification, queue, callback),
    get: () => getAction(specification, queue),
    files: () => filesAction(specification, queue),
    details: () => detailsAction(specification, queue),
    dereference: () => dereferenceAction(specification, queue),
    toJson: () => toJsonAction(specification, queue),
    toYaml: () => toYamlAction(specification, queue),
  }
}

/**
 * Resolve references in an OpenAPI specification.
 */
function dereferenceAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue = [],
) {
  queue.push({
    action: dereference,
    async: true,
  })

  return {
    get: () => getAction(specification, queue),
    files: () => filesAction(specification, queue),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(specification, queue, callback),
    toJson: () => toJsonAction(specification, queue),
    toYaml: () => toYamlAction(specification, queue),
  }
}

/**
 * Remove parts of an OpenAPI specification with the given callback.
 */
function filterAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue = [],
  callback: (specification: AnyApiDefinitionFormat) => boolean,
) {
  queue.push({
    action: filter,
    options: callback,
    async: false,
  })

  return {
    get: () => getAction(specification, queue),
    files: () => filesAction(specification, queue),
    details: () => detailsAction(specification, queue),
    filter: () => filterAction(specification, queue, callback),
    upgrade: () => upgradeAction(specification, queue),
    validate: () => validateAction(specification, queue),
    dereference: () => dereferenceAction(specification, queue),
    toJson: () => toJsonAction(specification, queue),
    toYaml: () => toYamlAction(specification, queue),
  }
}

async function getAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue,
) {
  const filesystem = await workThroughQueue(specification, queue)

  // TODO: Shouldn’t we return the schema or something here?
  return getEntrypoint(filesystem).specification
}

async function filesAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue,
) {
  return await workThroughQueue(specification, queue)
}

async function detailsAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue,
) {
  const filesystem = await workThroughQueue(specification, queue)

  return details(getEntrypoint(filesystem).specification)
}

async function toJsonAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue,
) {
  const filesystem = await workThroughQueue(specification, queue)

  return toJson(getEntrypoint(filesystem).specification)
}

async function toYamlAction(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue,
) {
  const filesystem = await workThroughQueue(specification, queue)

  return toYaml(getEntrypoint(filesystem).specification)
}

async function workThroughQueue(
  specification: AnyApiDefinitionFormat,
  queue: ActionQueue,
): Promise<Filesystem> {
  let result = specification

  for (const { action, async, options } of queue) {
    if (async) {
      // TODO: Some might not need options?
      // @ts-expect-error TODO: Fix this
      result = await action(result, options)
    } else {
      // TODO: Some might not need options?
      // @ts-expect-error TODO: Fix this
      result = action(result, options)
    }

    // console.log('typeof action', action)
    // console.log('result', result)
  }

  return makeFilesystem(result)
}
