import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import deprecated3 from './deprecated3.yaml'

describe.todo('deprecated3', () => {
  it('returns an error', async () => {
    const result = await resolve(deprecated3)

    expect(result.errors?.[0]?.error).toBe(`something something deprecated`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
