import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import missingPathParam from './missingPathParam.yaml'

describe.todo('missingPathParam', () => {
  it('returns an error', async () => {
    const result = await resolve(missingPathParam)

    // TODO: Swagger Editor
    //
    // * Declared path parameter "test2" needs to be defined as a path parameter at either the path or operation level
    // * Path parameter "test" must have the corresponding {test} segment in the "/test/{test2}" path
    expect(result.errors?.[0]?.error).toBe(`something something test`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
