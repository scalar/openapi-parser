/**
 * This file has some simple tests to cover the basics of the resolveRefs function.
 * Doesn’t cover all edge cases, doesn’t have big files, but if this works you’re almost there.
 */
import SwaggerParser from '@apidevtools/swagger-parser'
import { describe, expect, it } from 'vitest'

import { resolveRefs } from './resolveRefs'

describe('resolveRefs', () => {
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
    const newSchema = resolveRefs(specification)

    // // Debug output
    // console.log(
    //   '[INPUT]',
    //   // @ts-ignore
    //   specification.paths['/foobar'].post.requestBody,
    // )
    // console.log(
    //   '[@apidevtools/swagger-parser]',
    //   oldSchema.paths['/foobar'].post.requestBody,
    // )
    // console.log(
    //   '[@scalar/openapi-parser]',
    //   newSchema.paths['/foobar'].post.requestBody,
    // )

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
    const schema = resolveRefs(specification)

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
    const schema = resolveRefs(specification)

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
    const schema = resolveRefs(specification)

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
})
