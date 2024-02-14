import { describe, expect, it } from 'vitest'

import { openapi } from '../src'

const specification = {
  openapi: '3.1.0',
  info: {
    title: 'Hello World',
    version: '1.0.0',
  },
  paths: {},
}

describe('OpenApi', () => {
  it('validate', async () => {
    const result = await openapi().load(specification).validate()

    expect(result).toMatchObject({
      valid: true,
      version: '3.1',
    })
  })

  it('toJson', async () => {
    const result = openapi().load(specification).toJson()

    expect(result).toBe(JSON.stringify(specification, null, 2))
  })

  it('resolve', async () => {
    const result = await openapi().load(specification).resolve()

    expect(result.document.info.title).toBe('Hello World')
  })
})
