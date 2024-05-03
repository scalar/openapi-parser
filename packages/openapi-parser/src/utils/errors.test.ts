import { describe, expect, it } from 'vitest'

import { resolve } from './resolve'

describe('errors', () => {
  it('info required', async () => {
    const result = await resolve({
      openapi: '3.1.0',
      paths: {},
    })

    expect(result).toMatchObject({
      errors: [
        {
          message: `must have required property 'info'`,
        },
      ],
      valid: false,
    })
  })

  it('unevaluated property', async () => {
    const spec = {
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/test': {
          foobar: {
            responses: {
              200: {
                description: 'OK',
              },
            },
          },
        },
      },
    }
    const result = await resolve(spec)

    expect(result).toMatchObject({
      schema: {
        ...spec,
      },
      errors: [
        {
          message: `Property foobar is not expected to be here`,
        },
      ],
      valid: false,
    })
  })
})
