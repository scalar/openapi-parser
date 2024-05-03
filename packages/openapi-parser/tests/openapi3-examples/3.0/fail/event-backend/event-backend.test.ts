import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../../src'
import openapi1 from './openapi1.json'
import openapi2 from './openapi2.json'
import openapi3 from './openapi3.json'

describe('event-backend', () => {
  it('openapi1', async () => {
    const result = await resolve(openapi1)

    // TODO: What does that mean?
    expect(result.errors?.[0]?.message).toBe(
      `must have required property '$ref'`,
    )
    expect(result.valid).toBe(false)
  })

  it('openapi2', async () => {
    const result = await resolve(openapi2)

    // TODO: What does that mean?
    expect(result.errors?.[0]?.message).toBe(
      `must have required property '$ref'`,
    )
    expect(result.valid).toBe(false)
  })

  it('openapi3', async () => {
    const result = await resolve(openapi3)

    // TODO: What does that mean?
    expect(result.errors?.[0]?.message).toBe(
      `must have required property '$ref'`,
    )
    expect(result.valid).toBe(false)
  })
})
