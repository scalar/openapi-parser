import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import deprecated2 from './deprecated2.yaml'

describe.todo('deprecated2', () => {
  it('returns an error', async () => {
    const result = await resolve(deprecated2)

    expect(result.errors?.[0]?.message).toBe(`something something deprecated`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
