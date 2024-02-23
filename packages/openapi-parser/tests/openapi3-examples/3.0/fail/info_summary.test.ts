import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import info_summary from './info_summary.yaml'

describe('info_summary', () => {
  it('returns an error', async () => {
    const result = await resolve(info_summary)

    expect(result.errors?.[0]?.error).toBe(
      'Property summary is not expected to be here',
    )
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
