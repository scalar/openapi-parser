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

export type Action = {
  action: typeof load | typeof upgrade | typeof filter
  options?: AnyObject
}

export type Queue = {
  specification: AnyApiDefinitionFormat
  tasks: Action[]
}

/**
 * JSON, YAML or object representation of an OpenAPI API definition
 */
export type AnyApiDefinitionFormat = string | AnyObject

/**
 * Creates a new pipeline
 */
export function openapi() {
  return {
    load: loadAction,
  }
}

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
  const queue: Queue = {
    specification: specification,
    tasks: [
      {
        action: load,
        options: options,
      },
    ],
  }

  return {
    get: () => getAction(queue),
    files: () => filesAction(queue),
    details: () => detailsAction(queue),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(queue, callback),
    upgrade: () => upgradeAction(queue),
    validate: () => validateAction(queue),
    dereference: () => dereferenceAction(queue),
    toJson: () => toJsonAction(queue),
    toYaml: () => toYamlAction(queue),
  }
}

/**
 * Upgrade an OpenAPI specification.
 */
function upgradeAction(queue: Queue) {
  queue.tasks.push({
    action: upgrade,
  })

  return {
    get: () => getAction(queue),
    files: () => filesAction(queue),
    details: () => detailsAction(queue),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(queue, callback),
    validate: () => validateAction(queue),
    dereference: () => dereferenceAction(queue),
    toJson: () => toJsonAction(queue),
    toYaml: () => toYamlAction(queue),
  }
}

/**
 * Validate an OpenAPI specification.
 */
async function validateAction(queue: Queue) {
  const filesystem = await workThroughQueue(queue)

  return {
    ...(await validate(filesystem)),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(queue, callback),
    get: () => getAction(queue),
    files: () => filesAction(queue),
    details: () => detailsAction(queue),
    dereference: () => dereferenceAction(queue),
    toJson: () => toJsonAction(queue),
    toYaml: () => toYamlAction(queue),
  }
}

/**
 * Resolve references in an OpenAPI specification.
 */
function dereferenceAction(queue: Queue) {
  queue.tasks.push({
    action: dereference,
  })

  return {
    get: () => getAction(queue),
    files: () => filesAction(queue),
    filter: (callback: (Specification: AnyObject) => boolean) =>
      filterAction(queue, callback),
    toJson: () => toJsonAction(queue),
    toYaml: () => toYamlAction(queue),
  }
}

/**
 * Remove parts of an OpenAPI specification with the given callback.
 */
function filterAction(
  queue: Queue,
  callback: (specification: AnyApiDefinitionFormat) => boolean,
) {
  queue.tasks.push({
    action: filter,
    options: callback,
  })

  return {
    get: () => getAction(queue),
    files: () => filesAction(queue),
    details: () => detailsAction(queue),
    filter: () => filterAction(queue, callback),
    upgrade: () => upgradeAction(queue),
    validate: () => validateAction(queue),
    dereference: () => dereferenceAction(queue),
    toJson: () => toJsonAction(queue),
    toYaml: () => toYamlAction(queue),
  }
}

async function getAction(queue: Queue) {
  const filesystem = await workThroughQueue(queue)

  // TODO: Shouldn’t we return the schema or something here?
  return getEntrypoint(filesystem).specification
}

async function filesAction(queue: Queue) {
  return await workThroughQueue(queue)
}

async function detailsAction(queue: Queue) {
  const filesystem = await workThroughQueue(queue)

  return details(getEntrypoint(filesystem).specification)
}

async function toJsonAction(queue: Queue) {
  const filesystem = await workThroughQueue(queue)

  return toJson(getEntrypoint(filesystem).specification)
}

async function toYamlAction(queue: Queue) {
  const filesystem = await workThroughQueue(queue)

  return toYaml(getEntrypoint(filesystem).specification)
}

async function workThroughQueue(queue: Queue): Promise<Filesystem> {
  let result = queue.specification

  for (const { action, options } of queue.tasks) {
    // Check if action is a function
    if (typeof action !== 'function') {
      console.warn('[queue] The given action is not a function:', action)
      continue
    }

    // Check if action is an async function or a sync function
    if (action.constructor.name === 'AsyncFunction') {
      result = await action(result, options as any)
    } else {
      result = action(result, options as any)
    }
  }

  return makeFilesystem(result)
}
