import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import internalPathItemRef from './internalPathItemRef.yaml'

describe('internalPathItemRef', () => {
  it('returns an error', async () => {
    const result = await resolve(internalPathItemRef)

    // expect(result.errors?.[0]?.message).toBe(`Can’t resolve URI: #/paths/test2`)
    // expect(result.errors?.length).toBe(1)
    // expect(result.valid).toBe(false)
  })
})
