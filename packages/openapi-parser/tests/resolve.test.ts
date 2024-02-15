import { expect, it } from 'vitest'

import { parse } from '../src'

it('resolves a simple reference', async () => {
  const openapi = {
    openapi: '3.1.0',
    info: {
      title: 'Hello World',
      version: '1.0.0',
    },
    paths: {
      '/test': {
        get: {
          responses: {
            '200': {
              // TODO: This is valid in @apidevtools/swagger, but not with our implementation
              description: 'foobar',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Test',
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Test: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    },
  }

  const result = await parse(openapi)

  expect(result.errors).toBe(undefined)
  expect(result.valid).toBe(true)

  // Original
  expect(
    result.specification.paths['/test'].get.responses['200'].content[
      'application/json'
    ].schema,
  ).toEqual({
    $ref: '#/components/schemas/Test',
  })

  // Resolved references
  expect(
    result.schema.paths['/test'].get.responses['200'].content[
      'application/json'
    ].schema,
  ).toEqual({
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
    },
  })

  console.log(result)
})
