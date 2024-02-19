import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../../src'
import openApiUi from './openapi-ui.yaml'

describe('openapi-ui', () => {
  it('apiWithExamples', async () => {
    const result = await resolve(openApiUi)

    // TODO: SwaggerUI has a more helpful error message:
    //
    // Structural error at paths./project/{projectUUID}/invite/.get.responses.200
    // should NOT have additional properties
    // additionalProperty: schema
    // …
    expect(result.errors?.[0]?.error).toBe(`must have required property '$ref'`)
    expect(result.valid).toBe(false)
  })
})
