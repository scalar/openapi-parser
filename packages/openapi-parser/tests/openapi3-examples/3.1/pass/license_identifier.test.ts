import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import license_identifier from './license_identifier.yaml'

describe('license_identifier', () => {
  it('passes', async () => {
    const result = await resolve(license_identifier)
    expect(result.valid).toBe(true)
    expect(result.errors).toBeUndefined()
    expect(result.version).toBe('3.1')
  })
})
