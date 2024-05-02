import { describe, expect, it } from 'vitest'

import { resolve } from '../../../../src'
import schemaProperties from './schemaProperties.yaml'

describe('schemaProperties', () => {
  it('returns an error', async () => {
    const { valid, errors, schema } = await resolve(schemaProperties)

    expect(schema?.components?.schemas?.SomeObject).not.toBe(undefined)

    expect(errors).not.toBe(undefined)
    expect(errors).not.toStrictEqual([])
    // @ts-ignore
    expect(errors[0]?.message).toBe(
      'Can’t resolve external reference: ../resources/myobject.yml',
    )
    expect(errors.length).toBe(1)
    expect(valid).toBe(false)
  })
})
