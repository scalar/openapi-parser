import path from 'node:path'
import { describe, expect, it } from 'vitest'
import YAML from 'yaml'

import { getEntrypoint } from './getEntrypoint'
import { fetchUrlsPlugin, load, readFilesPlugin } from './load'

describe('isFile', async () => {
  it('returns true for a file name', async () => {
    expect(readFilesPlugin.check('openapi.yaml')).toBe(true)
  })

  it('returns true for a path', async () => {
    expect(readFilesPlugin.check('specification/openapi.yaml')).toBe(true)
  })

  it('returns false for an object', async () => {
    expect(readFilesPlugin.check({})).toBe(false)
  })

  it('returns false for undefinded', async () => {
    expect(readFilesPlugin.check()).toBe(false)
  })

  it('returns false for an url', async () => {
    expect(
      readFilesPlugin.check('http://example.com/specification/openapi.yaml'),
    ).toBe(false)
  })
})

const EXAMPLE_FILE = path.join(
  new URL(import.meta.url).pathname,
  '../examples/openapi.yaml',
)

describe('load', async () => {
  it('loads file', async () => {
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

  it('fetches url', async () => {
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

  it('retrieves JS object', async () => {
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

  it('retrieves JSON string', async () => {
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

  it('retrieves YAML string', async () => {
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
})
