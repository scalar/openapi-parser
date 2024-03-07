import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../../src'
import refEncoding3 from './ref-encoding3.yaml'

describe('ref-encoding3', () => {
  it('passes', async () => {
    const result = await resolve(refEncoding3)

    expect(result.errors).toBe(undefined)
    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
