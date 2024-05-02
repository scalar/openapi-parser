import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import schema from './schema.yaml'

describe('schema', () => {
  it('passes', async () => {
    const result = await resolve(schema)
    expect(result.valid).toBe(true)
    expect(result.errors).toStrictEqual([])
    expect(result.version).toBe('3.1')
  })
})
