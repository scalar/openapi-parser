import { resolve } from './utils/resolve'
import { validate } from './utils/validate'

export function openapi() {
  return {
    load: loadAction,
  }
}

function loadAction(specification: string | Record<string, any>) {
  return {
    validate: () => validateAction(specification),
    resolve: () => resolveAction(specification),
    toJson: () => toJsonAction(specification),
  }
}

async function validateAction(specification: string | Record<string, any>) {
  return {
    ...(await validate(specification)),
    resolve: () => resolveAction(specification),
  }
}

async function resolveAction(specification: string | Record<string, any>) {
  return {
    ...(await resolve(specification)),
  }
}

function toJsonAction(specification: string | Record<string, any>) {
  return JSON.stringify(specification, null, 2)
}
