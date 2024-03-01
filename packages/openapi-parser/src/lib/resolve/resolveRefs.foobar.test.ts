import SwaggerParser from '@apidevtools/swagger-parser'
import { describe, expect, it } from 'vitest'

import { resolveRefs } from './resolveRefs'

describe('resolveRefs', () => {
  it('foobar', async () => {
    const specification = {
      openapi: '3.1.0',
      info: {},
      paths: {
        '/foobar': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/FoobarRequestBody',
            },
          },
        },
      },
      components: {
        requestBodies: {
          CursorRequest: {
            content: {},
          },
          FoobarRequestBody: {
            // Does work:
            // content: {},
            // Doesn’t work:
            $ref: '#/components/requestBodies/CursorRequest',
          },
        },
      },
    }

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

    const newSchema = resolveRefs(specification)

    // Debug output
    console.log(
      '[SPECIFICATION]',
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
})
