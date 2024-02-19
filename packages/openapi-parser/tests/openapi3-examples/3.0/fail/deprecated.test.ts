import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import deprecated from './deprecated.yaml'

describe('deprecated', () => {
  it('returns an error', async () => {
    const result = await resolve(deprecated)

    expect(result.errors?.[0]?.error).toBe(`: type must be boolean`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
