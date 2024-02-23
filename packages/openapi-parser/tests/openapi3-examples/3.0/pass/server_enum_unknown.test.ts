import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import server_enum_unknown from './server_enum_unknown.yaml'

describe.todo('server_enum_unknown', () => {
  it('passes', async () => {
    const result = await resolve(server_enum_unknown)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
