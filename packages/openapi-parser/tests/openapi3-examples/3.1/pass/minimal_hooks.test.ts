import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import minimal_hooks from './minimal_hooks.yaml'

describe('minimal_hooks', () => {
  it('passes', async () => {
    const result = await resolve(minimal_hooks)
    expect(result.valid).toBe(true)
    expect(result.errors).toBeUndefined()
    expect(result.version).toBe('3.1')
  })
})
