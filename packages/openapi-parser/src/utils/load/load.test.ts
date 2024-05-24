import path from 'node:path'
import { describe, expect, it } from 'vitest'
import YAML from 'yaml'

import { getEntrypoint } from '../getEntrypoint'
import { load } from './load'
import { fetchUrlsPlugin } from './plugins/fetchUrlsPlugin'
import { readFilesPlugin } from './plugins/readFilesPlugin'

describe('load', async () => {
  it('loads JS object', async () => {
    const filesystem = await load(
      {
        openapi: '3.1.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {},
      },
      {
        plugins: [readFilesPlugin, fetchUrlsPlugin],
      },
    )

    expect(getEntrypoint(filesystem).specification).toMatchObject({
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })
  })

  it('loads JSON string', async () => {
    const filesystem = await load(
      JSON.stringify({
        openapi: '3.1.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {},
      }),
      {
        plugins: [readFilesPlugin, fetchUrlsPlugin],
      },
    )

    expect(getEntrypoint(filesystem).specification).toMatchObject({
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })
  })

  it('loads YAML string', async () => {
    const filesystem = await load(
      YAML.stringify({
        openapi: '3.1.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {},
      }),
      {
        plugins: [readFilesPlugin, fetchUrlsPlugin],
      },
    )

    expect(getEntrypoint(filesystem).specification).toMatchObject({
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })
  })

  it('loads file', async () => {
    const EXAMPLE_FILE = path.join(
      new URL(import.meta.url).pathname,
      '../../examples/openapi.yaml',
    )

    const filesystem = await load(EXAMPLE_FILE, {
      plugins: [readFilesPlugin, fetchUrlsPlugin],
    })

    expect(getEntrypoint(filesystem).specification).toMatchObject({
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })
  })

  it('loads referenced files in files', async () => {
    const EXAMPLE_FILE = path.join(
      new URL(import.meta.url).pathname,
      '../../../../tests/filesystem/api/openapi.yaml',
    )

    const filesystem = await load(EXAMPLE_FILE, {
      plugins: [readFilesPlugin],
    })

    // filenames
    expect(filesystem.map((entry) => entry.filename)).toStrictEqual([
      'openapi.yaml',
      'schemas/problem.yaml',
      'schemas/upload.yaml',
      './components/coordinates.yaml',
    ])

    // dirs
    expect(filesystem.map((entry) => entry.dir)).toStrictEqual([
      '/Users/hanspagel/Documents/Projects/openapi-parser/packages/openapi-parser/tests/filesystem/api',
      '/Users/hanspagel/Documents/Projects/openapi-parser/packages/openapi-parser/tests/filesystem/api/schemas',
      '/Users/hanspagel/Documents/Projects/openapi-parser/packages/openapi-parser/tests/filesystem/api/schemas',
      '/Users/hanspagel/Documents/Projects/openapi-parser/packages/openapi-parser/tests/filesystem/api/schemas/components',
    ])

    // specification
    expect(filesystem[0].specification).toBeTypeOf('object')

    // only one entrypoint
    expect(filesystem.filter((entry) => entry.isEntrypoint).length).toBe(1)
  })

  it('loads url', async () => {
    // @ts-expect-error only partially patched
    global.fetch = async () => ({
      text: async () =>
        YAML.stringify({
          openapi: '3.1.0',
          info: {
            title: 'Hello World',
            version: '1.0.0',
          },
          paths: {},
        }),
    })

    const filesystem = await load('https://example.com/openapi.yaml', {
      plugins: [readFilesPlugin, fetchUrlsPlugin],
    })

    expect(getEntrypoint(filesystem).specification).toMatchObject({
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
    })
  })

  it('loads referenced urls', async () => {
    // @ts-expect-error only partially patched
    global.fetch = async (url: string) => {
      if (url === 'https://example.com/openapi.yaml') {
        return {
          text: async () =>
            YAML.stringify({
              openapi: '3.1.0',
              info: {
                title: 'Hello World',
                version: '1.0.0',
              },
              paths: {
                '/foobar': {
                  post: {
                    requestBody: {
                      $ref: 'https://example.com/foobar.json',
                    },
                  },
                },
              },
            }),
        }
      }

      if (url === 'https://example.com/foobar.json') {
        return {
          text: async () =>
            JSON.stringify({
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                    example: 'foobar',
                  },
                },
              },
            }),
        }
      }
    }

    const filesystem = await load('https://example.com/openapi.yaml', {
      plugins: [readFilesPlugin, fetchUrlsPlugin],
    })

    expect(filesystem[0].specification).toMatchObject({
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {
        '/foobar': {
          post: {
            requestBody: {
              $ref: 'https://example.com/foobar.json',
            },
          },
        },
      },
    })

    expect(filesystem[1].specification).toMatchObject({
      content: {
        'application/json': {
          schema: {
            type: 'string',
            example: 'foobar',
          },
        },
      },
    })
  })
})
