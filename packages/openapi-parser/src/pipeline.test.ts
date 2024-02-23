import { describe, expect, it } from 'vitest'

import { openapi } from '.'

const specification = {
  openapi: '3.1.0',
  info: {
    title: 'Hello World',
    version: '1.0.0',
  },
  paths: {},
}

describe('pipeline', () => {
  it('upgrade', async () => {
    const result = openapi()
      .load({
        openapi: '3.0.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {},
      })
      .upgrade()
      .get()

    expect(result.openapi).toBe('3.1.0')
  })

  it('details', async () => {
    const result = openapi()
      .load({
        openapi: '3.0.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {},
      })
      .details()

    expect(result.version).toBe('3.0')
  })

  it('upgrade + details', async () => {
    const result = openapi()
      .load({
        openapi: '3.0.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {},
      })
      .upgrade()
      .details()

    expect(result.version).toBe('3.1')
  })

  it('filter x-internal', async () => {
    const specification = {
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/': {
          get: {
            'x-internal': true,
            'responses': {
              200: {
                description: 'OK',
              },
            },
          },
        },
        '/foobar': {
          get: {
            responses: {
              200: {
                description: 'OK',
              },
            },
          },
        },
      },
    }

    const result = openapi()
      .load(specification)
      .filter((schema) => !schema?.['x-internal'])
      .get()

    expect(result.openapi).toBe('3.1.0')
    expect(result.paths['/'].get).toBeUndefined()
    expect(result.paths['/foobar'].get).not.toBeUndefined()
  })

  it('filter tags', async () => {
    const specification = {
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/': {
          get: {
            tags: ['Beta'],
            responses: {
              200: {
                description: 'OK',
              },
            },
          },
        },
        '/foobar': {
          get: {
            responses: {
              200: {
                description: 'OK',
              },
            },
          },
        },
      },
    }

    const result = openapi()
      .load(specification)
      .filter((schema) => !schema?.tags?.includes('Beta'))
      .get()

    expect(result.openapi).toBe('3.1.0')
    expect(result.paths['/'].get).toBeUndefined()
    expect(result.paths['/foobar'].get).not.toBeUndefined()
  })

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

    expect(result.schema.info.title).toBe('Hello World')
  })

  it('validate + resolve', async () => {
    const validation = await openapi().load(specification).validate()
    const result = await validation.resolve()

    expect(result.valid).toBe(true)
    expect(result.schema.info.title).toBe('Hello World')
  })
})
