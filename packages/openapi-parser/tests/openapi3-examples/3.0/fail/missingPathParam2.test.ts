import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import missingPathParam2 from './missingPathParam2.yaml'

describe.todo('missingPathParam2', () => {
  it('returns an error', async () => {
    const result = await resolve(missingPathParam2)

    // TODO: Swagger Editor
    //
    // Semantic error at paths./test/{test}/{test2}
    // Declared path parameter "test2" needs to be defined as a path parameter at either the path or operation level
    expect(result.errors?.[0]?.error).toBe(`something something test2`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
