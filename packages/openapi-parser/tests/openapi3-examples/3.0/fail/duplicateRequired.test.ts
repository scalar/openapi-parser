import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import duplicateRequired from './duplicateRequired.yaml'

describe.todo('duplicateRequired', () => {
  it('returns an error', async () => {
    const result = await resolve(duplicateRequired)

    expect(result.errors?.[0]?.error).toBe(
      `something something duplicate required properties`,
    )
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
