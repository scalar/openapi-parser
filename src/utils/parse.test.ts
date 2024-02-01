import { describe, expect, it } from 'vitest'
import { parse } from './'

describe('parse', async () => {
  it('parses an OpenAPI file', async () => {
    const result = await parse(`{
      "openapi": "3.1.0",
      "info": {
          "title": "Hello World",
          "version": "1.0.0"
      },
      "paths": {}
    }`)

    expect(result.document.info.title).toBe('Hello World')
  })

  it('throws an error when the schema is invalid', async () => {
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
})
