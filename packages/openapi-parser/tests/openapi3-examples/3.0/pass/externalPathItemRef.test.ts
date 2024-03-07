import { describe, expect, it } from 'vitest'

import { loadFiles, resolve } from '../../../../src'
import { relativePath } from '../../../../tests/utils'

const EXAMPLE_FILE = relativePath(
  import.meta.url,
  './pass/externalPathItemRef.yaml',
)

describe.todo('externalPathItemRef', () => {
  it('passes', async () => {
    const filesystem = loadFiles(EXAMPLE_FILE)
    const result = await resolve(filesystem)

    expect(result.valid).toBe(true)
    expect(result.version).toBe('3.0')
  })
})
