import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import invalidSchemaName from './invalidSchemaName.json'

describe('invalidSchemaName', () => {
  it('returns an error', async () => {
    const result = await resolve(invalidSchemaName)

    // TODO: Swagger Editor
    //
    // * Could not resolve reference: undefined undefined
    expect(result.errors?.[0]?.error).toBe(`must have required property '$ref'`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
