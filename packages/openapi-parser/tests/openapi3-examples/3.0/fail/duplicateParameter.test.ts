import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import duplicateParameter from './duplicateParameter.yaml'

describe.todo('duplicateParameter', () => {
  it('returns an error', async () => {
    const result = await resolve(duplicateParameter)

    expect(result.errors?.[0]?.error).toBe(
      `something something duplicate parameter`,
    )
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
