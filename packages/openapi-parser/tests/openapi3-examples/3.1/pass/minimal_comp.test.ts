import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import minimal_comp from './minimal_comp.yaml'

describe('minimal_comp', () => {
  it('passes', async () => {
    const result = await resolve(minimal_comp)
    expect(result.valid).toBe(true)
    expect(result.errors).toStrictEqual([])
    expect(result.version).toBe('3.1')
  })
})
