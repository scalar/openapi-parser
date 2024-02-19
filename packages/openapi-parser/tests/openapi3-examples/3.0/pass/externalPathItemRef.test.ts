import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import externalPathItemRef from './externalPathItemRef.yaml'

describe('externalPathItemRef', () => {
  it('passes', async () => {
    const result = await resolve(externalPathItemRef)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
