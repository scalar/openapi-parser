import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stringify } from 'yaml'

import { openapi } from '.'
import { readFilesPlugin } from './utils/load/plugins/readFilesPlugin'

const specification = {
  openapi: '3.1.0',
  info: {
    title: 'Hello World',
    version: '1.0.0',
  },
  paths: {},
}

const EXAMPLE_FILE = join(
  new URL(import.meta.url).pathname,
  '../utils/examples/openapi.yaml',
)

describe('openapi', () => {
  it('load object', async () => {
    const result = await openapi()
      .load({
        openapi: '3.1.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {},
      })
      .get()

    expect(result.openapi).toBe('3.1.0')
  })

  it('load string', async () => {
    const result = await openapi()
      .load(
        JSON.stringify({
          openapi: '3.1.0',
          info: {
            title: 'Hello World',
            version: '1.0.0',
          },
          paths: {},
        }),
      )
      .get()

    expect(result.openapi).toBe('3.1.0')
  })

  it('load file', async () => {
    const result = await openapi()
      .load(EXAMPLE_FILE, {
        plugins: [readFilesPlugin()],
      })
      .get()

    expect(result.openapi).toBe('3.1.0')
  })

  it('files', async () => {
    const filesystem = await openapi()
      .load(EXAMPLE_FILE, {
        plugins: [readFilesPlugin()],
      })
      .files()

    expect(filesystem).toMatchObject([
      {
        isEntrypoint: true,
        specification: {
          openapi: '3.1.0',
          info: {
            title: 'Hello World',
            version: '1.0.0',
          },
          paths: {},
        },
        filename: null,
        references: [],
      },
    ])
  })

  it('upgrade from 3.0 to 3.1', async () => {
    const result = await openapi()
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
    const result = await openapi()
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

  it('upgrade > dereference', async () => {
    const result = await openapi()
      .load({
        openapi: '3.0.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {},
      })
      .upgrade()
      .dereference()
      .get()

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

    const result = await openapi()
      .load(specification)
      .filter((schema) => !schema?.['x-internal'])
      .get()

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

    const result = await openapi()
      .load(specification)
      .filter((schema) => !schema?.tags?.includes('Beta'))
      .get()

    expect(result.paths['/'].get).toBeUndefined()
    expect(result.paths['/foobar'].get).not.toBeUndefined()
  })

  it('upgrade > filter', async () => {
    const specification = {
      openapi: '3.0.0',
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

    const result = await openapi()
      .load(specification)
      .upgrade()
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
    const result = await openapi().load(specification).toJson()

    expect(result).toBe(JSON.stringify(specification, null, 2))
  })

  it('toYaml', async () => {
    const result = await openapi().load(specification).toYaml()

    expect(result).toBe(stringify(specification))
  })

  it('dereference', async () => {
    const result = await openapi().load(specification).dereference().get()

    expect(result.schema.info.title).toBe('Hello World')
  })

  it('validate > dereference', async () => {
    const validation = await openapi().load(specification).validate()
    expect(validation.valid).toBe(true)

    const result = await validation.dereference().get()
    expect(result.errors).toStrictEqual([])
    expect(result.schema.info.title).toBe('Hello World')
  })
})
