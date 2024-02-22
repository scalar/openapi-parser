import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import hasFlowNotFlows from './hasFlowNotFlows.json'

describe('hasFlowNotFlows', () => {
  it('returns an error', async () => {
    const result = await resolve(hasFlowNotFlows)

    // TODO: This should probably mention the incorrect security type?
    expect(result.errors?.[0]?.error).toBe(`must have required property '$ref'`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
