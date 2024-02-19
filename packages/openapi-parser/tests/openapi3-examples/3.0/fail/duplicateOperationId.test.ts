import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import duplicateOperationId from './duplicateOperationId.yaml'

describe.todo('duplicateOperationId', () => {
  it('returns an error', async () => {
    const result = await resolve(duplicateOperationId)

    expect(result.errors?.[0]?.error).toBe(
      `something something duplicate operationId`,
    )
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
