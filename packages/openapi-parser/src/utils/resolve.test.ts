import { describe, expect, it } from 'vitest'

import { resolve } from './resolve'

describe('resolve', async () => {
  it('resolves an OpenAPI 3.1.0 file', async () => {
    const result = await resolve(`{
      "openapi": "3.1.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.schema.info.title).toBe('Hello World')
  })

  it('resolves an OpenAPI 3.0.0 file', async () => {
    const result = await resolve(`{
      "openapi": "3.0.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.schema.info.title).toBe('Hello World')
  })

  it('resolves an Swagger 2.0 file', async () => {
    const result = await resolve(`{
      "swagger": "2.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.schema.info.title).toBe('Hello World')
  })

  it('doesn’t work with OpenAPI 4.0.0', async () => {
    const result = await resolve(`{
      "openapi": "4.0.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].error).toContain(
      'Cannot find supported Swagger/OpenAPI version in specification',
    )
  })

  it('returns errors for an invalid specification', async () => {
    const result = await resolve('pineapples')

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].error).toBe(
      'Cannot find supported Swagger/OpenAPI version in specification, version must be a string.',
    )
  })

  it('works with YAML', async () => {
    const result = await resolve(`openapi: 3.1.0
info:
  title: Hello World
  version: 1.0.0
paths: {}
`)

    expect(result.schema.info.title).toBe('Hello World')
  })

  it('returns version 3.1', async () => {
    const result = await resolve(`{
      "openapi": "3.1.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.1')
  })

  it('returns version 3.0', async () => {
    const result = await resolve(`{
      "openapi": "3.0.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })

  it('returns version 2.0', async () => {
    const result = await resolve(`{
      "swagger": "2.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('2.0')
  })

  it('doesn’t return version 4.0', async () => {
    const result = await resolve(`{
      "openapi": "4.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(false)
    expect(result.version).toBe(undefined)
  })
})

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

  const result = await resolve(openapi)

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
})
