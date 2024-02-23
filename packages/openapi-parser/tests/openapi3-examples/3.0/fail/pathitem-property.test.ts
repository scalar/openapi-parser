import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import pathitemProperty from './pathitem-property.yaml'

describe('pathitem-property', () => {
  it('returns an error', async () => {
    const result = await resolve(pathitemProperty)

    expect(result.errors?.[0]?.error).toBe(
      `Property GET is not expected to be here`,
    )
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
