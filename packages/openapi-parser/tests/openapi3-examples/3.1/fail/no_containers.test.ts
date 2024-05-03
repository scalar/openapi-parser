import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import no_containers from './no_containers.yaml'

describe('no_containers', () => {
  it('returns an error', async () => {
    const result = await resolve(no_containers)

    // TODO: Fix the expected error message should mention 'paths'
    expect(result.errors?.[0]?.message).toBe(
      `must have required property 'webhooks'`,
    )
    expect(result.valid).toBe(false)
  })
})
