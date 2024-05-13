import { describe, expect, it } from 'vitest'

import { validate } from './'

describe('validate', async () => {
  it('fails on invalid schema', async () => {
    const result = await validate('')

    expect(result.valid).toBe(false)
    expect(result.errors).toMatchObject([
      {
        message: 'Cannot find JSON, YAML or filename in data',
      },
    ])
  })

  it('returns errors for an invalid schema', async () => {
    const result = await validate(
      `{
        "openapi": "3.1.0",
        "paths": {}
      }`,
    )

    expect(result.valid).toBe(false)

    expect(result.errors).toBeTypeOf('object')
    expect(Array.isArray(result.errors)).toBe(true)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0]).toMatchObject({
      message: "must have required property 'info'",
    })
  })

  it('returns errors for an invalid specification', async () => {
    const result = await validate('pineapples')

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toBe(
      'Cannot find supported Swagger/OpenAPI version in specification, version must be a string.',
    )
  })

  it('works with YAML', async () => {
    const result = await validate(`openapi: 3.1.0
info:
  title: Hello World
  version: 1.0.0
paths: {}
`)

    expect(result.schema.info.title).toBe('Hello World')
  })

  it('doesn’t work with OpenAPI 4.0.0', async () => {
    const result = await validate(`{
      "openapi": "4.0.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toContain(
      'Cannot find supported Swagger/OpenAPI version in specification',
    )
  })
})
