import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../../src'
import refEncoding2 from './ref-encoding2.yaml'

describe('ref-encoding2', () => {
  it('passes', async () => {
    const result = await resolve(refEncoding2)

    expect(result.errors).toStrictEqual([])
    expect(result.valid).toBe(true)
    expect(result.version).toBe('2.0')
  })
})
