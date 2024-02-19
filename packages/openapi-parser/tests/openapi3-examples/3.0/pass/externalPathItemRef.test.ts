import { describe, expect, it } from 'vitest'

import { loadFiles, resolve } from '../../../../src'
import { relativePath } from '../../../../tests/utils'

const EXAMPLE_FILE = relativePath(
  import.meta.url,
  './pass/externalPathItemRef.yaml',
)

describe('externalPathItemRef', () => {
  it('passes', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)
    console.log('FILEZZ', filesystem)
    const result = await resolve(filesystem)

    console.log('result', result)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
