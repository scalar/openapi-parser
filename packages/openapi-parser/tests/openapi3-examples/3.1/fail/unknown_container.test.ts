import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import unknown_container from './unknown_container.yaml'

describe('unknown_container', () => {
  it('returns an error', async () => {
    const result = await resolve(unknown_container)

    // TODO: The message should complain about the unknown container
    expect(result.errors?.[0]?.error).toBe(
      `must have required property 'webhooks'`,
    )
    expect(result.valid).toBe(false)
  })
})
