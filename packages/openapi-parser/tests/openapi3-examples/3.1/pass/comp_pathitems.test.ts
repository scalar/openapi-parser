import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import comp_pathitems from './comp_pathitems.yaml'

describe('comp_pathitems', () => {
  it('passes', async () => {
    const result = await resolve(comp_pathitems)
    expect(result.valid).toBe(true)
    expect(result.errors).toBeUndefined()
    expect(result.version).toBe('3.1')
  })
})
