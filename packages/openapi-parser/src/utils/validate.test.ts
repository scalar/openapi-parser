import { describe, expect, it } from 'vitest'

import { validate } from './'

describe('validate', async () => {
  it('fails on invalid schema', async () => {
    const result = await validate('')

    expect(result.valid).toBe(false)
    expect(result.errors).toMatchObject([
      {
        error: 'Cannot find JSON, YAML or filename in data',
        path: '',
        start: {
          column: 1,
          line: 1,
          offset: 0,
        },
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
      error: "must have required property 'info'",
      path: '',
      start: {
        column: 1,
        line: 1,
        offset: 0,
      },
    })
  })
})
