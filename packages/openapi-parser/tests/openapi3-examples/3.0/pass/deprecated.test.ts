import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import deprecated from './deprecated.yaml'

describe('deprecated', () => {
  it('passes', async () => {
    const result = await resolve(deprecated)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
