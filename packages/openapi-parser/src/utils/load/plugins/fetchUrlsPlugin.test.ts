import { describe, expect, it } from 'vitest'

import { fetchUrlsPlugin } from './fetchUrlsPlugin'

describe('fetchUrlsPlugin', async () => {
  it('returns true for an url', async () => {
    expect(
      fetchUrlsPlugin().check('http://example.com/specification/openapi.yaml'),
    ).toBe(true)
  })

  it('returns false for a filename', async () => {
    expect(fetchUrlsPlugin().check('openapi.yaml')).toBe(false)
  })

  it('returns false for a path', async () => {
    expect(fetchUrlsPlugin().check('specification/openapi.yaml')).toBe(false)
  })

  it('returns false for an object', async () => {
    expect(fetchUrlsPlugin().check({})).toBe(false)
  })

  it('returns false for undefinded', async () => {
    expect(fetchUrlsPlugin().check()).toBe(false)
  })
})
