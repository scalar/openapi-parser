import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { stringify } from 'yaml'

import { openapi } from './pipeline'
import { readFiles } from './utils/load/plugins/readFiles'

const example = {
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

describe('pipeline', () => {
  it('load object', async () => {
    const { specification } = await openapi().load(example).get()

    expect(specification.openapi).toBe('3.1.0')
  })

  it('load string', async () => {
    const { specification } = await openapi()
      .load(JSON.stringify(example))
      .get()

    expect(specification.openapi).toBe('3.1.0')
  })

  it('load file', async () => {
    const { specification } = await openapi()
      .load(EXAMPLE_FILE, {
        plugins: [readFiles()],
      })
      .get()

    expect(specification.openapi).toBe('3.1.0')
  })

  it('files', async () => {
    const filesystem = await openapi()
      .load(EXAMPLE_FILE, {
        plugins: [readFiles()],
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
    const { specification } = await openapi()
      .load({
        ...example,
        openapi: '3.0.0',
      })
      .upgrade()
      .get()

    expect(specification.openapi).toBe('3.1.0')
  })

  it('details', async () => {
    const { version } = await openapi()
      .load({
        ...example,
        openapi: '3.0.0',
      })
      .details()

    expect(version).toBe('3.0')
  })

  it('upgrade > dereference', async () => {
    const { version } = await openapi()
      .load({
        ...example,
        openapi: '3.0.0',
      })
      .upgrade()
      .dereference()
      .get()

    expect(version).toBe('3.1')
  })

  it('filter x-internal', async () => {
    const example = {
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

    const { specification } = await openapi()
      .load(example)
      .filter((schema) => !schema?.['x-internal'])
      .get()

    expect(specification.paths['/'].get).toBeUndefined()
    expect(specification.paths['/foobar'].get).not.toBeUndefined()
  })

  it('filter tags', async () => {
    const example = {
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

    const { specification } = await openapi()
      .load(example)
      .filter((schema) => !schema?.tags?.includes('Beta'))
      .get()

    expect(specification.paths['/'].get).toBeUndefined()
    expect(specification.paths['/foobar'].get).not.toBeUndefined()
  })

  it('upgrade > filter', async () => {
    const example = {
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

    const { specification } = await openapi()
      .load(example)
      .upgrade()
      .filter((schema) => !schema?.tags?.includes('Beta'))
      .get()

    expect(specification.openapi).toBe('3.1.0')
    expect(specification.paths['/'].get).toBeUndefined()
    expect(specification.paths['/foobar'].get).not.toBeUndefined()
  })

  it('validate', async () => {
    const result = await openapi().load(example).validate().get()

    expect(result).toMatchObject({
      valid: true,
      version: '3.1',
    })
  })

  it('toJson', async () => {
    const result = await openapi().load(example).toJson()

    expect(result).toBe(JSON.stringify(example, null, 2))
  })

  it('toYaml', async () => {
    const result = await openapi().load(example).toYaml()

    expect(result).toBe(stringify(example))
  })

  it('dereference', async () => {
    const result = await openapi().load(example).dereference().get()

    expect(result.schema.info.title).toBe('Hello World')
  })

  it('validate > dereference', async () => {
    const result = await openapi().load(example).validate().dereference().get()

    expect(result.valid).toBe(true)
    expect(result.errors).toStrictEqual([])
    expect(result.schema.info.title).toBe('Hello World')
  })

  it('throws an error when dereference fails', async () => {
    expect(async () => {
      await openapi({
        throwOnError: true,
      })
        .load({
          openapi: '3.1.0',
          info: {},
          paths: {
            '/foobar': {
              post: {
                requestBody: {
                  $ref: '#/components/requestBodies/DoesNotExist',
                },
              },
            },
          },
        })
        .dereference()
        .get()
    }).rejects.toThrowError(
      'Can’t resolve reference: #/components/requestBodies/DoesNotExist',
    )
  })

  it('throws an error when validate fails', async () => {
    expect(async () => {
      await openapi({
        throwOnError: true,
      })
        .load({
          openapi: '3.1.0',
          info: {
            title: 'Hello World',
          },
          paths: {
            '/foobar': {
              post: {
                requestBody: {
                  $ref: '#/components/requestBodies/DoesNotExist',
                },
              },
            },
          },
        })
        .validate()
        .get()
    }).rejects.toThrowError(
      'Can’t resolve reference: #/components/requestBodies/DoesNotExist',
    )
  })
})
