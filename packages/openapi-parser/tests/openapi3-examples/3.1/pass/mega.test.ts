import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import mega from './mega.yaml'

describe('mega', () => {
  it('passes', async () => {
    const result = await resolve(mega)
    expect(result.valid).toBe(true)
    expect(result.errors).toBeUndefined()
    expect(result.version).toBe('3.1')
  })
})
