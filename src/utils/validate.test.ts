import { describe, expect, it } from 'vitest'
import { validate } from './'

describe('validate', async () => {
  it('fails on invalid schema', async () => {
    const result = await validate('')

    expect(result.valid).toBe(false)
    expect(result.errors).toBe('Cannot find JSON, YAML or filename in data')
  })

  it('returns errors for an invalid schema', async () => {
    const result = await validate(`{
        "openapi": "3.1.0",
        "paths": {}
      }`)

    expect(result.valid).toBe(false)

    expect(Array.isArray(result.errors) ? result.errors[0].message : '').toBe(
      `must have required property 'info'`,
    )
  })
})
