import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import schemaProperties from './schemaProperties.yaml'

describe.todo('schemaProperties', () => {
  it('returns an error', async () => {
    const result = await resolve(schemaProperties)

    // TODO: Swagger Editor
    //
    // Resolver error at components.schemas.SomeObject.$ref
    // Could not resolve reference: undefined undefined
    expect(result.schema.components.schemas.SomeObject).not.toBe(undefined)
    expect(result.errors?.[0]?.error).toBe(`: type must be string`)
    expect(result.errors?.length).toBe(1)
    expect(result.valid).toBe(false)
  })
})
