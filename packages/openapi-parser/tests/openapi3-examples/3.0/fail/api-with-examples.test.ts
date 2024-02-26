import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import apiWithExamples from './api-with-examples.yaml'

describe('api-with-examples', () => {
  it('returns an error', async () => {
    const result = await resolve(apiWithExamples)

    // TODO: Swagger Editor:
    //
    // Structural error at paths./.get.responses.200.content.application/json.examples
    // should be object
    // …
    expect(result.errors?.[0]?.error).toBe(`must have required property '$ref'`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
