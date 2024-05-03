import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import path_no_response from './path_no_response.yaml'

describe('path_no_response', () => {
  it('passes', async () => {
    const result = await resolve(path_no_response)
    expect(result.valid).toBe(true)
    expect(result.errors).toStrictEqual([])
    expect(result.version).toBe('3.1')
  })
})
