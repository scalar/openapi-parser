import { describe, expect, it } from 'vitest'

import { readFilesPlugin } from './readFilesPlugin'

describe('readFilesPlugin', async () => {
  it('returns true for a filename', async () => {
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
