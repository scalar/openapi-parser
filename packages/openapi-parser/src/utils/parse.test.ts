import { describe, expect, it } from 'vitest'

import { parse } from './'

describe('parse', async () => {
  it('parses an OpenAPI 3.1.0 file', async () => {
    const result = await parse(`{
      "openapi": "3.1.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.document.info.title).toBe('Hello World')
  })

  it('parses an OpenAPI 3.0.0 file', async () => {
    const result = await parse(`{
      "openapi": "3.0.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.document.info.title).toBe('Hello World')
  })

  it('parses an Swagger 2.0 file', async () => {
    const result = await parse(`{
      "swagger": "2.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.valid).toBe(true)
    expect(result.document.info.title).toBe('Hello World')
  })

  it('doesn’t work with OpenAPI 4.0.0', async () => {
    const result = await parse(`{
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
    const result = await parse('pineapples')

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].error).toBe(
      'Cannot find JSON, YAML or filename in data',
    )
  })

  it('works with YAML', async () => {
    const result = await parse(`openapi: 3.1.0
info:
  title: Hello World
  version: 1.0.0
paths: {}
`)

    expect(result.document.info.title).toBe('Hello World')
  })

  it('returns the version', async () => {
    const result = await parse(`{
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
})
