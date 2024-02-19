import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import comp_pathitems from './comp_pathitems.yaml'

describe('comp_pathitems', () => {
  it('returns an error', async () => {
    const result = await resolve(comp_pathitems)

    // TODO: Should probably complain about the pathItems?
    expect(result.errors?.[0]?.error).toBe(
      `must have required property 'paths'`,
    )
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
