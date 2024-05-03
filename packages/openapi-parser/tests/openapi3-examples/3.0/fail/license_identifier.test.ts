import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import license_identifier from './license_identifier.yaml'

describe('license_identifier', () => {
  it('returns an error', async () => {
    const result = await resolve(license_identifier)

    // TODO: Swagger Editor
    //
    // Structural error at info.license
    // should NOT have additional properties
    // additionalProperty: identifier
    expect(result.errors?.[0]?.message).toBe(
      `Property identifier is not expected to be here`,
    )
    expect(result.valid).toBe(false)
  })
})
