import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import extensionsEverywhere from './extensionsEverywhere.yaml'

describe('extensionsEverywhere', () => {
  it('passes', async () => {
    const result = await resolve(extensionsEverywhere)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
