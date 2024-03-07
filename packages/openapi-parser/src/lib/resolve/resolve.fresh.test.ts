import { describe, expect, it } from 'vitest'

import { AnyObject } from '../../types'

describe('resolve', () => {
  it('resolves a circular reference', async () => {
    const schema: AnyObject = {
      foo: {
        bar: {
          $ref: '#/foo',
        },
      },
    }

    const result = resolveReferences(schema)

    // console.log(result)
    // console.log(JSON.stringify(result, null, 2))

    // Circular references can’t be JSON.stringify’d (easily)
    expect(() => JSON.stringify(result, null, 2)).toThrow()

    // Sky is the limit
    expect(result.foo.bar.bar.bar.bar.bar.bar.bar.bar).toBeTypeOf('object')
  })

  it('resolves a more advanced circular reference', async () => {
    const schema: AnyObject = {
      type: 'object',
      properties: {
        element: { $ref: '#/schemas/element' },
        foobar: { $ref: '#/schemas/foobar' },
      },
      schemas: {
        element: {
          type: 'object',
          properties: {
            element: { $ref: '#/schemas/element' },
          },
        },
        foobar: {
          type: 'object',
          properties: {
            foobar: { $ref: '#/schemas/foobar' },
          },
        },
      },
    }

    const result = resolveReferences(schema)

    console.log(result)
    // console.log(JSON.stringify(result, null, 2))

    // Circular references can’t be JSON.stringify’d (easily)
    expect(() => JSON.stringify(result, null, 2)).toThrow()

    // Sky is the limit
    expect(
      result.schemas.element.properties.element.properties.element.properties
        .element,
    ).toBeTypeOf('object')
  })
})

function resolveReferences(input: AnyObject) {
  // Detach from input
  const specification = structuredClone(input)

  // Recursively resolve all references
  resolve(specification)

  // Return the resolved specification
  return specification

  /**
   * Resolves the circular reference to an object and deletes the $ref properties.
   */
  function resolve(schema: AnyObject) {
    // Iterate over the whole objecct
    Object.entries(schema).forEach(([key, value]) => {
      if (schema.$ref !== undefined) {
        const target = resolveUri(specification, schema.$ref)

        if (target === undefined) {
          throw new Error(`Can’t resolve URI: ${schema.$ref}`)
        }

        delete schema.$ref

        if (typeof target === 'object') {
          Object.keys(target).forEach((key) => {
            schema[key] = target[key]
          })
        }
      }

      if (typeof value === 'object' && !isCircular(value)) {
        resolve(value)
      }
    })
  }
}

// TODO: Is there a better way? :D
function isCircular(schema: AnyObject) {
  try {
    JSON.stringify(schema)
    return false
  } catch (error) {
    return true
  }
}

/**
 * Resolves a URI to a part of the specification
 */
function resolveUri(specification: AnyObject, uri: string): AnyObject {
  // Understand the URI
  const [prefix, path] = uri.split('#', 2)

  if (prefix) {
    throw new Error(`External references are not supported yet: ${uri}`)
  }

  const segments = path.split('/').slice(1)

  return segments.reduce((acc, key) => {
    return acc[key]
  }, specification)
}
