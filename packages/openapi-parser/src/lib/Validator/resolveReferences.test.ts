/**
 * This file has some simple tests to cover the basics of the resolveReferences function.
 * Doesn’t cover all edge cases, doesn’t have big files, but if this works you’re almost there.
 */
import SwaggerParser from '@apidevtools/swagger-parser'
import { describe, expect, it } from 'vitest'

import type { AnyObject, ResolvedOpenAPIV2 } from '../../types'
import { resolveReferences } from './resolveReferences'

describe('resolveReferences', () => {
  it('resolves references', async () => {
    const specification = {
      openapi: '3.1.0',
      info: {},
      paths: {
        '/foobar': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/Foobar',
            },
          },
        },
      },

      components: {
        requestBodies: {
          Foobar: {
            content: {},
          },
        },
      },
    }

    // Run the specification through the old parser
    const oldSchema = (await new Promise(async (resolve, reject) => {
      SwaggerParser.dereference(
        structuredClone(specification) as never,
        (error, result) => {
          if (error) {
            reject(error)
          }

          if (result === undefined) {
            reject('Couldn’t parse the Swagger file.')

            return
          }
          resolve(result)
        },
      )
    }).catch((error) => {
      console.error('[@apidevtools/swagger-parser]', error)
    })) as any

    // Run the specification through our new parser
    const newSchema = resolveReferences(specification)

    // Assertion
    expect(newSchema.paths['/foobar'].post.requestBody).toMatchObject(
      oldSchema.paths['/foobar'].post.requestBody,
    )
  })

  it('resolves references inside references', async () => {
    const specification = {
      openapi: '3.1.0',
      info: {},
      paths: {
        '/foobar': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/Foobar',
            },
          },
        },
      },

      components: {
        requestBodies: {
          CursorRequest: {
            content: {},
          },
          Foobar: {
            // This is a reference to another reference
            $ref: '#/components/requestBodies/CursorRequest',
          },
        },
      },
    }

    // Run the specification through the old parser
    const oldSchema = (await new Promise(async (resolve, reject) => {
      SwaggerParser.dereference(
        structuredClone(specification) as never,
        (error, result) => {
          if (error) {
            reject(error)
          }

          if (result === undefined) {
            reject('Couldn’t parse the Swagger file.')

            return
          }
          resolve(result)
        },
      )
    }).catch((error) => {
      console.error('[@apidevtools/swagger-parser]', error)
    })) as any

    // Run the specification through our new parser
    const newSchema = resolveReferences(specification)

    // Assertion
    expect(newSchema.paths['/foobar'].post.requestBody).toMatchObject(
      oldSchema.paths['/foobar'].post.requestBody,
    )
  })

  it('resolves references in arrays', async () => {
    const specification = {
      openapi: '3.1.0',
      info: {},
      paths: {
        '/foobar': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/Foobar',
            },
          },
        },
      },

      components: {
        schemas: {
          Barfoo: {
            type: 'string',
            example: 'barfoo',
          },
        },
        requestBodies: {
          Foobar: {
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      $ref: '#/components/schemas/Barfoo',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    }

    // Run the specification through our new parser
    const schema = resolveReferences(specification)

    // Assertion
    expect(
      schema.paths['/foobar'].post.requestBody.content['application/json']
        .schema.oneOf[0],
    ).toMatchObject({
      type: 'string',
      example: 'barfoo',
    })
  })

  it('merges original properties and referenced content', async () => {
    const specification = {
      openapi: '3.1.0',
      info: {},
      paths: {
        '/foobar': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/Foobar',
            },
          },
        },
      },
      components: {
        schemas: {
          Barfoo: {
            type: 'string',
            example: 'barfoo',
          },
        },
        requestBodies: {
          Foobar: {
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      description: 'This is a barfoo',
                      $ref: '#/components/schemas/Barfoo',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    }

    // Run the specification through our new parser
    const schema = resolveReferences(specification)

    // Assertion
    expect(
      schema.paths['/foobar'].post.requestBody.content['application/json']
        .schema.oneOf[0],
    ).toMatchObject({
      type: 'string',
      example: 'barfoo',
      description: 'This is a barfoo',
    })
  })

  it('references inside references still keep the reference to the original JS object', async () => {
    const specification = {
      swagger: '2.0',
      info: {
        title: 'Branded Fares Upsell',
        version: '1.0.1',
      },
      paths: {
        '/foobar': {
          post: {
            responses: {
              '200': {
                $ref: '#/responses/returnUpsell',
              },
            },
          },
        },
      },
      responses: {
        returnUpsell: {
          schema: {
            type: 'object',
            properties: {
              dictionaries: {
                $ref: '#/definitions/LocationEntry',
              },
            },
          },
        },
      },
      definitions: {
        Dictionaries: {
          type: 'object',
          properties: {
            locations: {
              $ref: '#/definitions/LocationEntry',
            },
          },
        },
        LocationEntry: {
          additionalProperties: {
            $ref: '#/definitions/LocationValue',
          },
        },
        LocationValue: {
          properties: {
            cityCode: {
              description: 'City code associated to the airport',
              example: 'PAR',
              type: 'string',
            },
          },
        },
      },
    }

    // Run the specification through our new parser
    const schema = resolveReferences(
      specification,
    ) as ResolvedOpenAPIV2.Document

    // Assertion
    expect(schema.swagger).toBe('2.0')
    expect(
      schema.paths['/foobar'].post.responses[200].schema.properties.dictionaries
        .additionalProperties,
    ).toMatchObject({
      properties: {
        cityCode: {
          description: 'City code associated to the airport',
          example: 'PAR',
          type: 'string',
        },
      },
    })
  })

  it('resolves a simple circular reference', async () => {
    const schema: AnyObject = {
      foo: {
        bar: {
          $ref: '#/foo',
        },
      },
    }

    const result = resolveReferences(schema)

    // Circular references can’t be JSON.stringify’d (easily)
    expect(() => JSON.stringify(result, null, 2)).toThrow()

    // Sky is the limit
    // @ts-expect-error We’re misusing the function and pass a partial specification only.
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

    // Typecasting: We’re misusing the function and pass a partial specification only.
    const result = resolveReferences(schema) as any

    // Circular references can’t be JSON.stringify’d (easily)
    expect(() => JSON.stringify(result, null, 2)).toThrow()

    // Sky is the liit
    expect(
      result.schemas.element.properties.element.properties.element.properties
        .element,
    ).toBeTypeOf('object')
  })

  it('resolves an OpenAPI-like circular reference', async () => {
    const specification = {
      type: 'object',
      properties: {
        element: { $ref: '#/schemas/element' },
      },
      schemas: {
        element: {
          type: 'object',
          properties: {
            element: { $ref: '#/schemas/element' },
          },
        },
      },
    }

    const schema = resolveReferences(specification)

    // Original specification should not be mutated
    expect(specification.properties.element.$ref).toBeTypeOf('string')

    // Circular dependency should be resolved
    // @ts-expect-error We’re misusing the function and pass a partial specification only.
    expect(schema.properties.element.type).toBe('object')
    // @ts-expect-error We’re misusing the function and pass a partial specification only.
    expect(schema.properties.element.properties.element.type).toBe('object')
    expect(
      // @ts-expect-error We’re misusing the function and pass a partial specification only.
      schema.properties.element.properties.element.properties.element.type,
    ).toBe('object')

    // Circular references can’t be JSON.stringify’d (easily)
    expect(() => JSON.stringify(schema, null, 2)).toThrow()
  })
})
