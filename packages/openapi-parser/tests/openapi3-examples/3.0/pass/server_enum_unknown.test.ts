import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import server_enum_unknown from './server_enum_unknown.yaml'

describe.todo('server_enum_unknown', () => {
  it('passes', async () => {
    const result = await resolve(server_enum_unknown)

    expect(result.valid).toBe(false)
    expect(result.errors?.length).toBe(1)
    expect(result.errors?.[0]?.error).toBe(
      'should be equal to one of the allowed values',
    )
  })
})
