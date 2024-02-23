import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import info_summary from './info_summary.yaml'

describe('info_summary', () => {
  it('passes', async () => {
    const result = await resolve(info_summary)
    expect(result.valid).toBe(true)
    expect(result.errors).toBeUndefined()
    expect(result.version).toBe('3.1')
  })
})
