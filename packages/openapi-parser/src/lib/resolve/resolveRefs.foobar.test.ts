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

    // Debug output
    console.log(
      '[INPUT]',
      // @ts-ignore
      specification.paths['/foobar'].post.requestBody,
    )
    console.log(
      '[@apidevtools/swagger-parser]',
      oldSchema.paths['/foobar'].post.requestBody,
    )
    console.log(
      '[@scalar/openapi-parser]',
      newSchema.paths['/foobar'].post.requestBody,
    )

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
})
