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

    expect(result.info.title).toBe('Hello World')
  })

  it('throws an error when the schema is invalid', async () => {
    await expect(() => parse('pineapples')).rejects.toThrowError(
      'Invalid Schema: Cannot find JSON, YAML or filename in data',
    )
  })
})
