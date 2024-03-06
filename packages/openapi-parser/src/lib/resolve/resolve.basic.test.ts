/**
 * This file has some simple tests to cover the basics of the resolveRefs function.
 * Doesn’t cover all edge cases, doesn’t have big files, but if this works you’re almost there.
 */
import SwaggerParser from '@apidevtools/swagger-parser'
import { describe, expect, it } from 'vitest'

import { resolve } from './resolve'

describe('resolve', () => {
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
    const newSchema = resolve(specification, true)

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
            // Does work:
            // content: {},
            // Doesn’t work:
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
    const newSchema = resolve(specification, true)

    // // Debug output
    // console.log('[INPUT]', JSON.stringify(specification, null, 2))
    // console.log(
    //   '[@apidevtools/swagger-parser]',
    //   oldSchema.paths['/foobar'].post.requestBody,
    // )
    // console.log('[@scalar/openapi-parser]', JSON.stringify(newSchema, null, 2))

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
    const schema = resolve(specification, true)

    // Debug output
    // console.log(
    //   '[INPUT]',
    //   // @ts-ignore
    //   specification.paths['/foobar'].post.requestBody,
    // )
    // console.log(
    //   '[@scalar/openapi-parser]',
    //   schema.paths['/foobar'].post.requestBody.content['application/json']
    //     .schema,
    // )

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
    const schema = resolve(specification, true)

    // Debug output
    // console.log(
    //   '[INPUT]',
    //   // @ts-ignore
    //   specification.paths['/foobar'].post.requestBody,
    // )
    // console.log(
    //   '[@scalar/openapi-parser]',
    //   schema.paths['/foobar'].post.requestBody.content['application/json']
    //     .schema,
    // )

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
    const schema = resolve(specification, true)

    // Debug output
    // console.log(
    //   '[INPUT]',
    //   // @ts-ignore
    //   specification.paths['/foobar'].post.requestBody,
    // )
    // console.log(
    //   '[@scalar/openapi-parser]',
    //   schema.paths['/foobar'].post.requestBody.content['application/json']
    //     .schema,
    // )

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
  it('resolves a circular reference', async () => {
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

    const schema = resolve(specification, true)

    const correctSchema = {
      type: 'object',
      properties: {
        element: {
          type: 'object',
          properties: {
            element: {
              type: 'object',
              properties: {
                element: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
      schemas: {
        element: {
          type: 'object',
          properties: {
            element: {
              type: 'object',
              properties: {
                element: {
                  type: 'object',
                  properties: {
                    element: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
      },
    }

    // Circular dependency should be resolved
    expect(correctSchema.properties.element.type).toBe('object')
    expect(correctSchema.properties.element.properties.element.type).toBe(
      'object',
    )
    console.log(
      correctSchema.properties.element.properties.element.properties.element,
    )
    expect(
      correctSchema.properties.element.properties.element.properties.element
        .type,
    ).toBe('object')

    expect(schema).toMatchObject(correctSchema)

    // Original specification should not be mutated
    expect(specification.properties.element.$ref).toBeTypeOf('string')

    // Circular dependency should be resolved
    expect(schema.properties.element.type).toBe('object')
    expect(schema.properties.element.properties.element.type).toBe('object')
    console.log(schema.properties.element.properties.element.properties.element)
    expect(
      schema.properties.element.properties.element.properties.element.type,
    ).toBe('object')
  })
})
