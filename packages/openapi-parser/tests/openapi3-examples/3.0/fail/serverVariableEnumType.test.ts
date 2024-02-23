import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import serverVariableEnumType from './serverVariableEnumType.yaml'

describe('serverVariableEnumType', () => {
  it('returns an error', async () => {
    const result = await resolve(serverVariableEnumType)

    // TODO: Swagger Editor has a better error message
    //
    // Structural error at servers.0.variables.version.enum.1 should be string
    expect(result.errors?.[0]?.error).toBe(`: type must be string`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
