import { describe, expect, it } from 'vitest'

import { checkReferences } from './checkReferences'

describe('checkReferences', () => {
  it('returns true for a simple internal reference', () => {
    const specification = {
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '2.0.0',
      },
      paths: {
        '/foobar': {
          post: {
            description: 'Example',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Foobar',
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Foobar: {
            type: 'string',
            example: 'Hello World!',
          },
        },
      },
    }

    const result = checkReferences(specification)
    expect(result.errors).toStrictEqual([])
    expect(result.valid).toBe(true)
  })

  it('returns false for a broken internal reference', () => {
    const specification = {
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '2.0.0',
      },
      paths: {
        '/foobar': {
          post: {
            description: 'Example',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Barfoo',
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Foobar: {
            type: 'string',
            example: 'Hello World!',
          },
        },
      },
    }

    const result = checkReferences(specification)

    // expect(result.valid).toBe(false)
    // expect(result.errors).not.toBeUndefined()
    // expect(result.errors.length).toBe(1)
  })
})
