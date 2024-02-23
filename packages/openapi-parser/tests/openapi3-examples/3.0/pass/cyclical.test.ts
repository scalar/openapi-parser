import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import cyclical from './cyclical.yaml'

describe.todo('cyclical', () => {
  it('passes', async () => {
    const result = await resolve(cyclical)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
