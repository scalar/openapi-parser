import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import internalPathItemRef from './internalPathItemRef.yaml'

describe.todo('internalPathItemRef', () => {
  it('returns an error', async () => {
    const result = await resolve(internalPathItemRef)

    // TODO: Swagger Editor
    //
    // Resolver error at paths./test.$ref
    // Could not resolve reference: undefined undefined
    expect(result.errors?.[0]?.error).toBe(
      `something something internal path item ref`,
    )
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
