import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import server_enum_empty from './server_enum_empty.yaml'

describe.todo('server_enum_empty', () => {
  it('passes', async () => {
    const result = await resolve(server_enum_empty)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
