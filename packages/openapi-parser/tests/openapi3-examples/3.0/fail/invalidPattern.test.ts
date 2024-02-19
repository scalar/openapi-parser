import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import invalidPattern from './invalidPattern.yaml'

describe('invalidPattern', () => {
  it('returns an error', async () => {
    const result = await resolve(invalidPattern)

    // TODO: Swagger Editor
    //
    // Resolver error at paths./test.$ref
    // Could not resolve reference: undefined undefined
    expect(result.errors?.[0]?.error).toBe(`must have required property '$ref'`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
