import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import minimal_paths from './minimal_paths.yaml'

describe('minimal_paths', () => {
  it('passes', async () => {
    const result = await resolve(minimal_paths)
    expect(result.valid).toBe(true)
    expect(result.errors).toBeUndefined()
    expect(result.version).toBe('3.1')
  })
})
