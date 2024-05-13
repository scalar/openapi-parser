import path from 'node:path'
import { describe, expect, it } from 'vitest'
import YAML from 'yaml'

import { getEntrypoint } from './getEntrypoint'
import { load, loadFilesPlugin } from './load'

describe('isFile', async () => {
  it.only('returns true for a file name', async () => {
    expect(loadFilesPlugin.check('openapi.yaml')).toBe(true)
  })

  it.only('returns true for a path', async () => {
    expect(loadFilesPlugin.check('specification/openapi.yaml')).toBe(true)
  })

  it.only('returns false for an object', async () => {
    expect(loadFilesPlugin.check({})).toBe(false)
  })

  it.only('returns false for undefinded', async () => {
    expect(loadFilesPlugin.check()).toBe(false)
  })

  it.only('returns false for an url', async () => {
    expect(
      loadFilesPlugin.check('http://example.com/specification/openapi.yaml'),
    ).toBe(false)
  })
})

describe('load', async () => {
  it.only('loads file', async () => {
    const filesystem = await load(
      path.join(new URL(import.meta.url).pathname, '../examples/openapi.yaml'),
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

  it('fetches url', async () => {
    const filesystem = await load('https://example.com/openapi.yaml')

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
    const filesystem = await load({
      openapi: '3.1.0',
      info: {
        title: 'Hello World',
        version: '1.0.0',
      },
      paths: {},
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
