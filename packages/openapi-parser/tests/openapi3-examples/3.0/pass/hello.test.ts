import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import hello from './hello.yaml'

describe('hello', () => {
  it('passes', async () => {
    const result = await resolve(hello)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
