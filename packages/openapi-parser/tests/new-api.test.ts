import { describe, expect, it } from 'vitest'

import { validate } from '../src'

const specification = {
  openapi: '3.1.0',
  info: {
    title: 'Hello World',
    version: '1.0.0',
  },
  paths: {},
}

describe('new-api', () => {
  it('validates', async () => {
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
})

function openapi() {
  return {
    load: (specification: string | Record<string, any>) => ({
      validate: async () => {
        return {
          ...(await validate(specification)),
        }
      },
      toJson: () => {
        return JSON.stringify(specification, null, 2)
      },
    }),
  }
}
