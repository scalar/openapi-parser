import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import missingPathItemRef from './missingPathItemRef.yaml'

describe.todo('missingPathItemRef', () => {
  it('returns an error', async () => {
    const result = await resolve(missingPathItemRef)

    // TODO: Swagger Editor
    //
    // * Resolver error at paths./test.$ref
    // Could not resolve reference: undefined undefined
    expect(result.errors?.[0]?.error).toBe(`something something test`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
